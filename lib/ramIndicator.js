import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { ProcessListView } from './views/processListView.js';
import { readMemInfo } from './memInfo.js';

export const RamIndicator = GObject.registerClass(
class RamIndicator extends PanelMenu.Button {
    _init(settings, extensionPath) {
        super._init(0.0, 'RAM Indicator', false);

        this._settings = settings;
        this._timerId = 0;
        this._processListView = null;
        this._aboveThreshold = false;

        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${extensionPath}/lib/icons/memory-symbolic.svg`),
            style_class: 'system-status-icon',
        });

        this._label = new St.Label({
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._box = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._box.add_child(this._icon);
        this._box.add_child(this._label);
        this.add_child(this._box);

        this._setupMenu();
        this._update();
        this.enable();
    }

    _setupMenu() {
        this._processSlot = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this._processSlot.visible = false;
        this.menu.addMenuItem(this._processSlot);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const refreshSlot = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this.menu.addMenuItem(refreshSlot);

        const refreshBtn = new St.Button({
            style_class: 'stopwatch-icon-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
        });
        const refreshIcon = new St.Icon({
            icon_name: 'view-refresh-symbolic',
            style_class: 'popup-menu-icon',
        });
        refreshBtn.add_child(refreshIcon);
        refreshBtn.connect('clicked', () => {
            this._refreshProcessList();
        });
        refreshSlot.add_child(refreshBtn);

        this.menu.connect('open-state-changed', (_menu, isOpen) => {
            if (isOpen)
                this._refreshProcessList();
        });
    }

    _refreshProcessList() {
        if (!this._processListView) {
            this._processListView = new ProcessListView();

            this._processSlot.add_child(this._processListView.actor);
            this._processSlot.visible = true;
        } else {
            this._processListView.refresh();
        }
    }

    enable() {
        if (this._timerId) return;
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            this._settings.get_int('system-monitor-interval'),
            () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    disable() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }
    }

    destroy() {
        this.disable();
        if (this._processListView) {
            this._processListView.destroy();
            this._processListView = null;
        }
        super.destroy();
    }

    _update() {
        if (!this._label) return;
        try {
            const { percent } = readMemInfo();

            this._label.set_text(`${Math.round(percent)}%`);
            this.accessible_name = `RAM: ${Math.round(percent)}%`;

            if (this._settings.get_boolean('ram-indicator-notify')) {
                const threshold = this._settings.get_int('ram-indicator-threshold');
                if (percent >= threshold && !this._aboveThreshold) {
                    Main.notify(
                        'RAM Warning',
                        `RAM usage is at ${Math.round(percent)}%. Consider closing some applications.`
                    );
                    this._aboveThreshold = true;
                } else if (percent < threshold) {
                    this._aboveThreshold = false;
                }
            }
        } catch {
            this._label.set_text('N/A');
            this.accessible_name = 'RAM: N/A';
        }
    }
});
