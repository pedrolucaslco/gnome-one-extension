import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { PubSub } from './utils/pubsub.js';
import { PomodoroLog } from './pomodoroLog.js';

export const State = {
    RUNNING: 0,
    PAUSED: 1,
    RESET: 2,
};

export const Phase = {
    FOCUS: 0,
    SHORT_BREAK: 1,
    LONG_BREAK: 2,
};

const PHASE_LABELS = {
    [Phase.FOCUS]: 'Focus session',
    [Phase.SHORT_BREAK]: 'Break',
    [Phase.LONG_BREAK]: 'Break',
};

const TICK_MS = 1000;

// Safety cap on how many phases _catchUp() will fast-forward through in one
// go, so a corrupt/ancient checkpoint can't spin the loop forever.
const MAX_CATCHUP_PHASES = 1000;

export class Pomodoro extends PubSub {
    constructor(settings) {
        super();
        this._settings = settings ?? null;
        this._log = new PomodoroLog();

        this._state = State.RESET;
        this._phase = Phase.FOCUS;
        this._remaining = this._durationFor(Phase.FOCUS);
        this._cycleCount = 0;
        this._ticId = 0;
        this._lastTick = 0;
        // Whether the "ending soon" warning already fired for the phase
        // currently in progress — reset in _advance() so each phase gets at
        // most one warning.
        this._warned = false;

        this._restore();
    }

    get state() {
        return this._state;
    }

    get phase() {
        return this._phase;
    }

    get remaining() {
        return this._remaining;
    }

    get cycleCount() {
        return this._cycleCount;
    }

    get cyclesBeforeLongBreak() {
        return this._settings?.get_int('pomodoro-cycles-before-long-break') ?? 4;
    }

    get log() {
        return this._log;
    }

    start() {
        if (this._state !== State.RESET) return;
        // Re-read the configured duration here (rather than trusting
        // whatever `_remaining` already holds) so a change made in
        // Preferences while idle is picked up immediately instead of only
        // on the next phase transition.
        this._remaining = this._durationFor(this._phase);
        this._state = State.RUNNING;
        this._tic();
        this._save();
        this.publish('state_change', this._state);
    }

    pause() {
        if (this._state !== State.RUNNING) return;
        this._state = State.PAUSED;
        this._stopTic();
        this._save();
        this.publish('state_change', this._state);
    }

    resume() {
        if (this._state !== State.PAUSED) return;
        this._state = State.RUNNING;
        this._tic();
        this._save();
        this.publish('state_change', this._state);
    }

    // Abandons the current phase early — never logged and never counted
    // toward the long-break cycle, since only a naturally completed focus
    // session should count as "a pomodoro".
    skip() {
        if (this._state === State.RESET) return;
        this._stopTic();
        this._advance({ log: false, countCycle: false });
        this._save();
        this.publish('phase_change', { phase: this._phase, cycleCount: this._cycleCount });
        this.publish('state_change', this._state);
    }

    disable() {
        this._stopTic();
        this._save();
    }

    _durationFor(phase) {
        if (!this._settings) {
            return { [Phase.FOCUS]: 25, [Phase.SHORT_BREAK]: 5, [Phase.LONG_BREAK]: 15 }[phase] * 60000;
        }
        const key = {
            [Phase.FOCUS]: 'pomodoro-focus-minutes',
            [Phase.SHORT_BREAK]: 'pomodoro-short-break-minutes',
            [Phase.LONG_BREAK]: 'pomodoro-long-break-minutes',
        }[phase];
        return this._settings.get_int(key) * 60000;
    }

    _tic() {
        this._lastTick = Date.now();

        this._ticId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, TICK_MS, () => {
            const now = Date.now();
            const dt = now - this._lastTick;
            this._lastTick = now;

            this._remaining -= dt;

            if (this._remaining <= 0) {
                const completedPhase = this._phase;
                this._stopTic();
                this._advance({ log: true, countCycle: true });
                this._save();
                this._notifyPhaseComplete(completedPhase, this._phase);
                this.publish('phase_change', { phase: this._phase, cycleCount: this._cycleCount });
                this.publish('state_change', this._state);
                return GLib.SOURCE_REMOVE;
            }

            this._checkWarning();
            this.publish('tic', this._remaining);
            return GLib.SOURCE_CONTINUE;
        });
    }

    _isPastWarnThreshold() {
        if (!(this._settings?.get_boolean('pomodoro-warn-enabled') ?? false)) return false;
        const warnMs = (this._settings?.get_int('pomodoro-warn-minutes') ?? 1) * 60000;
        return this._remaining <= warnMs;
    }

    // Fires at most once per phase — a live countdown reaching the
    // configured lead time, not a Shell-was-closed catch-up (see
    // _catchUp(), which never touches `_warned`/notifies on purpose: those
    // moments already passed while nobody was around to hear them).
    _checkWarning() {
        if (this._warned || !this._isPastWarnThreshold()) return;

        this._warned = true;
        const minutes = this._settings.get_int('pomodoro-warn-minutes');
        this._notify(
            `${PHASE_LABELS[this._phase]} ending soon`,
            `${minutes} minute${minutes === 1 ? '' : 's'} left.`,
            'bell'
        );
    }

    _notifyPhaseComplete(completedPhase, nextPhase) {
        const body = completedPhase === Phase.FOCUS
            ? (nextPhase === Phase.LONG_BREAK ? 'Nice work — time for a long break.' : 'Time for a short break.')
            : 'Break over — time to focus.';

        this._notify(`${PHASE_LABELS[completedPhase]} complete`, body, 'alarm-clock-elapsed');
    }

    _notify(title, body, soundTheme) {
        if (this._settings?.get_boolean('pomodoro-notify-enabled') ?? true) {
            Main.notify(title, body);
        }
        if (this._settings?.get_boolean('pomodoro-sound-enabled') ?? true) {
            global.display.get_sound_player().play_from_theme(soundTheme, title, null);
        }
    }

    _stopTic() {
        if (this._ticId) {
            GLib.source_remove(this._ticId);
            this._ticId = 0;
        }
    }

    // Moves from the just-finished `this._phase` to whichever phase comes
    // next, resetting the countdown to that phase's full configured length.
    // `log`/`countCycle` are false for skip() so an abandoned session leaves
    // no trace and doesn't bring the user closer to a long break.
    _advance({ log, countCycle }) {
        if (this._phase === Phase.FOCUS) {
            if (log) {
                this._log.record({ completedAt: Date.now(), durationMs: this._durationFor(Phase.FOCUS) });
            }

            const nextCycleCount = countCycle ? this._cycleCount + 1 : this._cycleCount;

            if (countCycle && nextCycleCount >= this.cyclesBeforeLongBreak) {
                this._phase = Phase.LONG_BREAK;
                this._cycleCount = 0;
            } else {
                this._phase = Phase.SHORT_BREAK;
                this._cycleCount = nextCycleCount;
            }
        } else {
            this._phase = Phase.FOCUS;
        }

        this._remaining = this._durationFor(this._phase);
        this._state = State.RESET;
        this._warned = false;
    }

    // Restores state from GSettings so the countdown survives a Shell
    // reload — including one triggered by another extension crashing on
    // enable/disable, not just a normal `enable()` toggle of this one.
    _restore() {
        if (!this._settings) return;

        const state = this._settings.get_int('pomodoro-state');
        const phase = this._settings.get_int('pomodoro-phase');
        const remainingMs = this._settings.get_int64('pomodoro-remaining-ms');
        const runningSince = this._settings.get_int64('pomodoro-running-since');
        const cycleCount = this._settings.get_int('pomodoro-cycle-count');

        this._phase = phase;
        this._cycleCount = cycleCount;

        if (state === State.RUNNING) {
            const elapsed = runningSince > 0 ? Math.max(0, Date.now() - runningSince) : 0;
            this._remaining = remainingMs - elapsed;
            this._state = State.RUNNING;
            this._catchUp();
            // Already inside the warning window at restore time: don't fire
            // it again right away, the user hasn't missed anything new.
            this._warned = this._isPastWarnThreshold();

            if (this._state === State.RUNNING) {
                this._tic();
            }
        } else if (state === State.PAUSED) {
            this._state = State.PAUSED;
            this._remaining = remainingMs;
            this._warned = this._isPastWarnThreshold();
        } else {
            // A RESET phase always shows its full configured length, not a
            // stored checkpoint — re-derive it instead of trusting
            // `remainingMs`, so a duration change made between Shell
            // restarts is reflected right away.
            this._state = State.RESET;
            this._remaining = this._durationFor(this._phase);
        }
    }

    // While the Shell was down, a running countdown may have finished one or
    // more phases already — fast-forward through them (logging naturally
    // completed focus sessions, same as a live tick would) instead of
    // resuming with a negative remaining time.
    _catchUp() {
        let iterations = 0;
        while (this._remaining <= 0 && iterations < MAX_CATCHUP_PHASES) {
            const overshoot = -this._remaining;
            this._advance({ log: true, countCycle: true });
            this._remaining -= overshoot;
            iterations++;
        }

        if (this._remaining <= 0) {
            // Pathological checkpoint; land on a fresh, full-length phase.
            this._remaining = this._durationFor(this._phase);
        }

        // _advance() always leaves `this._state` as RESET when it runs above
        // — intentionally so: a phase that finished while the Shell was
        // closed shouldn't silently resume running unattended. If the loop
        // never ran (nothing to catch up), `this._state` is untouched and
        // stays RUNNING, so the caller's tick resumes normally.
    }

    // `running-since` is a checkpoint timestamp (time of this save), not the
    // original start time — `remaining` already accounts for everything
    // before it, so `remaining - (now - running-since)` is correct on
    // restore either way.
    _save() {
        if (!this._settings) return;
        this._settings.set_int('pomodoro-state', this._state);
        this._settings.set_int('pomodoro-phase', this._phase);
        this._settings.set_int64('pomodoro-remaining-ms', this._remaining);
        this._settings.set_int64(
            'pomodoro-running-since',
            this._state === State.RUNNING ? Date.now() : 0
        );
        this._settings.set_int('pomodoro-cycle-count', this._cycleCount);
    }
}
