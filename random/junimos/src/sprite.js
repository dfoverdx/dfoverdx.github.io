(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./render-origin"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    require("./render-origin");
    var Sprite = /** @class */ (function () {
        /**
         * Sprite constructor.
         * @param context The canvas to which the sprite is to be rendered.
         * @param spriteSheet Url to the sprite sheet or an Image element already containing the sprite sheet.
         * @param bounds Array of Bounds that reperesent each sprite frame within the sheet (default: single frame taking
         *               up entirety of spriteSheet)
         * @param timePerFrame Amount of time in milliseconds to spend on each frame (default: 250)
         * @param initialFrameIndex Which frame the sprite begins on (default: random)
         */
        function Sprite(context, spriteSheet, bounds, timePerFrame, initialFrameIndex) {
            if (bounds === void 0) { bounds = null; }
            if (timePerFrame === void 0) { timePerFrame = 250; }
            if (initialFrameIndex === void 0) { initialFrameIndex = -1; }
            var _this = this;
            this.frameInterval = null;
            this.ctx = context;
            if (spriteSheet instanceof HTMLImageElement) {
                this.spriteSheet = spriteSheet;
            }
            else {
                this.spriteSheet = new Image();
                this.spriteSheet.src = spriteSheet;
                this.spriteSheet.onload = function () {
                    if (!_this.bounds) {
                        _this.bounds = new Array({ x: 0, y: 0, w: _this.spriteSheet.width, h: _this.spriteSheet.height });
                    }
                };
            }
            this.bounds = bounds;
            this.timePerFrame = timePerFrame;
            if (initialFrameIndex === -1) {
                initialFrameIndex = Math.floor(Math.random() * bounds.length);
            }
            this.initialFrameIndex = initialFrameIndex;
            this.currentFrameIndex = initialFrameIndex;
        }
        /**
         * Begins animating the sprite.  If `reset` is `false` and animation is already started, has no effect.
         * @param reset If `true`, resets the sprite to its initial frame index and restarts the timer.
         */
        Sprite.prototype.animate = function (reset) {
            var _this = this;
            if (reset === void 0) { reset = false; }
            if (reset) {
                clearInterval(this.frameInterval);
                this.frameInterval = null;
                this.currentFrameIndex = this.initialFrameIndex;
            }
            if (!this.frameInterval) {
                this.frameInterval = window.setInterval(function () {
                    return _this.currentFrameIndex = (_this.currentFrameIndex + 1) % _this.bounds.length;
                }, this.timePerFrame);
            }
        };
        /**
         * Stops the sprite's animation.
         */
        Sprite.prototype.stop = function () {
            clearInterval(this.frameInterval);
            this.frameInterval = null;
        };
        Sprite.prototype.render = function (x, y, width, height, renderOrigin) {
            if (width === void 0) { width = -1; }
            if (height === void 0) { height = -1; }
            if (renderOrigin === void 0) { renderOrigin = RenderOrigin.TopLeft; }
            if (typeof (x) !== 'number') {
                if (y !== undefined) {
                    renderOrigin = y;
                }
                var canvasBounds = x;
                x = canvasBounds.x;
                y = canvasBounds.y;
                width = canvasBounds.w;
                height = canvasBounds.h;
            }
            var ctx = this.ctx, frameBounds = this.bounds[this.currentFrameIndex], img = this.spriteSheet;
            if (width === -1) {
                width = frameBounds.w;
            }
            if (height === -1) {
                height = frameBounds.h;
            }
            if (renderOrigin === RenderOrigin.Center) {
                x -= width / 2;
                y -= height / 2;
            }
            ctx.save();
            ctx.drawImage(img, frameBounds.x, frameBounds.y, frameBounds.w, frameBounds.h, x, y, width, height);
            ctx.restore();
        };
        return Sprite;
    }());
    exports["default"] = Sprite;
});
