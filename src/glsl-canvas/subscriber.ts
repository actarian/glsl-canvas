
export class Listener {

    event: string;
    callback: Function;

    constructor(
        event: string,
        callback: Function
    ) {
        this.event = event;
        this.callback = callback;
    }

}

export default class Subscriber {

    private listeners: Set<Listener> = new Set<Listener>();

    logListeners() {
        this.listeners.forEach(x => console.log(x));
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
    }

    unsubscribe(listener: Listener) {
        this.listeners.delete(listener);
    }

    unsubscribeAll() {
        this.listeners.clear();
    }

    on(event: string, callback: Function) {
        this.listeners.add(new Listener(event, callback));
        return this;
    }

    off(event: string, callback?: Function) {
        if (callback) {
            this.listeners.delete(new Listener(event, callback));
        } else {
            this.listeners.forEach(x => {
                if (x.event === event) {
                    this.listeners.delete(x);
                }
            });
        }
        return this;
    }

    trigger(event: string, ...data: any[]) {
        this.listeners.forEach(x => {
            if (x.event === event && typeof x.callback === 'function') {
                x.callback(...data);
            }
        });
        return this;
    }

}
