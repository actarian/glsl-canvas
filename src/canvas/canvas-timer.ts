export default class CanvasTimer {

	start: number;
	previous: number;
	delay: number = 0.0;
	current: number = 0.0;
	delta: number = 0.0;
	paused: boolean = false;

	constructor() {
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

	next(): CanvasTimer {
		const now = this.now();
		this.delta = now - this.previous;
		this.current = now - this.start - this.delay;
		this.previous = now;
		return this;
	}

}
