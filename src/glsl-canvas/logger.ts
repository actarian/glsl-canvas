
export default class Logger {

	static enabled: boolean = false;

	static log(...datas: any[]) {
		if (Logger.enabled) {
			console.log(...datas);
		}
	}

	static warn(...datas: any[]) {
		if (Logger.enabled) {
			console.warn(...datas);
		}
	}

	static error(...datas: any[]) {
		if (Logger.enabled) {
			console.error(...datas);
		}
	}

}
