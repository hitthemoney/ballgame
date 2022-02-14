const pastelColors = [
    "#ff9aa2",
    "#ffb7b2",
    "#ffdac1",
    "#e2f0cb",
    "#b5ead7",
    "#c7ceea",
];

const mainCharacterColor = "#ffbc05";

const perfectFrameTime = 1000 / 60;

const gravitationalConstant = -98;

const coinImg = new Image();
coinImg.src = "img/coin.svg";

const sloMoImg = new Image();
sloMoImg.src = "img/slo_mo.svg";

const powerUps = [
    {
        name: "sloMo",
        img: sloMoImg,
        duration: 5000,
        active: false,
        onMap: false,
        last: Date.now(),
        x: 0,
        y: 0,
        r: 17,
        isPowerUp: true,
        onActivate() {
            this.active = true;
            this.onMap = false;
            this.powerUpTimeout = setTimeout(() => {
                this.active = false;
            }, this.duration);
            this.last = Date.now() + this.duration;
        },
        effect() {
            
        },
    },
];

const formatTime = (timeInput) => {
    const time = new Date(timeInput);
    const minutes = ("0" + time.getMinutes()).slice(-2);
    const seconds = ("0" + time.getSeconds()).slice(-2);
    const ms = Math.round(time.getMilliseconds() / 10);
    return `${minutes}:${seconds}:${ms}`;
};

const ballSpeed = 1.5;

export {
    pastelColors,
    mainCharacterColor,
    coinImg,
    formatTime,
    perfectFrameTime,
    gravitationalConstant,
    ballSpeed,
    powerUps,
};
