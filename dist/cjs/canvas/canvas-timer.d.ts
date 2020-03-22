export default class CanvasTimer {
    start: number;
    previous: number;
    delay: number;
    current: number;
    delta: number;
    paused: boolean;
    constructor();
    now(): number;
    play(): void;
    pause(): void;
    next(): CanvasTimer;
}
