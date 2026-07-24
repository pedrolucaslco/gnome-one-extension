import GLib from 'gi://GLib';
import { PubSub } from './utils/pubsub.js';

export const State = {
    RUNNING: 0,
    PAUSED: 1,
    RESET: 2,
};

// How often the running total is checkpointed to GSettings, so a Shell
// crash/restart (even one triggered by a different extension) loses at
// most this much time instead of resetting to zero.
const SAVE_INTERVAL_MS = 1000;

export class Stopwatch extends PubSub {
    constructor(settings) {
        super();
        this._settings = settings ?? null;
        this._state = State.RESET;
        this._total = 0;
        this._ticId = 0;
        this._lastTick = 0;
        this._lastSave = 0;

        this._restore();
    }

    get state() {
        return this._state;
    }

    get total() {
        return this._total;
    }

    start() {
        if (this._state !== State.RESET) return;
        this._state = State.RUNNING;
        this._total = 0;
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

    reset() {
        this._state = State.RESET;
        this._total = 0;
        this._stopTic();
        this._save();
        this.publish('state_change', this._state);
    }

    disable() {
        this._stopTic();
        this._save();
    }

    _tic() {
        this._lastTick = Date.now();
        this._lastSave = this._lastTick;

        this._ticId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60, () => {
            const now = Date.now();
            const dt = now - this._lastTick;
            this._lastTick = now;

            this._total += dt;
            this.publish('tic', this._total);

            if (now - this._lastSave >= SAVE_INTERVAL_MS) {
                this._lastSave = now;
                this._save();
            }

            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopTic() {
        if (this._ticId) {
            GLib.source_remove(this._ticId);
            this._ticId = 0;
        }
    }

    // Restores state from GSettings so the running total survives a Shell
    // reload — including one triggered by another extension crashing on
    // enable/disable, not just a normal `enable()` toggle of this one.
    _restore() {
        if (!this._settings) return;

        const state = this._settings.get_int('stopwatch-state');
        const totalMs = this._settings.get_int64('stopwatch-total-ms');
        const runningSince = this._settings.get_int64('stopwatch-running-since');

        if (state === State.RUNNING) {
            this._state = State.RUNNING;
            this._total = totalMs + (runningSince > 0 ? Math.max(0, Date.now() - runningSince) : 0);
            this._tic();
        } else if (state === State.PAUSED) {
            this._state = State.PAUSED;
            this._total = totalMs;
        }
    }

    // `running-since` is a checkpoint timestamp (time of this save), not the
    // original start time — `total` already accounts for everything before
    // it, so `total + (now - running-since)` is correct on restore either way.
    _save() {
        if (!this._settings) return;
        this._settings.set_int('stopwatch-state', this._state);
        this._settings.set_int64('stopwatch-total-ms', this._total);
        this._settings.set_int64(
            'stopwatch-running-since',
            this._state === State.RUNNING ? Date.now() : 0
        );
    }
}
