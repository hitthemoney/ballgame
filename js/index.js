import * as physics from "./physics.js";
import Game from "./game.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const mainMenu = document.getElementById("mainMenu");
const gameOverDiv = document.getElementById("gameOver");

let gameStarted = false;
let gameInstance = new Game(canvas, () => {
    // on game over
    gameStarted = false;
}); // Create a new game instance

const startGame = () => {
    mainMenu.style.opacity = "0";
    gameOverDiv.style.opacity = "0";

    gameStarted = true;

    gameInstance.start(); // Start the game

    window.gameInstance = gameInstance;
};

window.addEventListener("keydown", (event) => {
    if (event.key === " " && !gameStarted) {
        // console.log("hi")
        
        startGame();
    }
});
