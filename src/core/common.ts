import 'promise-polyfill';

export default class Common {
	static fetch(url: string): Promise<string> {
		// console.log('Common.fetch', url);
		return new Promise(function (resolve, reject) {
			const xhr: XMLHttpRequest = new XMLHttpRequest();
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
		})
	}

	static getResource(filepath: string, workpath: string = ''): string {
		const resource: string = (filepath.indexOf(':/') === -1) ? Common.join(workpath, filepath) : filepath;
		return resource;
	}

	static join(...args: string[]): string {
		let comp: string[] = [];
		args.forEach(a => {
			const parts = a.split(/(?<!\/)\/(?!\/)/g);
			if (parts.length && parts[parts.length - 1] === '') {
				parts.pop();
			}
			parts.forEach(x => {
				switch(x) {
					case '':
						comp = [];
						break;
					case '.':
						break;
					case '..':
						comp.pop();
						break;
					default:
						comp.push(x);
				}
			});
		});
		return comp.join('/');
	}

	static dirname(path: string): string {
		const comp: string[] = path.split(/(?<!\/)\/(?!\/)/g);
		comp.pop();
		return comp.join('/');
	}

}
