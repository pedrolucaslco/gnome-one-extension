import GLib from 'gi://GLib';

const State = {
    RUNNING: 0,
    PAUSED: 1,
    RESET: 2,
};

function formatTime(totalMs) {
    const cs = Math.floor(totalMs / 10) % 100;
    const s  = Math.floor(totalMs / 1000) % 60;
    const m  = Math.floor(totalMs / 60000) % 60;
    const h  = Math.floor(totalMs / 3600000);

    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

export class Stopwatch {
    constructor() {
        this._state = State.RESET;
        this._total = 0;
        this._lapTotal = 0;
        this._laps = [];
        this._ticId = 0;
        this._callbacks = { stateChange: null, tic: null, lap: null };
    }

    setCallback(name, fn) {
        this._callbacks[name] = fn;
    }

    get state() {
        return this._state;
    }

    get isRunning() {
        return this._state === State.RUNNING;
    }

    get isPaused() {
        return this._state === State.PAUSED;
    }

    get isReset() {
        return this._state === State.RESET;
    }

    get totalFormatted() {
        return formatTime(this._total);
    }

    get lapTotalFormatted() {
        return formatTime(this._lapTotal);
    }

    get laps() {
        return this._laps;
    }

    start() {
        if (this._state !== State.RESET) return;
        this._state = State.RUNNING;
        this._total = 0;
        this._lapTotal = 0;
        this._laps = [];
        this._tic();
        this._emit('stateChange', this._state);
    }

    pause() {
        if (this._state !== State.RUNNING) return;
        this._state = State.PAUSED;
        this._stopTic();
        this._emit('stateChange', this._state);
    }

    resume() {
        if (this._state !== State.PAUSED) return;
        this._state = State.RUNNING;
        this._tic();
        this._emit('stateChange', this._state);
    }

    reset() {
        this._state = State.RESET;
        this._total = 0;
        this._lapTotal = 0;
        this._laps = [];
        this._stopTic();
        this._emit('stateChange', this._state);
    }

    lap() {
        if (this._state !== State.RUNNING) return;
        this._laps.unshift({
            lap: this._lapTotal,
            total: this._total,
        });
        this._lapTotal = 0;
        this._emit('lap', this._laps);
    }

    enable() {
        // Nothing to do on enable — timer only runs when started
    }

    disable() {
        this._stopTic();
    }

    _tic(prev = Date.now()) {
        const now = Date.now();
        const dt = now - prev;

        this._total += dt;
        this._lapTotal += dt;

        this._emit('tic', { total: this._total, lap: this._lapTotal });

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

    _emit(name, data) {
        const fn = this._callbacks[name];
        if (fn) fn(data);
    }
}
