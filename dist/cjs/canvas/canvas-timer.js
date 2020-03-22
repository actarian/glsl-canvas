"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CanvasTimer = /** @class */ (function () {
    function CanvasTimer() {
        this.delay = 0.0;
        this.current = 0.0;
        this.delta = 0.0;
        this.paused = false;
        this.start = this.previous = this.now();
    }
    CanvasTimer.prototype.now = function () {
        return performance.now();
    };
    CanvasTimer.prototype.play = function () {
        if (this.previous) {
            var now = this.now();
            this.delay += (now - this.previous);
            this.previous = now;
        }
        // Logger.log(this.delay);
        this.paused = false;
    };
    CanvasTimer.prototype.pause = function () {
        this.paused = true;
    };
    CanvasTimer.prototype.next = function () {
        var now = this.now();
        this.delta = now - this.previous;
        this.current = now - this.start - this.delay;
        this.previous = now;
        return this;
    };
    return CanvasTimer;
}());
exports.default = CanvasTimer;
