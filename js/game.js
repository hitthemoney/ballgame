import * as physics from "./physics.js";
import { pastelColors } from "./consts.js";

const gameOverDiv = document.getElementById("gameOver");
const pausedScreenDiv = document.getElementById("pausedScreen");
const timerText = document.getElementById("timerText");
const endTimeText = document.getElementById("endTime");
const bestTimeText = document.getElementById("bestTime");

class Game {
    constructor(canvas, gameOverCallback) {
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext("2d");

        this.frameCount = 0;

        this.objects = [];

        this.gameOverCallback = gameOverCallback;

        this.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: 0,
            vy: 0,
            m: 0.1,
            fx: 0,
            fy: 0,
            r: 15,
            isPlayer: true,
            yQueue: 0,
            xQueue: 0,
            color: "#ffbc05",
        };

        this.playing = false;
        this.gameOver = false;

        window.addEventListener("keydown", (event) => {
            if (!this.gameOver && event.key === " ") {
                // console.log("hi2");
                this.togglePlay();
            }
            if (!this.gameOver && this.playing) {
                const walkLen = 10;
                switch (event.key) {
                    case "w":
                        this.player.yQueue -= walkLen;
                        break;
                    case "s":
                        this.player.yQueue += walkLen;
                        break;
                    case "a":
                        this.player.xQueue -= walkLen;
                        break;
                    case "d":
                        this.player.xQueue += walkLen;
                        break;
                }
            }
        });
    }

    start() {
        this.frame();
        this.playing = true;
        this.gameOver = false;
        this.player.x = canvas.width / 2;
        this.player.y = canvas.height / 2;
        this.objects = [];

        setTimeout(() => {
            this.timeMs = 0;
            this.lastFrameMs = Date.now();
            timerText.style.opacity = "1";
            for (let i = 0; i < 15; i++) {
                this.addObject(15); // Add an object to the game
            }
        }, 1000);
        // .forEach((obj) => {
        //     obj.x = Math.random() * this.canvas.width;
        //     obj.y = Math.random() * this.canvas.height;
        // });
    }

    addObject(radius = 20) {
        this.objects.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: 0,
            vy: 0,
            m: 0.1,
            fx: 0,
            fy: 0,
            r: radius,
            isPlayer: false,
            color: pastelColors[
                Math.floor(Math.random() * pastelColors.length)
            ],
        });
    }

    togglePlay() {
        this.playing = !this.playing;
        if (this.playing) {
            pausedScreenDiv.style.opacity = "0";
            this.lastFrameMs = Date.now();
            this.frame();
        } else {
            pausedScreenDiv.style.opacity = "1";
        }
    }

    formatTime(timeInput) {
        const time = new Date(timeInput);
        const minutes = ("0" + time.getMinutes()).slice(-2);
        const seconds = ("0" + time.getSeconds()).slice(-2);
        const ms = Math.round(time.getMilliseconds() / 10);
        return `${minutes}:${seconds}:${ms}`;
    }

    frame() {
        const diffMs = Date.now() - this.lastFrameMs;

        if (!this.gameOver) {
            this.timeMs += diffMs;
        }

        timerText.innerText = this.formatTime(this.timeMs);

        this.lastFrameMs = Date.now();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.fillRect(this.frameCount % window.innerWidth, this.frameCount % window.innerHeight, 100, 100);

        let allObjs = [this.player, ...this.objects];

        physics.moveWithGravity(1, this.objects);
        physics.checkEdgeCollision(allObjs, this.canvas);

        let moveLen = 2;

        if (this.player.yQueue > 0) {
            this.player.y += moveLen;
            this.player.yQueue -= 1;
        }

        if (this.player.xQueue > 0) {
            this.player.x += moveLen;
            this.player.xQueue -= 1;
        }

        if (this.player.yQueue < 0) {
            this.player.y -= moveLen;
            this.player.yQueue += 1;
        }

        if (this.player.xQueue < 0) {
            this.player.x -= moveLen;
            this.player.xQueue += 1;
        }

        // loop through this.objects
        for (let obj of allObjs) {
            // this.ctx.fillRect(obj.x, obj.y, obj.r, obj.r);

            this.ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            this.ctx.fillStyle = obj.color;
            // if (obj.isPlayer) {
            //     this.ctx.fillStyle = "red";
            // } else {
            //     this.ctx.fillStyle = obj.color;
            // }

            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        let collisions = [];
        for (let [i, o1] of allObjs.entries()) {
            for (let [j, o2] of allObjs.entries()) {
                if (i < j) {
                    let { collisionInfo, collided } = physics.checkCollision(
                        o1,
                        o2
                    );
                    if (collided) {
                        collisions.push(collisionInfo);
                    }
                }
            }
        }

        for (let col of collisions) {
            physics.resolveCollisionWithBounce(col);
            if (col.o1.isPlayer || col.o2.isPlayer) {
                if (!this.gameOver) {
                    this.lose();
                }
            }
        }

        if (this.gameOver) {
            // this.lose();
        }

        this.frameCount++;
        requestAnimationFrame(() => {
            if (this.playing) {
                this.frame();
            }
        });
    }

    lose() {
        // this.togglePlay();
        this.gameOver = true;

        let bestTime = parseInt(localStorage.getItem("bestTime"));
        if (isNaN(bestTime)) {
            bestTime = this.timeMs;
        } else if (this.timeMs > bestTime) {
            bestTime = this.timeMs;
        }

        // console.log(this.timeMs, bestTime, this.formatTime(bestTime))

        localStorage.setItem("bestTime", bestTime);

        gameOverDiv.style.opacity = "1";
        endTimeText.innerText = "Score: " + this.formatTime(this.timeMs);
        bestTimeText.innerText = "Best: " + this.formatTime(bestTime);
        timerText.style.opacity = "0";

        this.gameOverCallback();

        // this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.font = "50px Arial";
        // this.ctx.fillStyle = "red";
        // this.ctx.textAlign = "center";
        // this.ctx.fillText(
        //     "You lose!",
        //     this.canvas.width / 2,
        //     this.canvas.height / 2
        // );

        // window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }
}

export default Game;
