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
        this._buildTime();
        this._buildControls();
        this._updateUI(stopwatch.state);
        this._renderTime(stopwatch.total);
        this._listen();
    }

    _buildTitle() {
        const title = new St.Label({
            text: 'Stopwatch',
            style_class: 'stopwatch-title',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(title);
    }

    // Digits and separators as separate labels so the separators can be
    // dimmed independently, matching the reference design's emphasis on
    // the numbers over the punctuation.
    _buildTime() {
        const box = new St.BoxLayout({
            style_class: 'stopwatch-time-box',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(box);

        this._hLabel = new St.Label({ style_class: 'stopwatch-time-digits' });
        this._mLabel = new St.Label({ style_class: 'stopwatch-time-digits' });
        this._sLabel = new St.Label({ style_class: 'stopwatch-time-digits' });
        this._csLabel = new St.Label({ style_class: 'stopwatch-time-digits' });

        const sep = (text) => new St.Label({ text, style_class: 'stopwatch-time-sep' });

        for (const child of [
            this._hLabel, sep(':'), this._mLabel, sep(':'), this._sLabel, sep('.'), this._csLabel,
        ]) box.add_child(child);
    }

    _buildControls() {
        const row = new St.BoxLayout({
            style_class: 'stopwatch-controls',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(row);

        this._stopBtn = this._pillButton(row, 'Reset', 'stopwatch-button-secondary');
        this._toggleBtn = this._pillButton(row, 'Start', 'stopwatch-button-primary');
    }

    // Label-only pill button — per HIG, buttons outside header bars carry
    // either an icon or a label, never both, so no icon here.
    _pillButton(parent, text, styleClass) {
        const btn = new St.Button({
            style_class: `stopwatch-button ${styleClass}`,
            label: text,
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_expand: true,
        });
        parent.add_child(btn);
        return btn;
    }

    _setBtnEnabled(btn, enabled) {
        btn.reactive = enabled;
        btn.can_focus = enabled;
        btn.opacity = enabled ? 255 : 100;
    }

    _listen() {
        const sw = this._stopwatch;

        this._subs.push(sw.subscribe('state_change', (s) => this._updateUI(s)));
        this._subs.push(sw.subscribe('tic', (total) => this._renderTime(total)));

        this._toggleBtn.connect('clicked', () => {
            switch (this._stopwatch.state) {
                case State.RESET: sw.start(); break;
                case State.RUNNING: sw.pause(); break;
                case State.PAUSED: sw.resume(); break;
            }
        });

        this._stopBtn.connect('clicked', () => {
            if (this._stopwatch.state === State.PAUSED)
                sw.reset();
        });
    }

    // Only Reset unblocks once paused — resetting mid-run would discard
    // the run without an explicit pause step first.
    _updateUI(state) {
        switch (state) {
            case State.RUNNING:
                this._toggleBtn.set_label('Pause');
                this._setBtnEnabled(this._stopBtn, false);
                break;
            case State.PAUSED:
                this._toggleBtn.set_label('Resume');
                this._setBtnEnabled(this._stopBtn, true);
                break;
            case State.RESET:
                this._toggleBtn.set_label('Start');
                this._setBtnEnabled(this._stopBtn, false);
                this._renderTime(0);
                break;
        }
    }

    _renderTime(totalMs) {
        const cs = Math.floor(totalMs / 10) % 100;
        const s = Math.floor(totalMs / 1000) % 60;
        const m = Math.floor(totalMs / 60000) % 60;
        const h = Math.floor(totalMs / 3600000);
        const pad = (n) => n.toString().padStart(2, '0');

        this._hLabel.set_text(pad(h));
        this._mLabel.set_text(pad(m));
        this._sLabel.set_text(pad(s));
        this._csLabel.set_text(pad(cs));
    }

    destroy() {
        for (const id of this._subs)
            this._stopwatch.unsubscribe(id);
        this.actor.destroy();
    }
}
