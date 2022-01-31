import * as physics from "./physics.js";
import { pastelColors, mainCharacterColor, coinImg, formatTime, perfectFrameTime } from "./consts.js";

const gameOverDiv = document.getElementById("gameOver");
const pausedScreenDiv = document.getElementById("pausedScreen");
const timerText = document.getElementById("timerText");
const endTimeText = document.getElementById("endTime");
const bestTimeText = document.getElementById("bestTime");
const scoresDiv = document.getElementById("scores");
const coinsText = document.getElementById("coinScore");
const bestScoreText = document.getElementById("bestScore");
const endScoreText = document.getElementById("endScore");

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

        this.player = {};

        this.playing = false;
        this.gameOver = false;

        this.coinCount = 0;
        coinsText.innerText = this.coinCount;

        window.addEventListener("keydown", (event) => {
            if (!this.gameOver && event.key === " ") {
                // console.log("hi2");
                this.togglePlay();
            }
            // console.log(event.key.toLowerCase())
            if (!this.gameOver && this.playing) {
                const walkLen = 2;
                switch (event.key.toLowerCase()) {
                    case "w":
                    case "arrowup":
                        this.player.yQueue = -walkLen;
                        this.player.xQueue = 0;
                        break;
                    case "s":
                    case "arrowdown":
                        this.player.yQueue = walkLen;
                        this.player.xQueue = 0;
                        break;
                    case "a":
                    case "arrowleft":
                        this.player.xQueue = -walkLen;
                        this.player.yQueue = 0;
                        break;
                    case "d":
                    case "arrowright":
                        this.player.xQueue = walkLen;
                        this.player.yQueue = 0;
                        break;
                }
            }
        });

        // make event listener for up swipe gesture

        let touchstartX = 0;
        let touchendX = 0;
        let touchstartY = 0;
        let touchendY = 0;

        const handleGesture = () => {
            const walkLen = 2;

            let deltaX = touchendX - touchstartX;
            let deltaY = touchendY - touchstartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.player.yQueue = 0;
                if (deltaX > 0) {
                    this.player.xQueue = walkLen;
                } else {
                    this.player.xQueue = -walkLen;
                }
            } else {
                this.player.xQueue = 0;
                if (deltaY > 0) {
                    this.player.yQueue = walkLen;
                } else {
                    this.player.yQueue = -walkLen;
                }
            }

           
        };

        document.body.addEventListener("touchstart", (e) => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        });

        document.body.addEventListener("touchend", (e) => {
            touchendX = e.changedTouches[0].screenX;
            touchendY = e.changedTouches[0].screenY;
            handleGesture();
        });

        this.animationFrameID = 0;

        this.coins = [];
        this.coinQueues = [];
        this.blinking = false;
    }

    addCoin() {
        this.coins.push({
            x: Math.min(
                Math.max(50, Math.random() * this.canvas.width),
                this.canvas.width - 50
            ),
            y: Math.min(
                Math.max(50, Math.random() * this.canvas.height),
                this.canvas.height - 50
            ),
            r: 17,
            isCoin: true,
            img: coinImg,
            idx: this.coins.length,
        });
    }

    start() {
        cancelAnimationFrame(this.animationFrameID);
        this.frameCount = 0;
        this.frame();
        this.playing = true;
        this.gameOver = false;
        this.player.x = canvas.width / 2;
        this.player.y = canvas.height / 2;
        this.objects = [];
        this.coins = [];
        this.coinQueues.forEach((id) => {
            clearTimeout(id);
        });
        this.coinQueues = [];
        this.coinCount = 0;
        coinsText.innerText = this.coinCount;

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
            color: mainCharacterColor,
        };

        // console.log(this.player, this.objects);

        this.timeMs = 0;

        setTimeout(() => {
            this.lastFrameMs = Date.now();
            scoresDiv.style.opacity = "1";
            for (let i = 0; i < 3; i++) {
                this.addCoin();
            }
            for (let i = 0; i < 30; i++) {
                this.addObject(15); // Add an object to the game
            }
        }, 1000);

        // console.log("hello")
        let interval = setInterval(() => {
            // console.log("lol", this.timeMs)
            this.blinking = !this.blinking;
            if (this.timeMs > 3000 && !isNaN(this.timeMs)) clearInterval(interval);
        }, 300);


        // .forEach((obj) => {
        //     obj.x = Math.random() * this.canvas.width;
        //     obj.y = Math.random() * this.canvas.height;
        // });
    }

    addObject(radius = 20) {
        this.objects.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            ...this.initStartingPhysics(),
            // vx: 0,
            // vy: 0,
            // m: 0.1,
            // fx: 0,
            // fy: 0,
            r: radius,
            isPlayer: false,
            color: pastelColors[
                Math.floor(Math.random() * pastelColors.length)
            ],
        });
    }

    initStartingPhysics() {
        return {
            vx: 1 * Math.random(),
            vy: 1 * Math.random(),
            m: 0.1,
            fx: 0,
            fy: 0,
        };
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

    frame() {
        const diffMs = Date.now() - this.lastFrameMs;

        const deltaTime = diffMs / perfectFrameTime;

        // console.log(deltaTime);

        if (!this.gameOver) {
            this.timeMs += diffMs;
        }

        timerText.innerText = formatTime(this.timeMs);

        this.lastFrameMs = Date.now();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.fillRect(this.frameCount % window.innerWidth, this.frameCount % window.innerHeight, 100, 100);

        let allObjs = [this.player, ...this.objects];

        physics.moveWithGravity(2 * deltaTime, this.objects);
        physics.checkEdgeCollision(allObjs, this.canvas);

        let moveLen = 4 * deltaTime;


        if (this.player.yQueue > 0) {
            this.player.y += moveLen;
            if (this.player.y + 15 >= this.canvas.height) {
                this.player.yQueue = -10;
                // console.log("hit bottom");
            }
            // this.player.yQueue -= 1;
        }

        if (this.player.xQueue > 0) {
            this.player.x += moveLen;
            // console.log(this.player.x, this.canvas.width);
            if (this.player.x + this.player.r >= this.canvas.width) {
                // console.log("right most screen");
                this.player.xQueue = -10;
            }
            // this.player.xQueue -= 1;
        }

        if (this.player.yQueue < 0) {
            this.player.y -= moveLen;
            if (this.player.y - this.player.r <= 0) {
                // console.log("top of screen");
                this.player.yQueue = 10;
            }
            // this.player.yQueue += 1;
        }

        if (this.player.xQueue < 0) {
            this.player.x -= moveLen;
            if (this.player.x - this.player.r <= 0) {
                this.player.xQueue = 10;
                // console.log("left most screen");
            }
            // this.player.xQueue += 1;
        }

        // loop through this.objects
        for (let obj of allObjs) {
            // this.ctx.fillRect(obj.x, obj.y, obj.r, obj.r);

            this.ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            this.ctx.fillStyle = obj.color;

            if (obj.isPlayer && this.blinking && (this.timeMs < 3000 || isNaN(this.timeMs))) {
                this.ctx.globalAlpha = 0.5;
            } else {
                this.ctx.globalAlpha = 1;
            }

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

        const modifCoins = this.coins.filter((coin) => !!coin);

        for (let coin of modifCoins) {
            this.ctx.drawImage(
                coin.img,
                coin.x - coin.r,
                coin.y - coin.r,
                coin.r * 2,
                coin.r * 2
            );
        }

        let collisions = [];
        for (let [i, o1] of [...modifCoins, ...allObjs].entries()) {
            for (let [j, o2] of [...modifCoins, ...allObjs].entries()) {
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
            if (!col.o1.isCoin && !col.o2.isCoin) {
                physics.resolveCollisionWithBounce(col);
            }
            if (col.o1.isPlayer || col.o2.isPlayer) {
                if (col.o1.isCoin || col.o2.isCoin) {
                    this.onCoinTouch(col.o1.isCoin ? col.o1 : col.o2);
                } else if (!(this.timeMs < 3000 || isNaN(this.timeMs))) {
                    if (!this.gameOver) {
                        this.lose();
                    }
                }
            }
        }

        if (this.gameOver) {
            // this.lose();
        }

        this.frameCount++;
        this.animationFrameID = requestAnimationFrame(() => {
            if (this.playing) {
                this.frame();
            }
        });
    }

    lose() {
        // this.togglePlay();
        this.gameOver = true;
        // this.player.xQueue = 0;
        // this.player.yQueue = 0;
        let bestTime = parseInt(localStorage.getItem("ballgame_highscore"));
        if (isNaN(bestTime)) {
            bestTime = this.timeMs;
        } else if (this.timeMs > bestTime) {
            bestTime = this.timeMs;
        }

        // console.log(this.timeMs, bestTime, formatTime(bestTime))

        localStorage.setItem("ballgame_highscore", bestTime);

        let bestScore = parseInt(
            localStorage.getItem("ballgame_highscore_coin")
        );
        if (isNaN(bestScore)) {
            bestScore = this.coinCount;
        } else if (this.coinCount > bestScore) {
            bestScore = this.coinCount;
        }

        localStorage.setItem("ballgame_highscore_coin", bestScore);

        gameOverDiv.style.opacity = "1";
        endTimeText.innerText = "Time: " + formatTime(this.timeMs);
        // bestTimeText.innerText = "Best: " + formatTime(bestTime);
        bestScoreText.innerText = "Best: " + bestScore;
        endScoreText.innerText = "Score: " + this.coinCount;
        scoresDiv.style.opacity = "0";

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

    onCoinTouch(coin) {
        // console.log(coin);
        this.coinCount += 1;
        coinsText.innerText = this.coinCount;
        delete this.coins[coin.idx];
        // this.coins.splice(coin.idx, 1);
        this.coinQueues.push(
            setTimeout(() => {
                this.addCoin();
            }, 5000 * Math.random())
        );
    }
}

export default Game;
