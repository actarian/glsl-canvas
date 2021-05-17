import 'promise-polyfill';
export default class Common {
    static fetch(url) {
        // console.log('Common.fetch', url);
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response || xhr.responseText);
            };
            xhr.onerror = function (error) {
                console.log('Common.error', error);
                reject(new Error(`Network request failed for url ${url}`));
            };
            xhr.ontimeout = function (error) {
                // console.log(error);
                reject(new Error(`Network request failed for url ${url}`));
            };
            xhr.onabort = function () {
                reject(new Error('Aborted'));
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        });
    }
    static getResource(filepath, workpath = '') {
        const resource = (filepath.indexOf(':/') === -1) ? Common.join(workpath, filepath) : filepath;
        return resource;
    }
    static join(...args) {
        let comps = [];
        args.forEach(a => {
            if (a.indexOf('/') === 0) {
                comps = [];
            }
            const parts = Common.comps(a);
            parts.forEach(x => {
                switch (x) {
                    case '.':
                        break;
                    case '..':
                        comps.pop();
                        break;
                    default:
                        comps.push(x);
                }
            });
        });
        return comps.join('/');
    }
    static dirname(path) {
        // return path.replace(/\/[^\/]+\.\w+/, '');
        const comps = Common.comps(path);
        comps.pop();
        return comps.join('/');
    }
    static comps(path) {
        return path.replace(/\/$/, '').split(/\/+/);
    }
}
