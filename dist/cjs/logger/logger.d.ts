export declare enum LoggerLevel {
    None = 0,
    Error = 1,
    Warn = 2,
    Log = 3
}
export default class Logger {
    static level: LoggerLevel;
    static enabled: boolean;
    static log(...datas: any[]): void;
    static warn(...datas: any[]): void;
    static error(...datas: any[]): void;
}
