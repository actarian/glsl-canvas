import 'promise-polyfill';

export default class Common {
    static fetch(url: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response || xhr.responseText);
            };
            xhr.onerror = function () {
                reject(new Error('Network request failed'));
            };
            xhr.ontimeout = function () {
                reject(new Error('Network request failed'));
            };
            xhr.onabort = function () {
                reject(new Error('Aborted'));
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        })
    }
}