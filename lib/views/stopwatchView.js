import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { ButtonBox } from '../utils/button.js';
import { ScrollBox } from '../utils/scroll.js';

const State = {
    RUNNING: 0,
    PAUSED: 1,
    RESET: 2,
};

export class StopwatchView {
    constructor(stopwatch, onSettings) {
        this._stopwatch = stopwatch;
        this._onSettings = onSettings;
        this._subs = [];

        this.actor = new St.BoxLayout({
            vertical: true,
            style_class: 'one-extension-spacing',
        });

        this._buildHeader();
        this._buildButtons();
        this._buildLapsScroll();
        this._updateUI(stopwatch.state);
        this._listen();
    }

    _buildHeader() {
        const header = new St.BoxLayout();
        this.actor.add_child(header);

        this._timeLabel = new St.Label({
            text: '00:00:00.00',
            x_expand: true,
            style: 'font-weight: bold; font-size: 20px; font-family: monospace;',
            y_align: Clutter.ActorAlign.CENTER,
        });
        header.add_child(this._timeLabel);

        const settingsBtn = new ButtonBox(header).add({ icon: 'emblem-system-symbolic' });
        settingsBtn.subscribe('left_click', () => this._onSettings());
    }

    _buildButtons() {
        const buttonBox = new ButtonBox(this.actor);
        this._startBtn = buttonBox.add({ wide: true, label: 'Start' });
        this._pauseBtn = buttonBox.add({ wide: true, label: 'Pause' });
        this._resumeBtn = buttonBox.add({ wide: true, label: 'Resume' });
        this._resetBtn = buttonBox.add({ wide: true, label: 'Reset' });
        this._lapBtn = buttonBox.add({ wide: true, label: 'Lap' });
    }

    _buildLapsScroll() {
        this._lapsScroll = new ScrollBox();
        this.actor.add_child(this._lapsScroll.actor);
        this._lapsScroll.actor.hide();
    }

    _listen() {
        const sw = this._stopwatch;

        this._subs.push(sw.subscribe('state_change', (s) => this._updateUI(s)));
        this._subs.push(sw.subscribe('tic', (t) => {
            this._timeLabel.set_text(this._fmtHmsc(t.total));
        }));
        this._subs.push(sw.subscribe('lap', () => this._renderLaps()));

        this._startBtn.subscribe('left_click', () => sw.start());
        this._pauseBtn.subscribe('left_click', () => sw.pause());
        this._resumeBtn.subscribe('left_click', () => sw.resume());
        this._resetBtn.subscribe('left_click', () => sw.reset());
        this._lapBtn.subscribe('left_click', () => sw.lap());
    }

    _updateUI(state) {
        this._startBtn.actor.hide();
        this._pauseBtn.actor.hide();
        this._resumeBtn.actor.hide();
        this._resetBtn.actor.hide();
        this._lapBtn.actor.hide();

        switch (state) {
            case State.RUNNING:
                this._pauseBtn.actor.show();
                this._lapBtn.actor.show();
                break;
            case State.PAUSED:
                this._resumeBtn.actor.show();
                this._resetBtn.actor.show();
                break;
            case State.RESET:
                this._startBtn.actor.show();
                this._timeLabel.set_text('00:00:00.00');
                this._lapsScroll.actor.hide();
                this._lapsScroll.box.destroy_all_children();
                break;
        }
    }

    _renderLaps() {
        const laps = this._stopwatch.laps;
        this._lapsScroll.box.destroy_all_children();

        if (!laps.length) {
            this._lapsScroll.actor.hide();
            return;
        }

        this._lapsScroll.actor.show();

        for (let i = 0; i < Math.min(laps.length, 10); i++) {
            const lap = laps[i];
            const label = new St.Label({
                text: `#${laps.length - i}  Lap: ${this._fmtHmsc(lap.lap)}  Total: ${this._fmtHmsc(lap.total)}`,
                style: 'font-family: monospace; font-size: 11px; padding: 4px 8px;',
                x_expand: true,
            });
            this._lapsScroll.box.add_child(label);
        }
    }

    _fmtHmsc(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s  = Math.floor(totalMs / 1000) % 60;
        const m  = Math.floor(totalMs / 60000) % 60;
        const h  = Math.floor(totalMs / 3600000);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    }

    destroy() {
        for (const id of this._subs)
            this._stopwatch.unsubscribe(id);
        this.actor.destroy();
    }
}
