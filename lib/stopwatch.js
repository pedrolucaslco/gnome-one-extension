import GLib from 'gi://GLib';
import { PubSub } from './utils/pubsub.js';

const State = {
    RUNNING: 0,
    PAUSED: 1,
    RESET: 2,
};

export class Stopwatch extends PubSub {
    constructor() {
        super();
        this._state = State.RESET;
        this._total = 0;
        this._ticId = 0;
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
        this.publish('state_change', this._state);
    }

    pause() {
        if (this._state !== State.RUNNING) return;
        this._state = State.PAUSED;
        this._stopTic();
        this.publish('state_change', this._state);
    }

    resume() {
        if (this._state !== State.PAUSED) return;
        this._state = State.RUNNING;
        this._tic();
        this.publish('state_change', this._state);
    }

    reset() {
        this._state = State.RESET;
        this._total = 0;
        this._stopTic();
        this.publish('state_change', this._state);
    }

    disable() {
        this._stopTic();
    }

    _tic(prev = Date.now()) {
        const now = Date.now();
        const dt = now - prev;

        this._total += dt;

        this.publish('tic', this._total);

        this._ticId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60, () => {
            this._tic(now);
            return GLib.SOURCE_REMOVE;
        });
    }

    _stopTic() {
        if (this._ticId) {
            GLib.source_remove(this._ticId);
            this._ticId = 0;
        }
    }
}
