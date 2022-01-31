import Game from "./game.js";
import * as db from "./db.js";
import { formatTime } from "./consts.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const mainMenu = document.getElementById("mainMenu");
const gameOverDiv = document.getElementById("gameOver");

const addToLeaderboardBtn = document.getElementById("addToLeaderboard");
const addLeaderboardPopup = document.getElementById("addLeaderboardPopup");
const addLeaderboardBtnDone = document.getElementById("addToLeaderboardDone");
const leaderboardDiv = document.getElementById("leaderboard");

const updateLeaderboard = async () => {
    const leaderboard = await db.getLeaderboard();

    let text = `<h3 id="leaderboardTitle">Leaderboard</h3>
    <table>
        <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Time</th>
            </tr>`;
            
    for (let i = 0; i < leaderboard.length; i++) {
        const { name, score, time } = leaderboard[i];
        text += `<tr>
            <td>${i + 1}</td>
            <td>${name.slice(0, 16)}</td>
            <td>${score}</td>
            <td>${formatTime(time)}</td>
        </tr>`;
    }   

    text += "</table>";

    leaderboardDiv.innerHTML = text;
};

updateLeaderboard();

let onPopup = false;

let gameStarted = false;
let gameInstance = new Game(canvas, () => {
    // on game over
    gameStarted = false;

    addToLeaderboardBtn.style = "";
    // canvas.style.zIndex = "-1";

    leaderboardDiv.style.opacity = "1";

}); // Create a new game instance

const startGame = () => {
    mainMenu.style.opacity = "0";
    gameOverDiv.style.opacity = "0";
    gameOver.style.zIndex = "2000";
    // canvas.style.zIndex = "9999";
    leaderboardDiv.style.opacity = "0";

    gameStarted = true;

    gameInstance.start(); // Start the game

    window.gameInstance = gameInstance;
};

window.addEventListener("keydown", (event) => {
    if (event.key === " " && !gameStarted && !onPopup) {
        // console.log("hi")

        startGame();
    }
});

// create event handler for screen presses

window.addEventListener("touchstart", (event) => {
    if (!gameStarted) {
        startGame();
    }
});

addToLeaderboardBtn.addEventListener("click", (ev) => {
    addLeaderboardPopup.style.opacity = "1";
    addLeaderboardPopup.style.zIndex = "3000";
    onPopup = true;
});

addLeaderboardBtnDone.addEventListener("click", (ev) => {
    const name = document.getElementById("name").value;
    const time = gameInstance.timeMs;
    const score = gameInstance.coinCount;

    db.addToLeaderboard(score, time, name);

    addLeaderboardPopup.style.opacity = "0";
    addLeaderboardPopup.style.zIndex = "-1";

    onPopup = false;

    addToLeaderboardBtn.style = "pointer-events: none; opacity: 0.5;";
});
