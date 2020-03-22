export declare class NumberMap<T> {
    [key: number]: T;
}
export declare class StringMap<T> {
    [key: string]: T;
}
export default class IterableStringMap<T> {
    values: StringMap<T>;
    has(key: string): boolean;
    set(key: string, item: T): void;
    get(key: string): T;
    forEach(callbackfn: Function): void;
    reduce(callbackfn: Function, initialValue?: any): any;
}
