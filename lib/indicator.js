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
        this._stopwatchLabel = null;
        this._startItem = null;
        this._pauseItem = null;
        this._resumeItem = null;
        this._resetItem = null;
        this._lapItem = null;
        this._lapSeparator = null;
        this._lapBox = null;
        this._laps = [];

        const icon = new St.Icon({
            icon_name: 'applications-utilities-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(icon);
    }

    setupStopwatch(stopwatch) {
        this._stopwatch = stopwatch;

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Stopwatch header
        this._stopwatchHeader = new PopupMenu.PopupMenuItem('Stopwatch', { reactive: false });
        this._stopwatchHeader.label.set_style('font-weight: bold; font-size: 14px;');
        this.menu.addMenuItem(this._stopwatchHeader);

        // Time display
        this._stopwatchLabel = new PopupMenu.PopupMenuItem('00:00:00.00', { reactive: false });
        this._stopwatchLabel.label.set_style('font-size: 20px; font-weight: bold; font-family: monospace;');
        this.menu.addMenuItem(this._stopwatchLabel);

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Start button
        this._startItem = new PopupMenu.PopupMenuItem('Start');
        this._startItem.connect('activate', () => stopwatch.start());
        this.menu.addMenuItem(this._startItem);

        // Pause button
        this._pauseItem = new PopupMenu.PopupMenuItem('Pause');
        this._pauseItem.connect('activate', () => stopwatch.pause());
        this.menu.addMenuItem(this._pauseItem);

        // Resume button
        this._resumeItem = new PopupMenu.PopupMenuItem('Resume');
        this._resumeItem.connect('activate', () => stopwatch.resume());
        this.menu.addMenuItem(this._resumeItem);

        // Reset button
        this._resetItem = new PopupMenu.PopupMenuItem('Reset');
        this._resetItem.connect('activate', () => stopwatch.reset());
        this.menu.addMenuItem(this._resetItem);

        // Lap button
        this._lapItem = new PopupMenu.PopupMenuItem('Lap');
        this._lapItem.connect('activate', () => stopwatch.lap());
        this.menu.addMenuItem(this._lapItem);

        // Lap separator
        this._lapSeparator = new PopupMenu.PopupSeparatorMenuItem();
        this._lapSeparator.visible = false;
        this.menu.addMenuItem(this._lapSeparator);

        // Lap box
        this._lapBox = new PopupMenu.PopupMenuItem('Laps:', { reactive: false });
        this._lapBox.label.set_style('font-weight: bold;');
        this._lapBox.visible = false;
        this.menu.addMenuItem(this._lapBox);

        // Listen to stopwatch events
        stopwatch.setCallback('stateChange', (state) => this._updateUI(state));
        stopwatch.setCallback('tic', (times) => this._updateTime(times.total));
        stopwatch.setCallback('lap', (laps) => this._updateLaps(laps));

        this._updateUI(stopwatch.state);
    }

    _updateUI(state) {
        if (!this._startItem) return;

        const isRunning = state === 0;  // RUNNING
        const isPaused = state === 1;   // PAUSED
        const isReset = state === 2;    // RESET

        this._startItem.visible = isReset;
        this._pauseItem.visible = isRunning;
        this._resumeItem.visible = isPaused;
        this._resetItem.visible = isPaused;
        this._lapItem.visible = isRunning;

        if (isReset) {
            this._stopwatchLabel.label.set_text('00:00:00.00');
            this._laps = [];
            this._renderLaps();
        }
    }

    _updateTime(totalMs) {
        if (!this._stopwatchLabel) return;
        const cs = Math.floor(totalMs / 10) % 100;
        const s  = Math.floor(totalMs / 1000) % 60;
        const m  = Math.floor(totalMs / 60000) % 60;
        const h  = Math.floor(totalMs / 3600000);

        const pad = (n) => n.toString().padStart(2, '0');
        this._stopwatchLabel.label.set_text(`${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`);
    }

    _updateLaps(laps) {
        this._laps = laps;
        this._renderLaps();
    }

    _renderLaps() {
        // Remove old lap items
        if (this._lapItems) {
            for (const item of this._lapItems) {
                item.destroy();
            }
        }
        this._lapItems = [];

        const hasLaps = this._laps.length > 0;
        this._lapSeparator.visible = hasLaps;
        this._lapBox.visible = hasLaps;

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
