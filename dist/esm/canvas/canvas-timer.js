export default class CanvasTimer {
    constructor() {
        this.delay = 0.0;
        this.current = 0.0;
        this.delta = 0.0;
        this.paused = false;
        this.start = this.previous = this.now();
    }
    now() {
        return performance.now();
    }
    play() {
        if (this.previous) {
            const now = this.now();
            this.delay += (now - this.previous);
            this.previous = now;
        }
        // Logger.log(this.delay);
        this.paused = false;
    }
    pause() {
        this.paused = true;
    }
    next() {
        const now = this.now();
        this.delta = now - this.previous;
        this.current = now - this.start - this.delay;
        this.previous = now;
        return this;
    }
}
