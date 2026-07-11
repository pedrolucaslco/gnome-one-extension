import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { StopwatchView } from './views/stopwatchView.js';

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'One Extension', false);

        this._extension = extension;
        this._stopwatch = null;
        this._currentView = null;

        this._mainIcon = new St.Icon({
            icon_name: 'applications-utilities-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(this._mainIcon);

        this._panelBox = new St.BoxLayout({ visible: false, style: 'spacing: 4px;' });
        const swIcon = new St.Icon({
            icon_name: 'preferences-system-time-symbolic',
            style_class: 'system-status-icon',
        });
        this._panelTimeLabel = new St.Label({
            text: '00:00:00',
            y_align: Clutter.ActorAlign.CENTER,
            style: 'font-size: 11px; font-weight: bold;',
        });
        this._panelBox.add_child(swIcon);
        this._panelBox.add_child(this._panelTimeLabel);
        this.add_child(this._panelBox);
    }

    setupStopwatch(stopwatch) {
        this._stopwatch = stopwatch;
        this._showMainView();
    }

    _showMainView() {
        if (this._currentView)
            this._currentView.destroy();

        this._currentView = new StopwatchView(this._stopwatch, () => this._showSettings());
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const wrapper = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        wrapper.add_child(this._currentView.actor);
        this.menu.addMenuItem(wrapper);

        this._stopwatch.subscribe('state_change', (state) => {
            this._panelBox.visible = state !== 2;
        });
        this._stopwatch.subscribe('tic', (total) => {
            const s = Math.floor(total / 1000) % 60;
            const m = Math.floor(total / 60000) % 60;
            const h = Math.floor(total / 3600000);
            const pad = (n) => n.toString().padStart(2, '0');
            this._panelTimeLabel.set_text(`${pad(h)}:${pad(m)}:${pad(s)}`);
        });
    }

    _showSettings() {
        if (this._currentView)
            this._currentView.destroy();

        this._currentView = null;
        this._extension.openPreferences();
    }

    setupSettings() {
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }
});
