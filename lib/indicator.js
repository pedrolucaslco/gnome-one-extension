import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'One Extension', false);

        this._extension = extension;
        this._stopwatch = null;
        this._lapItems = [];
        this._laps = [];

        // Main icon
        this._mainIcon = new St.Icon({
            icon_name: 'applications-utilities-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(this._mainIcon);

        // Stopwatch panel label (hidden by default)
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

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Stopwatch header
        const header = new PopupMenu.PopupMenuItem('Stopwatch', { reactive: false });
        header.label.set_style('font-weight: bold; font-size: 14px;');
        this.menu.addMenuItem(header);

        // Time display
        this._menuTimeLabel = new PopupMenu.PopupMenuItem('00:00:00.00', { reactive: false });
        this._menuTimeLabel.label.set_style('font-size: 20px; font-weight: bold; font-family: monospace;');
        this.menu.addMenuItem(this._menuTimeLabel);

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Group buttons container
        const buttonItem = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this._buttonBox = new St.BoxLayout({
            x_expand: true,
            style: 'spacing: 8px; margin: 8px 12px;',
        });
        buttonItem.add_child(this._buttonBox);
        this.menu.addMenuItem(buttonItem);

        // Create buttons (St.Button doesn't close the menu)
        this._btnStart = this._makeButton('Start');
        this._btnStart.connect('clicked', () => stopwatch.start());

        this._btnPause = this._makeButton('Pause');
        this._btnPause.connect('clicked', () => stopwatch.pause());

        this._btnResume = this._makeButton('Resume');
        this._btnResume.connect('clicked', () => stopwatch.resume());

        this._btnReset = this._makeButton('Reset');
        this._btnReset.connect('clicked', () => stopwatch.reset());

        this._btnLap = this._makeButton('Lap');
        this._btnLap.connect('clicked', () => stopwatch.lap());

        // Lap separator
        this._lapSeparator = new PopupMenu.PopupSeparatorMenuItem();
        this._lapSeparator.visible = false;
        this.menu.addMenuItem(this._lapSeparator);

        // Lap header
        this._lapHeader = new PopupMenu.PopupMenuItem('Laps:', { reactive: false });
        this._lapHeader.label.set_style('font-weight: bold;');
        this._lapHeader.visible = false;
        this.menu.addMenuItem(this._lapHeader);

        // Listen to stopwatch events
        stopwatch.setCallback('stateChange', (state) => this._updateUI(state));
        stopwatch.setCallback('tic', (times) => this._updateTime(times.total));
        stopwatch.setCallback('lap', (laps) => this._updateLaps(laps));

        this._updateUI(stopwatch.state);
    }

    _makeButton(label) {
        const btn = new St.Button({
            label,
            x_expand: true,
            x_fill: true,
            style: 'border-radius: 8px; padding: 8px 16px; font-weight: bold; background: #3584e4; color: white;',
            reactive: true,
        });
        btn.connect('hover', () => {
            btn.set_style('border-radius: 8px; padding: 8px 16px; font-weight: bold; background: #2974d0; color: white;');
        });
        btn.connect('leave', () => {
            btn.set_style('border-radius: 8px; padding: 8px 16px; font-weight: bold; background: #3584e4; color: white;');
        });
        return btn;
    }

    _clearButtons() {
        const children = this._buttonBox.get_children();
        for (const child of children) {
            this._buttonBox.remove_child(child);
        }
    }

    _updateUI(state) {
        if (!this._btnStart) return;

        const isRunning = state === 0;
        const isPaused = state === 1;
        const isReset = state === 2;

        // Show panel label when running or paused
        this._panelBox.visible = !isReset;

        this._clearButtons();

        if (isReset) {
            this._buttonBox.add_child(this._btnStart);
            this._menuTimeLabel.label.set_text('00:00:00.00');
            this._panelTimeLabel.set_text('00:00:00');
            this._laps = [];
            this._renderLaps();
        } else if (isRunning) {
            this._buttonBox.add_child(this._btnPause);
            this._buttonBox.add_child(this._btnLap);
        } else if (isPaused) {
            this._buttonBox.add_child(this._btnResume);
            this._buttonBox.add_child(this._btnReset);
        }
    }

    _updateTime(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s  = Math.floor(totalMs / 1000) % 60;
        const m  = Math.floor(totalMs / 60000) % 60;
        const h  = Math.floor(totalMs / 3600000);

        const pad = (n) => n.toString().padStart(2, '0');
        const full = `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
        const short = `${pad(h)}:${pad(m)}:${pad(s)}`;

        if (this._menuTimeLabel) {
            this._menuTimeLabel.label.set_text(full);
        }
        if (this._panelTimeLabel) {
            this._panelTimeLabel.set_text(short);
        }
    }

    _updateLaps(laps) {
        this._laps = laps;
        this._renderLaps();
    }

    _renderLaps() {
        if (this._lapItems) {
            for (const item of this._lapItems) {
                item.destroy();
            }
        }
        this._lapItems = [];

        const hasLaps = this._laps.length > 0;
        this._lapSeparator.visible = hasLaps;
        this._lapHeader.visible = hasLaps;

        if (!hasLaps) return;

        const maxShow = Math.min(this._laps.length, 5);
        for (let i = 0; i < maxShow; i++) {
            const lap = this._laps[i];
            const lapTime = this._formatTime(lap.lap);
            const totalTime = this._formatTime(lap.total);
            const item = new PopupMenu.PopupMenuItem(
                `#${this._laps.length - i}  Lap: ${lapTime}  Total: ${totalTime}`,
                { reactive: false }
            );
            item.label.set_style('font-family: monospace; font-size: 11px;');
            this.menu.addMenuItem(item);
            this._lapItems.push(item);
        }
    }

    _formatTime(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s  = Math.floor(totalMs / 1000) % 60;
        const m  = Math.floor(totalMs / 60000) % 60;
        const h  = Math.floor(totalMs / 3600000);

        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
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
