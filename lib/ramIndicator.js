import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { ProcessListView } from './views/processListView.js';

export const RamIndicator = GObject.registerClass(
class RamIndicator extends PanelMenu.Button {
    _init(settings, extensionPath) {
        super._init(0.0, 'RAM Indicator', false);

        this._settings = settings;
        this._timerId = 0;
        this._processListView = null;

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

        const refreshItem = new PopupMenu.PopupMenuItem('Refresh');
        const refreshIcon = new St.Icon({
            icon_name: 'view-refresh-symbolic',
            style_class: 'popup-menu-icon',
        });
        refreshItem.insert_child_below(refreshIcon, refreshItem.label);
        refreshItem.connect('activate', () => {
            this._refreshProcessList();
        });
        this.menu.addMenuItem(refreshItem);

        this.menu.connect('open-state-changed', (_menu, isOpen) => {
            if (isOpen)
                this._refreshProcessList();
        });
    }

    // _refreshProcessList() {
    //     this._processSlot.destroy_all_children();

    //     this._processListView = new ProcessListView();
    //     this._processSlot.add_child(this._processListView.actor);
    //     this._processSlot.visible = true;
    // }

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
            const content = GLib.file_get_contents('/proc/meminfo')[1];
            const text = new TextDecoder().decode(content);

            const getValue = (key) => {
                const match = text.match(new RegExp(`${key}:\\s+(\\d+)`));
                return match ? parseInt(match[1]) : 0;
            };

            const totalKB = getValue('MemTotal');
            const availableKB = getValue('MemAvailable');
            const usedKB = totalKB - availableKB;
            const percent = totalKB > 0 ? (usedKB / totalKB) * 100 : 0;

            this._label.set_text(`${Math.round(percent)}%`);
            this.accessible_name = `RAM: ${Math.round(percent)}%`;
        } catch {
            this._label.set_text('N/A');
            this.accessible_name = 'RAM: N/A';
        }
    }
});
