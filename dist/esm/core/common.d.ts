import 'promise-polyfill';
export default class Common {
    static fetch(url: string): Promise<string>;
    static getResource(filepath: string, workpath?: string): string;
    static join(...args: string[]): string;
    static dirname(path: string): string;
}
