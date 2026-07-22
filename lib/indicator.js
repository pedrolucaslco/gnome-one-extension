import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { StopwatchView } from './views/stopwatchView.js';
import { ProcessListView } from './views/processListView.js';
import { CircularIndicator } from './utils/circularIndicator.js';
import { State } from './stopwatch.js';

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'One Extension', false);

        this._extension = extension;
        this._stopwatch = null;
        this._currentView = null;
        this._stopwatchSubId = null;
        this._stopwatchStateSubId = null;
        this._systemMonitorSubId = null;
        this._processListView = null;

        this._panelIcon = new St.Icon({
            icon_name: 'applications-utilities-symbolic',
            style_class: 'system-status-icon',
            accessible_name: 'One Extension',
        });

        this._panelRamIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${extension.path}/lib/icons/memory-symbolic.svg`),
            style_class: 'system-status-icon',
            visible: false,
        });

        this._panelRamLabel = new St.Label({
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._panelStopwatchIcon = new St.Icon({
            icon_name: 'alarm-symbolic',
            style_class: 'system-status-icon',
            visible: false,
        });

        this._panelTimer = new St.Label({
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
        });

        // IMPORTANT: PanelMenu.Button (St.Button) expects a single child.
        // Always use a BoxLayout wrapper when combining icon + other widgets.
        // Do NOT add multiple children directly to this.add_child().
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._panelBox.add_child(this._panelStopwatchIcon);
        this._panelBox.add_child(this._panelTimer);
        this._panelBox.add_child(this._panelRamIcon);
        this._panelBox.add_child(this._panelRamLabel);
        this._panelBox.add_child(this._panelIcon);
        this.add_child(this._panelBox);

        // Fixed menu slots — order is guaranteed
        this._monitorSlot = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this._monitorSlot.visible = false;
        this.menu.addMenuItem(this._monitorSlot);

        // Toggled open by clicking the RAM ring — see setupSystemMonitor()
        this._processSlot = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this._processSlot.visible = false;
        this.menu.addMenuItem(this._processSlot);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._stopwatchSlot = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this._stopwatchSlot.visible = false;
        this.menu.addMenuItem(this._stopwatchSlot);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        const settingsIcon = new St.Icon({
            icon_name: 'emblem-system-symbolic',
            style_class: 'popup-menu-icon',
        });
        settingsItem.insert_child_below(settingsIcon, settingsItem.label);
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);

        this.menu.connect('open-state-changed', (_menu, isOpen) => {
            if (isOpen && this._processSlot.visible && this._processListView)
                this._processListView.refresh();
        });
    }

    // Temporarily disabled: the RAM ring no longer wires into this (see
    // setupSystemMonitor()), so this is unreachable for now. Kept as-is,
    // along with _processSlot/_processListView, so the feature is a single
    // click handler away from being turned back on.
    _toggleProcessList() {
        if (this._processSlot.visible) {
            this._processSlot.visible = false;
            return;
        }

        if (!this._processListView) {
            this._processListView = new ProcessListView();
            this._processSlot.add_child(this._processListView.actor);
        } else {
            this._processListView.refresh();
        }
        this._processSlot.visible = true;
    }

    setupStopwatch(stopwatch) {
        this._stopwatch = stopwatch;

        this._currentView = new StopwatchView(this._stopwatch);
        this._stopwatchSlot.add_child(this._currentView.actor);
        this._stopwatchSlot.visible = true;

        this._stopwatchStateSubId = this._stopwatch.subscribe('state_change', (state) => {
            if (state === State.RESET) {
                this._panelTimer.set_text('');
                this._panelStopwatchIcon.visible = false;
            }
        });

        this._stopwatchSubId = this._stopwatch.subscribe('tic', (total) => {
            const cs = Math.floor(total / 10) % 100;
            const s = Math.floor(total / 1000) % 60;
            const m = Math.floor(total / 60000) % 60;
            const h = Math.floor(total / 3600000);
            const pad = (n) => n.toString().padStart(2, '0');
            const time = `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
            this._panelStopwatchIcon.visible = true;
            this._panelStopwatchIcon.accessible_name = `Stopwatch: ${time}`;
            this._panelTimer.set_text(time);
        });
    }

    teardownStopwatch() {
        if (this._stopwatchStateSubId && this._stopwatch) {
            this._stopwatch.unsubscribe(this._stopwatchStateSubId);
            this._stopwatchStateSubId = null;
        }
        if (this._stopwatchSubId && this._stopwatch) {
            this._stopwatch.unsubscribe(this._stopwatchSubId);
            this._stopwatchSubId = null;
        }
        if (this._currentView) {
            this._currentView.destroy();
            this._currentView = null;
        }
        this._panelTimer.set_text('');
        this._panelStopwatchIcon.visible = false;
        this._stopwatchSlot.visible = false;
    }

    setupSystemMonitor(monitor) {
        this._systemMonitor = monitor;

        const indicatorsBox = new St.BoxLayout({
            style_class: 'system-monitor-indicators',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        this._indicators = {};
        const configs = [
            { key: 'cpu', label: 'CPU', icon: 'cpu-symbolic' },
            { key: 'ram', label: 'RAM', icon: 'memory-symbolic' },
            { key: 'disk', label: 'DISK', icon: 'drive-harddisk-symbolic' },
        ];

        const iconPath = this._extension.path + '/lib/icons/';

        for (const cfg of configs) {
            const col = new St.BoxLayout({
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER,
                style: 'spacing: 2px;',
            });

            const ringContainer = new Clutter.Actor({
                width: 64,
                height: 64,
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
            });
            ringContainer.layout_manager = new Clutter.BinLayout();

            const ring = new CircularIndicator({
                width: 64,
                height: 64,
                x_expand: true,
                y_expand: true,
                style_class: 'circular-indicator',
            });

            const contentBox = new St.BoxLayout({
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
                style: 'spacing: 4px;',
            });

            const icon = new St.Icon({
                gicon: Gio.icon_new_for_string(iconPath + cfg.icon + '.svg'),
                style_class: 'circular-indicator-icon',
                x_align: Clutter.ActorAlign.CENTER,
            });

            const abbrLabel = new St.Label({
                text: cfg.label === 'RAM' ? 'MEM' : cfg.label,
                style_class: 'system-monitor-abbr',
                x_align: Clutter.ActorAlign.CENTER,
            });

            contentBox.add_child(icon);
            contentBox.add_child(abbrLabel);

            ringContainer.add_child(ring);
            ringContainer.add_child(contentBox);

            // NOTE: the RAM ring used to double as the entry point to the
            // process list (wrapped in an St.Button toggling _processSlot via
            // _toggleProcessList()). That feature is temporarily disabled —
            // see _toggleProcessList()'s comment — so every ring is currently
            // a plain, non-interactive container.
            const interactiveWrapper = ringContainer;
            interactiveWrapper.accessible_name = `${cfg.label}: 0%`;

            const percentLabel = new St.Label({
                text: '0%',
                style_class: 'system-monitor-label',
                x_align: Clutter.ActorAlign.CENTER,
            });

            const valueLabel = new St.Label({
                text: '',
                style_class: 'system-monitor-value',
                x_align: Clutter.ActorAlign.CENTER,
            });

            col.add_child(interactiveWrapper);
            col.add_child(percentLabel);
            col.add_child(valueLabel);
            indicatorsBox.add_child(col);

            this._indicators[cfg.key] = { ring, percentLabel, valueLabel, container: interactiveWrapper };
        }

        this._monitorSlot.add_child(indicatorsBox);
        this._monitorSlot.visible = true;

        this._systemMonitorSubId = monitor.subscribe('updated', (data) => {
            this._updateIndicators(data);
        });
    }

    teardownSystemMonitor() {
        if (this._systemMonitorSubId && this._systemMonitor) {
            this._systemMonitor.unsubscribe(this._systemMonitorSubId);
            this._systemMonitorSubId = null;
        }
        this._monitorSlot.destroy_all_children();
        this._indicators = null;
        this._monitorSlot.visible = false;
        this._panelRamLabel.set_text('');
        this._panelRamIcon.visible = false;

        if (this._processListView) {
            this._processListView.destroy();
            this._processListView = null;
        }
        this._processSlot.destroy_all_children();
        this._processSlot.visible = false;
    }

    _updateIndicators({ cpu, ram, disk }) {
        const toAngle = (pct) => (pct / 100) * 2 * Math.PI;

        this._panelRamIcon.visible = true;
        this._panelRamLabel.set_text(ram.label);

        const map = { cpu, ram, disk };
        for (const [key, data] of Object.entries(map)) {
            const ind = this._indicators[key];
            if (!ind) continue;

            ind.ring.set_angle(toAngle(data.percent));

            ind.percentLabel.set_text(data.label);
            ind.valueLabel.set_text(data.used || '');

            if (ind.container)
                ind.container.accessible_name = `${key.toUpperCase()}: ${data.label}`;
        }
    }
});
