const pastelColors = ["#ff9aa2", "#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea"];

const mainCharacterColor = "#ffbc05";

const coinImg = new Image();
coinImg.src = "img/coin.png";

const formatTime = (timeInput) => {
    const time = new Date(timeInput);
    const minutes = ("0" + time.getMinutes()).slice(-2);
    const seconds = ("0" + time.getSeconds()).slice(-2);
    const ms = Math.round(time.getMilliseconds() / 10);
    return `${minutes}:${seconds}:${ms}`;
}

export {
    pastelColors,
    mainCharacterColor,
    coinImg,
    formatTime
}