export class PubSub {
    constructor() {
        this._listeners = {};
        this._nextId = 0;
    }

    subscribe(event, callback) {
        if (!this._listeners[event])
            this._listeners[event] = {};

        const id = this._nextId++;
        this._listeners[event][id] = callback;
        return id;
    }

    unsubscribe(id) {
        for (const event in this._listeners) {
            if (this._listeners[event][id]) {
                delete this._listeners[event][id];
                return;
            }
        }
    }

    publish(event, data) {
        const listeners = this._listeners[event];
        if (!listeners) return;

        for (const id in listeners)
            listeners[id](data);
    }

    destroy() {
        for (const event in this._listeners)
            delete this._listeners[event];
    }
}
