import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { RoundedCornersEffect } from './roundedCornersEffect.js';

const EFFECT_NAME = 'one-ext-rounded-corners';

const ROUNDABLE_WINDOW_TYPES = [
    Meta.WindowType.NORMAL,
    Meta.WindowType.DIALOG,
    Meta.WindowType.MODAL_DIALOG,
    Meta.WindowType.UTILITY,
];

const _appTypeCache = new Map();

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
            const fx = this._getEffect(actor);
            if (fx) fx.enabled = false;
        });

        this._connectSignal(global.windowManager, 'unminimize', (_, actor) => {
            const fx = this._getEffect(actor);
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

        if (actor.get_effect(EFFECT_NAME)) {
            this._refreshEffect(actor);
            return;
        }

        if (!actor.get_first_child?.()) {
            const id = actor.connect('notify::first-child', () => {
                actor.disconnect(id);
                this._applyToActor(actor);
            });
            return;
        }

        const effect = new RoundedCornersEffect();
        actor.add_effect_with_name(EFFECT_NAME, effect);

        const data = { connections: [] };
        this._actorData.set(actor, data);

        const addConn = (obj, sig, cb) => {
            if (obj) data.connections.push({ obj, id: obj.connect(sig, cb) });
        };

        addConn(actor, 'notify::size', () => this._refreshEffect(actor));
        addConn(win, 'notify::fullscreen', () => this._refreshEffect(actor));

        this._refreshEffect(actor);
    }

    _removeFromActor(actor) {
        if (!actor) return;

        try {
            actor.remove_effect_by_name(EFFECT_NAME);
        } catch (_) {}

        const data = this._actorData.get(actor);
        if (!data) return;

        for (const c of data.connections) {
            try { c.obj.disconnect(c.id); } catch (_) {}
        }

        this._actorData.delete(actor);
    }

    _getEffect(actor) {
        return actor?.get_effect(EFFECT_NAME) ?? null;
    }

    _refreshEffect(actor) {
        if (!actor?.metaWindow) return;

        const win = actor.metaWindow;
        if (!this._shouldApply(win)) {
            this._removeFromActor(actor);
            return;
        }

        const fx = this._getEffect(actor);
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

        const dx = frame.x - buf.x;
        const dy = frame.y - buf.y;
        const dw = frame.width - buf.width;
        const dh = frame.height - buf.height;

        const target = this._findTextureActor(actor) ?? actor;
        const w = target.width;
        const h = target.height;

        const idx = win.get_monitor();
        const sc = global.display.get_monitor_scale(idx);

        let x1 = dx;
        let y1 = dy;
        let x2 = dx + w + dw;
        let y2 = dy + h + dh;

        if (x1 === 0) x1 += sc;
        if (y1 === 0) y1 += sc;
        if (x2 === w) x2 -= sc;
        if (y2 === h) y2 -= sc;

        return { x1, y1, x2, y2 };
    }

    _findTextureActor(actor) {
        if (!actor) return null;
        if (actor.get_texture?.()) return actor;

        let child = actor.get_first_child?.() ?? null;
        while (child) {
            const found = this._findTextureActor(child);
            if (found) return found;
            child = child.get_next_sibling?.() ?? null;
        }
        return null;
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
