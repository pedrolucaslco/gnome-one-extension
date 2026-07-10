import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { RoundedCornersEffect } from './roundedCornersEffect.js';

const EFFECT_NAME = 'one-ext-rounded-corners';

const ROUNDABLE_WINDOW_TYPES = [
    Meta.WindowType.NORMAL,
    Meta.WindowType.DIALOG,
    Meta.WindowType.MODAL_DIALOG,
];

const _appTypeCache = new Map();

function unwrapActor(actor) {
    const win = actor.metaWindow;
    if (win.get_client_type() === Meta.WindowClientType.X11) {
        return actor.get_first_child() ?? actor;
    }
    return actor;
}

export class RoundedCorners {
    constructor(settings) {
        this._settings = settings;
        this._connections = [];
        this._actorData = new WeakMap();
        this._timeoutId = 0;
    }

    enable() {
        this._connectSignal(global.display, 'window-created', (_, win) => {
            this._applyToWindow(win);
        });

        this._connectSignal(global.windowManager, 'destroy', (_, actor) => {
            this._removeFromActor(actor);
        });

        this._connectSignal(global.windowManager, 'minimize', (_, actor) => {
            const target = unwrapActor(actor);
            const fx = target?.get_effect(EFFECT_NAME) ?? null;
            if (fx) fx.enabled = false;
        });

        this._connectSignal(global.windowManager, 'unminimize', (_, actor) => {
            const target = unwrapActor(actor);
            const fx = target?.get_effect(EFFECT_NAME) ?? null;
            if (fx) fx.enabled = true;
        });

        this._connectSignal(this._settings, 'changed', () => {
            this._debouncedRefresh();
        });

        for (const actor of global.get_window_actors()) {
            this._applyToActor(actor);
        }
    }

    disable() {
        for (const actor of global.get_window_actors()) {
            this._removeFromActor(actor);
        }

        for (const c of this._connections) {
            c.object.disconnect(c.id);
        }
        this._connections = [];

        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }

        _appTypeCache.clear();
    }

    _connectSignal(object, signal, callback) {
        this._connections.push({
            object,
            id: object.connect(signal, callback),
        });
    }

    _debouncedRefresh() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
        }
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            _appTypeCache.clear();
            for (const actor of global.get_window_actors()) {
                this._removeFromActor(actor);
                this._applyToActor(actor);
            }
            this._timeoutId = 0;
            return GLib.SOURCE_REMOVE;
        });
    }

    _applyToWindow(win) {
        if (!win) return;
        const actor = win.get_compositor_private();
        if (actor) {
            this._applyToActor(actor);
        }
    }

    _applyToActor(actor) {
        if (!actor?.metaWindow) return;

        const win = actor.metaWindow;
        if (!this._shouldApply(win)) return;

        const target = unwrapActor(actor);
        if (target.get_effect(EFFECT_NAME)) {
            this._refreshEffect(actor);
            return;
        }

        const effect = new RoundedCornersEffect();
        target.add_effect_with_name(EFFECT_NAME, effect);

        const data = { connections: [] };
        this._actorData.set(actor, data);

        const addConn = (obj, sig, cb) => {
            if (obj) data.connections.push({ obj, id: obj.connect(sig, cb) });
        };

        addConn(actor, 'notify::size', () => this._refreshEffect(actor));
        addConn(win, 'notify::fullscreen', () => this._refreshEffect(actor));
        addConn(win, 'notify::maximized-vertically', () => this._refreshEffect(actor));
        addConn(win, 'notify::maximized-horizontally', () => this._refreshEffect(actor));

        this._refreshEffect(actor);
    }

    _removeFromActor(actor) {
        if (!actor) return;

        const target = unwrapActor(actor);
        try {
            target.remove_effect_by_name(EFFECT_NAME);
        } catch (_) {}

        const data = this._actorData.get(actor);
        if (!data) return;

        for (const c of data.connections) {
            try { c.obj.disconnect(c.id); } catch (_) {}
        }

        this._actorData.delete(actor);
    }

    _refreshEffect(actor) {
        if (!actor?.metaWindow) return;

        const win = actor.metaWindow;
        if (!this._shouldApply(win)) {
            this._removeFromActor(actor);
            return;
        }

        const target = unwrapActor(actor);
        const fx = target?.get_effect(EFFECT_NAME) ?? null;
        if (!fx) {
            this._applyToActor(actor);
            return;
        }

        if (!fx.enabled) fx.enabled = true;

        const idx = win.get_monitor();
        const scale = global.display.get_monitor_scale(idx);
        const radius = this._settings.get_int('rounded-corners-radius');
        const smoothing = this._settings.get_double('rounded-corners-smoothing');

        const bounds = this._computeBounds(actor);
        fx.updateUniforms(scale, radius, smoothing, bounds);
    }

    _computeBounds(actor) {
        const win = actor.metaWindow;
        const buf = win.get_buffer_rect();
        const frame = win.get_frame_rect();

        const offsetX = frame.x - buf.x;
        const offsetY = frame.y - buf.y;
        const offsetW = frame.width - buf.width;
        const offsetH = frame.height - buf.height;

        return {
            x1: offsetX + 1,
            y1: offsetY + 1,
            x2: offsetX + actor.width + offsetW,
            y2: offsetY + actor.height + offsetH,
        };
    }

    _shouldApply(win) {
        if (!this._settings.get_boolean('rounded-corners-enabled')) return false;

        const windowType = win.windowType ?? win.get_window_type?.();
        if (!ROUNDABLE_WINDOW_TYPES.includes(windowType)) return false;

        if (win.maximized_horizontally || win.maximized_vertically) return false;
        if (win.fullscreen) return false;

        const appType = this._getAppType(win);
        if (appType === 'LibAdwaita' && this._settings.get_boolean('skip-libadwaita')) return false;
        if (appType === 'LibHandy' && this._settings.get_boolean('skip-libhandy')) return false;

        return true;
    }

    _getAppType(win) {
        const pid = win.get_pid();
        if (_appTypeCache.has(pid)) return _appTypeCache.get(pid);

        if (_appTypeCache.size > 200) _appTypeCache.clear();

        let type = 'Other';
        try {
            const decoder = new TextDecoder();
            const [, bytes] = GLib.file_get_contents(`/proc/${pid}/maps`);
            const maps = decoder.decode(bytes);
            if (maps.includes('libadwaita-1.so')) type = 'LibAdwaita';
            else if (maps.includes('libhandy-1.so')) type = 'LibHandy';
        } catch (_) {}

        _appTypeCache.set(pid, type);
        return type;
    }
}
