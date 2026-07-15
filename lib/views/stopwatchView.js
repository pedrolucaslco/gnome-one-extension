import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { State } from '../stopwatch.js';

export class StopwatchView {
    constructor(stopwatch) {
        this._stopwatch = stopwatch;
        this._subs = [];

        this.actor = new St.BoxLayout({
            vertical: true,
            style_class: 'one-extension-spacing',
            x_expand: true,
        });

        this._buildTitle();
        this._buildControls();
        this._updateUI(stopwatch.state);
        this._listen();
    }

    _buildTitle() {
        const title = new St.Label({
            text: 'Stopwatch',
            style_class: 'stopwatch-title',
        });
        this.actor.add_child(title);
    }

    _buildControls() {
        const row = new St.BoxLayout({
            style: 'spacing: 4px;',
            x_expand: true,
        });
        this.actor.add_child(row);

        this._timeLabel = new St.Label({
            text: '00:00:00.00',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        row.add_child(this._timeLabel);

        const btnBox = new St.BoxLayout({
            style: 'spacing: 2px;',
        });
        row.add_child(btnBox);

        this._startBtn = this._iconButton(btnBox, 'media-playback-start-symbolic');
        this._pauseBtn = this._iconButton(btnBox, 'media-playback-pause-symbolic');
        this._resumeBtn = this._iconButton(btnBox, 'media-playback-start-symbolic');
        this._resetBtn = this._iconButton(btnBox, 'media-playback-stop-symbolic');
    }

    _iconButton(parent, icon_name) {
        const btn = new St.Button({
            style_class: 'stopwatch-icon-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
        });
        const icon = new St.Icon({ icon_name });
        btn.add_child(icon);
        parent.add_child(btn);
        return btn;
    }

    _listen() {
        const sw = this._stopwatch;

        this._subs.push(sw.subscribe('state_change', (s) => this._updateUI(s)));
        this._subs.push(sw.subscribe('tic', (total) => {
            this._timeLabel.set_text(this._fmtHms(total));
        }));

        this._startBtn.connect('clicked', () => sw.start());
        this._pauseBtn.connect('clicked', () => sw.pause());
        this._resumeBtn.connect('clicked', () => sw.resume());
        this._resetBtn.connect('clicked', () => sw.reset());
    }

    _updateUI(state) {
        this._startBtn.hide();
        this._pauseBtn.hide();
        this._resumeBtn.hide();
        this._resetBtn.hide();

        switch (state) {
            case State.RUNNING:
                this._pauseBtn.show();
                break;
            case State.PAUSED:
                this._resumeBtn.show();
                this._resetBtn.show();
                break;
            case State.RESET:
                this._startBtn.show();
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
