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
}
