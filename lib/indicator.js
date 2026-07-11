import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const BUTTON_STYLE = `
    padding: 6px 16px;
    font-weight: bold;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.08);
`;

const BUTTON_HOVER_STYLE = `
    padding: 6px 16px;
    font-weight: bold;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.2);
`;

const BUTTON_GROUP_STYLE = 'spacing: 1px;';
const BUTTON_FIRST_STYLE = 'border-radius: 10px 0 0 10px;';
const BUTTON_LAST_STYLE = 'border-radius: 0 10px 10px 0;';
const BUTTON_SOLO_STYLE = 'border-radius: 10px;';

function makeButton(label) {
    const btn = new St.BoxLayout({
        reactive: true,
        can_focus: true,
        track_hover: true,
        x_expand: true,
        style: BUTTON_STYLE,
    });

    const lbl = new St.Label({
        text: label,
        x_expand: true,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
        style: 'font-size: 13px;',
    });
    btn.add_child(lbl);

    btn.connect('button-release-event', (_actor, event) => {
        if (event.get_button() === Clutter.BUTTON_PRIMARY && btn._onClick)
            btn._onClick();
    });
    btn.connect('enter-event', () => btn.set_style(BUTTON_HOVER_STYLE));
    btn.connect('leave-event', () => btn.set_style(BUTTON_STYLE));

    return btn;
}

function makeButtonBox() {
    const box = new St.BoxLayout({
        x_expand: true,
        style: BUTTON_GROUP_STYLE,
    });
    box.layout_manager.homogeneous = true;
    return box;
}

function applyGroupStyle(box) {
    const children = box.get_children();
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (children.length === 1) {
            child.set_style(BUTTON_STYLE + BUTTON_SOLO_STYLE);
        } else if (i === 0) {
            child.set_style(BUTTON_STYLE + BUTTON_FIRST_STYLE);
        } else if (i === children.length - 1) {
            child.set_style(BUTTON_STYLE + BUTTON_LAST_STYLE);
        } else {
            child.set_style(BUTTON_STYLE);
        }
    }
}

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

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const header = new PopupMenu.PopupMenuItem('Stopwatch', { reactive: false });
        header.label.set_style('font-weight: bold; font-size: 14px;');
        this.menu.addMenuItem(header);

        this._menuTimeLabel = new PopupMenu.PopupMenuItem('00:00:00.00', { reactive: false });
        this._menuTimeLabel.label.set_style('font-size: 20px; font-weight: bold; font-family: monospace;');
        this.menu.addMenuItem(this._menuTimeLabel);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Button box (always in the menu, buttons hidden/shown per state)
        this._buttonBox = makeButtonBox();

        const wrapper = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        wrapper.add_child(this._buttonBox);
        this.menu.addMenuItem(wrapper);

        this._btnStart = makeButton('Start');
        this._btnStart._onClick = () => stopwatch.start();

        this._btnPause = makeButton('Pause');
        this._btnPause._onClick = () => stopwatch.pause();

        this._btnResume = makeButton('Resume');
        this._btnResume._onClick = () => stopwatch.resume();

        this._btnReset = makeButton('Reset');
        this._btnReset._onClick = () => stopwatch.reset();

        this._btnLap = makeButton('Lap');
        this._btnLap._onClick = () => stopwatch.lap();

        this._buttonBox.add_child(this._btnStart);
        this._buttonBox.add_child(this._btnPause);
        this._buttonBox.add_child(this._btnResume);
        this._buttonBox.add_child(this._btnReset);
        this._buttonBox.add_child(this._btnLap);

        this._lapSeparator = new PopupMenu.PopupSeparatorMenuItem();
        this._lapSeparator.visible = false;
        this.menu.addMenuItem(this._lapSeparator);

        this._lapHeader = new PopupMenu.PopupMenuItem('Laps:', { reactive: false });
        this._lapHeader.label.set_style('font-weight: bold;');
        this._lapHeader.visible = false;
        this.menu.addMenuItem(this._lapHeader);

        stopwatch.setCallback('stateChange', (state) => this._updateUI(state));
        stopwatch.setCallback('tic', (times) => this._updateTime(times.total));
        stopwatch.setCallback('lap', (laps) => this._updateLaps(laps));

        this._updateUI(stopwatch.state);
    }

    _updateUI(state) {
        if (!this._btnStart) return;

        const isRunning = state === 0;
        const isPaused = state === 1;
        const isReset = state === 2;

        this._panelBox.visible = !isReset;

        // Hide all, then show per state
        this._btnStart.hide();
        this._btnPause.hide();
        this._btnResume.hide();
        this._btnReset.hide();
        this._btnLap.hide();

        // Remove old children and re-add only visible ones
        for (const child of this._buttonBox.get_children())
            this._buttonBox.remove_child(child);

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

        // Show only buttons in the box
        for (const child of this._buttonBox.get_children())
            child.show();

        applyGroupStyle(this._buttonBox);
    }

    _updateTime(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s  = Math.floor(totalMs / 1000) % 60;
        const m  = Math.floor(totalMs / 60000) % 60;
        const h  = Math.floor(totalMs / 3600000);

        const pad = (n) => n.toString().padStart(2, '0');
        const full = `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
        const short = `${pad(h)}:${pad(m)}:${pad(s)}`;

        if (this._menuTimeLabel)
            this._menuTimeLabel.label.set_text(full);
        if (this._panelTimeLabel)
            this._panelTimeLabel.set_text(short);
    }

    _updateLaps(laps) {
        this._laps = laps;
        this._renderLaps();
    }

    _renderLaps() {
        if (this._lapItems) {
            for (const item of this._lapItems)
                item.destroy();
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
