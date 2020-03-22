export var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["None"] = 0] = "None";
    LoggerLevel[LoggerLevel["Error"] = 1] = "Error";
    LoggerLevel[LoggerLevel["Warn"] = 2] = "Warn";
    LoggerLevel[LoggerLevel["Log"] = 3] = "Log";
})(LoggerLevel || (LoggerLevel = {}));
export default class Logger {
    static log(...datas) {
        if (Logger.enabled && Logger.level >= LoggerLevel.Log) {
            console.log(...datas);
        }
    }
    static warn(...datas) {
        if (Logger.enabled && Logger.level >= LoggerLevel.Warn) {
            console.warn(...datas);
        }
    }
    static error(...datas) {
        if (Logger.enabled && Logger.level >= LoggerLevel.Error) {
            console.error(...datas);
        }
    }
}
Logger.level = LoggerLevel.Warn;
Logger.enabled = true;
