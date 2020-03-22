import Logger from '../logger/logger';
export class Listener {
    constructor(event, callback) {
        this.event = event;
        this.callback = callback;
    }
}
export default class Subscriber {
    constructor() {
        this.listeners = new Set();
    }
    logListeners() {
        this.listeners.forEach(x => Logger.log(x));
    }
    subscribe(listener) {
        this.listeners.add(listener);
    }
    unsubscribe(listener) {
        this.listeners.delete(listener);
    }
    unsubscribeAll() {
        this.listeners.clear();
    }
    on(event, callback) {
        this.listeners.add(new Listener(event, callback));
        return this;
    }
    off(event, callback) {
        if (callback) {
            this.listeners.delete(new Listener(event, callback));
        }
        else {
            this.listeners.forEach(x => {
                if (x.event === event) {
                    this.listeners.delete(x);
                }
            });
        }
        return this;
    }
    trigger(event, ...data) {
        this.listeners.forEach(x => {
            if (x.event === event && typeof x.callback === 'function') {
                x.callback(...data);
            }
        });
        return this;
    }
}
