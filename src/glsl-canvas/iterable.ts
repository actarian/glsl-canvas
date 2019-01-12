export class NumberMap<T> { [key: number]: T; };
export class StringMap<T> { [key: string]: T; };

export default class IterableStringMap<T> {

    values: StringMap<T> = new StringMap<T>();

    has(key: string) {
        return this.values.hasOwnProperty(key);
    }

    set(key: string, item: T) {
        this.values[key] = item;
    }

    get(key: string): T {
        return this.values[key];
    }

    forEach(callbackfn: Function) {
        let i = 0;
        for (const key in this.values) {
            callbackfn(this.values[key], i, this.values);
            i++;
        }
    }

    reduce(callbackfn: Function, initialValue?: any) {
        let previous = initialValue, i = 0;
        for (const key in this.values) {
            previous = callbackfn(previous, this.values[key], i, this.values);
            i++;
        }
        return previous;
    }

}
