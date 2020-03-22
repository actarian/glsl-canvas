export declare class Listener {
    event: string;
    callback: Function;
    constructor(event: string, callback: Function);
}
export default class Subscriber {
    private listeners;
    logListeners(): void;
    subscribe(listener: Listener): void;
    unsubscribe(listener: Listener): void;
    unsubscribeAll(): void;
    on(event: string, callback: Function): this;
    off(event: string, callback?: Function): this;
    trigger(event: string, ...data: any[]): this;
}
