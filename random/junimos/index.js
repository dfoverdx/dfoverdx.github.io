(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/sprite"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var sprite_1 = require("./src/sprite");
    (function () {
        'use strict';
        Array.prototype.shuffle = function () {
            for (var i = 0; i < this.length - 1; i++) {
                var j = Math.floor(Math.random() * (this.length - i));
                var tmp = this[j + i];
                this[j + i] = this[i];
                this[i] = tmp;
            }
        };
        var Color = net.brehaut.Color;
        var drift = 12;
        // Declare us some global vars
        var canvas, ctx, width, height, mouseParticles, layer2Particles, followingParticles, mouse, numParticles, colors, trailHead, trailLength, trailOpacity;
        // Generic Particle constructor
        function Particle(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.speed = 0.01 + Math.random() * 0.02;
            this.offset = -25 + Math.random() * 50;
            this.angle = Math.random() * 360;
            this.target = null;
            this.targetX = null;
            this.targetY = null;
            this.vx = null;
            this.vy = null;
            this.trail = new Array(trailLength);
            this.followsMouseParticle = false;
            this.sprite = null;
        }
        Particle.prototype = {
            constructor: Particle,
            draw: function (ctx) {
                this.trail[trailHead] = {
                    x: this.x,
                    y: this.y
                };
                var color = new Color(this.color);
                ctx.save();
                ctx.globalCompositeOperation = 'lighten';
                ctx.lineCap = 'round';
                ctx.lineWidth = this.radius * 2;
                var foundFirst = false;
                var gradient;
                for (var i = 1; i <= trailLength; i++) {
                    var x = void 0;
                    var p = this.trail[(trailHead + i) % trailLength];
                    if (!p) {
                        continue;
                    }
                    else {
                        x = p.x - (trailLength - i) * drift;
                        if (!foundFirst) {
                            ctx.moveTo(x, p.y);
                            ctx.beginPath();
                            gradient = ctx.createLinearGradient(x, p.y, this.x, this.y);
                            gradient.addColorStop(0, 'transparent');
                            gradient.addColorStop(0.7, color.setAlpha(0.5).toCSS());
                            gradient.addColorStop(1, this.color);
                            foundFirst = true;
                        }
                        else {
                            ctx.lineTo(x, p.y);
                        }
                    }
                }
                ctx.strokeStyle = gradient;
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.globalCompositeOperation = 'lighten';
                ctx.fillStyle = this.color;
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                if (this.sprite) {
                    this.sprite.render({ x: this.x, y: this.y, w: 152, h: 152 }, RenderOrigin.Center);
                }
                // ctx.save();
                // ctx.beginPath();
                // ctx.moveTo(this.x, this.y);
                // ctx.lineTo(this.targetX, this.targetY);
                // ctx.lineTo(this.target.targetX, this.target.targetY);
                // ctx.strokeStyle = 'green';
                // ctx.stroke();
                // ctx.restore();
            }
        };
        var spriteSheet = new Image();
        spriteSheet.src = './junimo.png';
        spriteSheet.onload = init;
        function init() {
            // Assign global vars accordingly
            canvas = document.querySelector('canvas');
            ctx = canvas.getContext('2d');
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            trailHead = 0;
            trailLength = Math.floor(width * 0.9 / drift);
            // Get mouse positions
            mouse = getMousePos(canvas);
            // Two arrays to hold our rotating and 'following' particles
            mouseParticles = [];
            layer2Particles = [];
            followingParticles = [];
            numParticles = 5;
            colors = ['#5BCEFA', '#F5A9B8', '#DDDDDD'];
            // Generate particles to rotate our mouse
            generateParticles(mouseParticles, numParticles, 0, function () { return 0; });
            generateParticles(layer2Particles, numParticles, 0, function () { return Math.random() * height; });
            // Generate particles, which follow the mouse particles
            generateParticles(followingParticles, numParticles, 0, function () { return Math.random() * height; });
            for (var i = 0; i < followingParticles.length; i++) {
                var p = followingParticles[i];
                var bounds = new Array(4);
                for (var j = 0; j < bounds.length; j++) {
                    bounds[j] = { x: j * 152, y: (i % colors.length) * 152, w: 152, h: 152 };
                }
                p.sprite = new sprite_1["default"](ctx, spriteSheet, bounds, 100);
                p.sprite.animate();
            }
            setInterval(drawFrame, 1000 / 60);
        }
        // Generic function for generating particles
        function generateParticles(particlesArray, count, x, y) {
            var i, particle;
            for (i = 0; i < count; i++) {
                if (particlesArray === followingParticles) {
                    particle = new Particle(x, y(), 50 / 1080 * height, colors[i % colors.length]);
                    particle.target = layer2Particles[i];
                }
                else {
                    particle = new Particle(x, y());
                    if (particlesArray === layer2Particles) {
                        particle.target = mouseParticles[i];
                        particle.followsMouseParticle = true;
                    }
                }
                particlesArray.push(particle);
            }
        }
        function dimLastFrame() {
            ctx.clearRect(0, 0, width, height);
            // ctx.translate(-drift, 0);
            // driftOffset += drift;
            // const drift = 10;
            // var lastImage = ctx.getImageData(drift, 0, width - drift, height);
            // ctx.clearRect(width - drift, 0, drift, height);
            //   // var pixelData = lastImage.data;
            //   // for (let i = 3; i < pixelData.length; i += 4) {
            //   //     pixelData[i] -= 1;
            //   // }
            // ctx.putImageData(lastImage, 0, 0);
        }
        function drawFrame() {
            window.requestAnimationFrame(function () {
                dimLastFrame();
                mouseParticles.forEach(rotateParticle);
                layer2Particles.forEach(updateParticle);
                followingParticles.forEach(updateParticle);
                followingParticles.forEach(function (p) { return p.draw(ctx); });
                // drawFrame();
                trailHead = (trailHead + 1) % trailLength;
                if (trailHead === 0) {
                    mouseParticles.shuffle();
                    for (var i = 0; i < numParticles; i++) {
                        layer2Particles[i].target = mouseParticles[i];
                    }
                }
            });
        }
        // Update each of our following particles to follow the corresponding rotating one
        function updateParticle(particle, index) {
            var speed, gravity, dx, dy, dist;
            speed = 0.0045;
            gravity = 0.8;
            particle.targetX = particle.target.x;
            particle.targetY = particle.target.y;
            dx = particle.targetX - particle.x;
            dy = particle.targetY - particle.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            particle.vx += dx * speed;
            particle.vy += dy * speed;
            particle.vx *= gravity;
            particle.vy *= gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
        // Rotate our particles around the mouse one by one
        function rotateParticle(particle, index) {
            var vr, radiusY, radiusX, centerX, centerY;
            vr = 0.1;
            radiusY = height * 0.5;
            radiusX = width * 0.15;
            centerX = width * 0.8;
            centerY = height / 2;
            // Rotate the particles
            particle.x = centerX + particle.offset + Math.cos(particle.angle) * radiusX * (index % 2 ? 1 : -1);
            particle.y = centerY + particle.offset + Math.sin(particle.angle) * radiusY;
            particle.angle += particle.speed;
            // Reposition a particle if it goes out of screen
            if (particle.x - particle.radius / 2 <= -radiusY / 2) {
                particle.x = 5;
            }
            else if (particle.x + particle.radius / 2 >= width - radiusY / 2) {
                particle.x = width - 5;
            }
            else if (particle.y - particle.radius / 2 <= -radiusY / 2) {
                particle.y = 5;
            }
            else if (particle.y + particle.radius / 2 >= height - radiusY / 2) {
                particle.y = height - 5;
            }
            // particle.draw(ctx);
        }
        // Util function for getting the mouse coordinates
        function getMousePos(element) {
            var mouse = {
                x: width / 2,
                y: height / 2
            };
            element.addEventListener('mousemove', function (e) {
                mouse.x = e.pageX;
                mouse.y = e.pageY;
            }, false);
            return mouse;
        }
    }());
});
