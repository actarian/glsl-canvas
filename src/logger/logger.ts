export enum LoggerLevel {
	None = 0,
	Error = 1,
	Warn = 2,
	Log = 3,
}

export default class Logger {

	static level: LoggerLevel = LoggerLevel.Warn;

	static enabled: boolean = true;

	static log(...datas: any[]) {
		if (Logger.enabled && Logger.level >= LoggerLevel.Log) {
			console.log(...datas);
		}
	}

	static warn(...datas: any[]) {
		if (Logger.enabled && Logger.level >= LoggerLevel.Warn) {
			console.warn(...datas);
		}
	}

	static error(...datas: any[]) {
		if (Logger.enabled && Logger.level >= LoggerLevel.Error) {
			console.error(...datas);
		}
	}

}
