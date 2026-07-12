import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { ButtonBox } from '../utils/button.js';
import { State } from '../stopwatch.js';

export class StopwatchView {
    constructor(stopwatch) {
        this._stopwatch = stopwatch;
        this._subs = [];

        this.actor = new St.BoxLayout({
            vertical: true,
            style_class: 'one-extension-spacing',
        });

        this._buildHeader();
        this._buildButtons();
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
    }

    _buildButtons() {
        const buttonBox = new ButtonBox(this.actor);
        this._startBtn = buttonBox.add({ wide: true, label: 'Start' });
        this._pauseBtn = buttonBox.add({ wide: true, label: 'Pause' });
        this._resumeBtn = buttonBox.add({ wide: true, label: 'Resume' });
        this._resetBtn = buttonBox.add({ wide: true, label: 'Reset' });
    }

    _listen() {
        const sw = this._stopwatch;

        this._subs.push(sw.subscribe('state_change', (s) => this._updateUI(s)));
        this._subs.push(sw.subscribe('tic', (total) => {
            this._timeLabel.set_text(this._fmtHms(total));
        }));

        this._startBtn.subscribe('left_click', () => sw.start());
        this._pauseBtn.subscribe('left_click', () => sw.pause());
        this._resumeBtn.subscribe('left_click', () => sw.resume());
        this._resetBtn.subscribe('left_click', () => sw.reset());
    }

    _updateUI(state) {
        this._startBtn.actor.hide();
        this._pauseBtn.actor.hide();
        this._resumeBtn.actor.hide();
        this._resetBtn.actor.hide();

        switch (state) {
            case State.RUNNING:
                this._pauseBtn.actor.show();
                break;
            case State.PAUSED:
                this._resumeBtn.actor.show();
                this._resetBtn.actor.show();
                break;
            case State.RESET:
                this._startBtn.actor.show();
                this._timeLabel.set_text('00:00:00.00');
                break;
        }
    }

    _fmtHms(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s = Math.floor(totalMs / 1000) % 60;
        const m = Math.floor(totalMs / 60000) % 60;
        const h = Math.floor(totalMs / 3600000);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    }

    destroy() {
        for (const id of this._subs)
            this._stopwatch.unsubscribe(id);
        this.actor.destroy();
    }
}
