import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { State, Phase } from '../pomodoro.js';

const PHASE_LABELS = {
    [Phase.FOCUS]: 'Focus',
    [Phase.SHORT_BREAK]: 'Short Break',
    [Phase.LONG_BREAK]: 'Long Break',
};

export class PomodoroView {
    // `onOpenSettings` opens Preferences directly on the Pomodoro page — see
    // the gear button in _buildHeader() and Indicator.setupPomodoro().
    constructor(pomodoro, onOpenSettings) {
        this._pomodoro = pomodoro;
        this._onOpenSettings = onOpenSettings;
        this._subs = [];

        this.actor = new St.BoxLayout({
            vertical: true,
            style_class: 'one-extension-spacing',
            x_expand: true,
        });

        this._buildHeader();
        this._buildTime();
        this._buildProgress();
        this._buildControls();
        this._buildCaption();

        this._updateUI(pomodoro.state);
        this._renderPhase(pomodoro.phase);
        this._renderTime(pomodoro.remaining);
        this._renderProgress();
        this._renderCaption();
        this._listen();
    }

    // Phase name doubles as the block's heading (mirrors the stopwatch's
    // static title), with the settings shortcut anchored at the end.
    _buildHeader() {
        const row = new St.BoxLayout({
            x_expand: true,
        });
        this.actor.add_child(row);

        this._phaseLabel = new St.Label({
            style_class: 'pomodoro-title',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        row.add_child(this._phaseLabel);

        this._settingsBtn = new St.Button({
            style_class: 'pomodoro-settings-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            accessible_name: 'Pomodoro Settings',
        });
        this._settingsBtn.set_child(new St.Icon({
            icon_name: 'emblem-system-symbolic',
            style_class: 'pomodoro-settings-icon',
        }));
        row.add_child(this._settingsBtn);
    }

    // No centiseconds here — unlike the stopwatch, this counts down in whole
    // configured minutes, so sub-second precision would just be noise.
    _buildTime() {
        const box = new St.BoxLayout({
            style_class: 'stopwatch-time-box',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(box);

        this._mLabel = new St.Label({ style_class: 'stopwatch-time-digits' });
        this._sLabel = new St.Label({ style_class: 'stopwatch-time-digits' });
        const sep = new St.Label({ text: ':', style_class: 'stopwatch-time-sep' });

        box.add_child(this._mLabel);
        box.add_child(sep);
        box.add_child(this._sLabel);
    }

    _buildProgress() {
        this._progressRow = new St.BoxLayout({
            style_class: 'pomodoro-progress-row',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(this._progressRow);
    }

    _buildControls() {
        const row = new St.BoxLayout({
            style_class: 'stopwatch-controls',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(row);

        this._skipBtn = this._pillButton(row, 'Skip', 'stopwatch-button-secondary');
        this._toggleBtn = this._pillButton(row, 'Start', 'stopwatch-button-primary');
    }

    _buildCaption() {
        this._caption = new St.Label({
            style_class: 'pomodoro-caption',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this.actor.add_child(this._caption);
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
        const pomo = this._pomodoro;

        this._subs.push(pomo.subscribe('state_change', (s) => {
            this._updateUI(s);
            this._renderPhase(pomo.phase);
            this._renderTime(pomo.remaining);
            this._renderProgress();
            this._renderCaption();
        }));
        this._subs.push(pomo.subscribe('tic', (remaining) => this._renderTime(remaining)));
        this._subs.push(pomo.subscribe('phase_change', () => {
            this._renderPhase(pomo.phase);
            this._renderProgress();
        }));

        this._toggleBtn.connect('clicked', () => {
            switch (this._pomodoro.state) {
                case State.RESET: pomo.start(); break;
                case State.RUNNING: pomo.pause(); break;
                case State.PAUSED: pomo.resume(); break;
            }
        });

        this._skipBtn.connect('clicked', () => pomo.skip());

        this._settingsBtn.connect('clicked', () => this._onOpenSettings?.());
    }

    // Skip is meaningless on a phase that hasn't started yet (nothing to
    // abandon), so — mirroring the stopwatch's Reset-only-while-paused rule
    // — it's disabled exactly when the toggle button reads "Start".
    _updateUI(state) {
        switch (state) {
            case State.RUNNING:
                this._toggleBtn.set_label('Pause');
                this._setBtnEnabled(this._skipBtn, true);
                break;
            case State.PAUSED:
                this._toggleBtn.set_label('Resume');
                this._setBtnEnabled(this._skipBtn, true);
                break;
            case State.RESET:
                this._toggleBtn.set_label('Start');
                this._setBtnEnabled(this._skipBtn, false);
                break;
        }
    }

    _renderPhase(phase) {
        this._phaseLabel.set_text(PHASE_LABELS[phase] ?? 'Focus');
    }

    _renderTime(remainingMs) {
        const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        const s = totalSeconds % 60;
        const m = Math.floor(totalSeconds / 60);
        const pad = (n) => n.toString().padStart(2, '0');

        this._mLabel.set_text(pad(m));
        this._sLabel.set_text(pad(s));
    }

    // Rebuilt from scratch each time — cheap for a handful of dots, and
    // sidesteps having to reconcile a stale dot count if the user changes
    // "cycles before long break" in Preferences while the menu is open.
    _renderProgress() {
        this._progressRow.destroy_all_children();

        const total = this._pomodoro.cyclesBeforeLongBreak;
        const filled = this._pomodoro.phase === Phase.LONG_BREAK ? total : this._pomodoro.cycleCount;

        for (let i = 0; i < total; i++) {
            const dot = new St.Label({
                text: '●',
                style_class: i < filled ? 'pomodoro-progress-dot-filled' : 'pomodoro-progress-dot',
            });
            this._progressRow.add_child(dot);
        }
    }

    _renderCaption() {
        const log = this._pomodoro.log;
        this._caption.set_text(`${log.getTodayCount()} today · ${log.getTotalCount()} total`);
    }

    destroy() {
        for (const id of this._subs)
            this._pomodoro.unsubscribe(id);
        this.actor.destroy();
    }
}
