const socket = io();

let players = {};
let currentSteps = {};
let clientId = null;
let gameId = null;

let gameStarted = false;

const btnStart = document.getElementById("btnStart");
const btnReady = document.getElementById("btnReady");

const canvasView = document.getElementById("canvas");
const gameContainer = document.getElementById("gameContainer");
const menuContainer = document.getElementById("menuContainer");
const idCardContainer = document.getElementById("cardContainer");
const endGameContainer = document.getElementById("endGameContainer");
const gameTimer = document.getElementById("gameTimer");
const overlay = document.getElementById("overlay");

const diceContainer = document.querySelector(".dice-container");
const btnRollDice = document.querySelector(".btn-roll-dice");

const hostThings = document.getElementById("hostThings");

const gameIdText = document.getElementById("gameIdText");

const cardContainer = document.getElementById("cardContainer");

const displayName = document.querySelectorAll("#name");
const displayRandomId = document.querySelectorAll("#card-number");

const userName = getParameterByName("userName");

let allReady = false;
let ready = false;
let playerDrawACard = false;
let isWindowFocused = false;
let currentPlayerId = null;

const colors = ["Red", "Green", "Blue", "Yellow", "Black", "White"];
let currentColorIndex = 0;

const photos = [
    "/obrazky/hra/babis.webp",
    "/obrazky/hra/stalin.webp",
    "/obrazky/hra/lenin.webp",
    "/obrazky/hra/mao.webp",
    "/obrazky/hra/gottwald.webp",
    "/obrazky/hra/havel.webp"
];
let currentPhotoIndex = 0;

let secondsElapsed = 0;
let timerInterval = null;

function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

socket.on("connectClient", (data) => {
    clientId = data.clientId;
    console.log("Client ID: ", clientId);
});

socket.on("gameNotFound", () =>{
    alert("Zadali jste spatny kod hry, vratime vas na uvodni stranku...");
    window.location.href = "../index.html";
});

socket.on("allPlayersLeft", (data) => {
    if(data.started == true){
        alert("Vsichni hraci se odpojili, vratime vas na uvodni stranku....");
        window.location.href = "../index.html";
    }
});

socket.on("gameAlreadyStarted", () =>{
    alert("Hra uz zacala, vratime vas na uvodni stranku...");
    window.location.href = "../index.html";
});

socket.on("createGame", (data) => {
    gameId = data.game.id;
    if(gameIdText){
        gameIdText.textContent = gameId;
    }
    console.log("Game ID: ", gameId);
    socket.emit("join",  {gameId, userName} );
});

socket.on("gameStarted", (data) =>{
    data.clients.forEach(() =>{
        socket.emit("nextTurn", {gameId});
        menuContainer.style.display = "none";
        gameContainer.style.display = "block";
        idCardContainer.style.display = "block";
        diceContainer.style.display = "block";
        btnRollDice.style.display = "block";
        endGameContainer.style.display = "none";
        gameStarted = true;
        startTimer();
    });
});

socket.on("readyClient", (data) =>{
    updatePlayerStatus(data);
});

socket.on("allPlayersReady", (data) =>{
    allReady = data;
});

socket.on("updateColor", (data) =>{
    const player = players[data.clientId];
    if(player){
        player.clear();
        player.lineStyle(2, 0x000000);
        player.beginFill(PIXI.utils.string2hex(data.color));
        player.drawCircle(0, 0, 8);
        player.endFill();

        player.color = data.color;

        const playerContainer = document.querySelector(`[data-client-id="${data.clientId}"]`);
        playerContainer.style.background = data.color;
        handlePlayerColor(data.color, data.clientId);
    }
});

socket.on("updatePhoto", (data) => {
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    if (idCard) {
        const photoElement = idCard.querySelector(".photo");
        if (photoElement) {
            photoElement.style.backgroundImage = `url(${data.photo})`;
        }
    }
});

socket.on("newHost", () =>{
    btnStart.style.display = "block";
    hostThings.style.display = "block";
    gameIdText.textContent = gameId;
});

document.addEventListener("DOMContentLoaded", () =>{
    const isHost = getParameterByName("host") === "true";
    if(isHost){
        socket.emit("create");
        btnStart.style.display = "block";
        hostThings.style.display = "block";
    }
    else{
        gameId = getParameterByName("gameId");
        const userName = getParameterByName("userName");
        socket.emit("join", {gameId, userName});
    }
});

btnStart.addEventListener("click", () =>{
    const playerColors = Object.values(players).map(player => player.color);
    const allSameColor = playerColors.every(color => color === playerColors[0]);
    if(allSameColor && Object.keys(players).length != 1){
        const errMes = document.getElementById("errorMessage");
        errMes.textContent = "!!hráči mají stejnou barvu, změňtě barvu!!";
        errMes.style.display = "block";

        setTimeout(() =>{
            errMes.style.display = "none";
        }, 3000);
        return;
    }
    if(allReady == true && Object.keys(players).length > 1 && !allSameColor){
        socket.emit("startGame", {gameId});
    }
    if(Object.keys(players).length == 1){
        const errMes = document.getElementById("errorMessage");
        errMes.style.display = "block";

        setTimeout(() =>{
            errMes.style.display = "none";
        }, 3000);
    }
});

btnReady.addEventListener("click", () =>{
    ready = !ready;

    socket.emit("buttonReady", {clientId, gameId, ready});
});

function changeColor(value) {
    if(value == -1){
        currentColorIndex = (currentColorIndex - 1 + colors.length) % colors.length;
    }
    else{
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
    document.getElementById("colorCircle").style.backgroundColor = colors[currentColorIndex];
    const color = colors[currentColorIndex];
    socket.emit("changeColor", {color, clientId, gameId});
}

function changePhoto(value) {
    if (value == -1) {
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    } else {
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    }
    const newPhoto = photos[currentPhotoIndex];
    document.getElementById("photoPreview").style.backgroundImage = `url(${newPhoto})`;

    socket.emit("changePhoto", {photo: newPhoto, clientId, gameId});
}

function updatePlayerStatus(game){
    const divPlayer = document.getElementById("players");

    Array.from(divPlayer.children).forEach(playerDiv => {
        const playerClientId = playerDiv.getAttribute("data-client-id");

        const player = game.clients.find(c => c.clientId === playerClientId);

        if (player) {
            const readyIndicator = playerDiv.querySelector(".ready-indicator");
            readyIndicator.textContent = player.ready ? " ✔️" : " ❌";
        }
    });
}

window.changeColor = changeColor;

window.changePhoto = changePhoto;

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = seconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

function startTimer(){
    if(timerInterval !== null) return;
    gameTimer.style.display = "block";
    timerInterval = setInterval(() => {
        secondsElapsed++;
        gameTimer.textContent = `Čas: ${formatTime(secondsElapsed)}`;
    }, 1000);
}

function stopTimer() {
    gameTimer.style.display = "none";
    clearInterval(timerInterval);
    timerInterval = null;
}

function toggleOverlays(shouldShow){
    if(shouldShow){
        overlayCanvas.visible = true;
        gsap.to(overlayCanvas, { alpha: 0.6, duration: 2 });
        overlay.style.display = "block";
    }
    else{
        gsap.to(overlayCanvas, { alpha: 0, duration: 1, onComplete: () => {overlayCanvas.visible = false;}});
        overlay.style.display = "none";
    }
}

let goodCard = createCardSprites("/obrazky/hra/ikonaGoodCard.jpg", 9, 7);

let badCard = createCardSprites("/obrazky/hra/ikonaBadCard.jpg", 9, 203);

function createCardSprites(imageUrl, x, y){
    let card = new PIXI.Sprite(PIXI.Texture.WHITE);
    card.width = 110;
    card.height = 170;
    card.x = x;
    card.y = y;

    PIXI.Assets.load(imageUrl).then((texture) => {
        card.texture = texture;
        card.alpha = 1;
    });

    return card;
}

let overlayCanvas = new PIXI.Sprite(PIXI.Texture.WHITE);
overlayCanvas.width = 980;
overlayCanvas.height = 680;
overlayCanvas.alpha = 0;
overlayCanvas.tint = 0x000000;
overlayCanvas.visible = false;

const app = new PIXI.Application({
    width: 980,
    height: 680,
    backgroundColor: 0xffffff,
    antialias: true,
});

if(canvasView){
    canvasView.appendChild(app.view);
}

PIXI.Assets.load("/obrazky/hra/deskaHry.jpg").then((texture) => {
    app.stage.sortableChildren = true;
    let background = new PIXI.Sprite(texture);
    background.width = app.screen.width;
    background.height = app.screen.height;
    background.zIndex = 0;
    overlayCanvas.zIndex = 3;
    goodCard.zIndex = 4;
    badCard.zIndex = 4;
    app.stage.addChild(background);
    app.stage.addChild(overlayCanvas);
    app.stage.addChild(goodCard);
    app.stage.addChild(badCard);
});

socket.on("joinGame", (data) => {
    setTimeout(() => {
        const game = data.game;
        const divPlayer = document.getElementById("players");
        gameId = data.game.id;

        while (divPlayer.firstChild) {
            divPlayer.removeChild(divPlayer.firstChild);
        }

        let fragment = document.createDocumentFragment();
        game.clients.forEach(c => {
            let d = document.createElement("div");
            d.style.display = "flex";
            d.style.alignItems = "center";
            d.style.width = "300px";
            d.style.color = "White";
            d.style.background = c.color;

            let playerIdText = document.createElement("span");
            playerIdText.textContent = c.userName;
            playerIdText.style.marginLeft = "5px";
            d.appendChild(playerIdText);
            d.setAttribute("data-client-id", c.clientId);

            let readyIndicator = document.createElement("span");
            readyIndicator.classList.add("ready-indicator");
            readyIndicator.textContent = c.ready ? " ✔️" : " ❌";
            d.appendChild(readyIndicator);

            console.log(c);
            const idCard = document.querySelector(`.id-card[data-clientId="${c.clientId}"]`);
            if (!idCard) {
                const idCard = createIdCard(c);
                cardContainer.appendChild(idCard);
            }

            fragment.appendChild(d);

            if (!players[c.clientId]) {
                createPlayer(c.color, c.clientId);
            }
        });

        divPlayer.appendChild(fragment);
    }, 400);

});

socket.on("turn", (data) => {
    currentPlayerId = data.clientId;

    const allIdCards = document.querySelectorAll(".id-card");

    allIdCards.forEach(card =>{
        if(card.getAttribute("data-clientId") === currentPlayerId){
            card.classList.add("active");
            card.classList.remove("inactive");
        }
        else{
            card.classList.remove("active");
            card.classList.add("inactive");
        }
    });

    if (currentPlayerId === clientId) {
        btnRollDice.disabled = false;
    }
    else{
        btnRollDice.disabled = true;
    }
});

window.onfocus = () =>{
    isWindowFocused = false;
}

window.onblur = () =>{
    isWindowFocused = true;
}

socket.on("gameEnded", (data) => {
    const player = players[data.clientId];
    player.prohra = true;
    app.stage.removeChild(players[data.clientId]);
    gameStarted = false;

    document.getElementById("gameContainer").style.display = "none";
    idCardContainer.style.display = "none";
    diceContainer.style.display = "none";
    btnRollDice.style.display = "none";
    let endGameContainer = document.getElementById("endGameContainer");
    let endGamePlayers = document.getElementById("endGamePlayers");
    let endGameTimer = document.getElementById("endGameTimer");
    endGameContainer.style.display = "block";

    stopTimer();
    endGameTimer.textContent = `Čas: ${formatTime(secondsElapsed)}`;

    data.game.clients.forEach(c =>{
        if(document.querySelector(`#endGamePlayers div[clientId="${c.clientId}"]`)){
            return;
        }
        const player = players[c.clientId];
        const playerDiv = document.createElement("div");
        playerDiv.setAttribute("clientId", c.clientId);
        playerDiv.style.marginBottom = "10px";

        const statusText = player.vyhra ? "Utekl/a do BRD" : "Prohrál/a";
        playerDiv.innerHTML = `<strong>${c.userName}</strong>: ${statusText}`;

        endGamePlayers.appendChild(playerDiv);
    });

    document.getElementById("restartGameBtn").addEventListener("click", () => {
        socket.emit("restartGame", { gameId });
    });

    document.getElementById("btnMenu").addEventListener("click", () =>{
        window.location.href = "../index.html";
    });
});

socket.on("restartGame", (data) =>{
    const game = data.game;
    const divPlayer = document.getElementById("players");
    const cardContainer = document.getElementById("cardContainer");
    const endDivPlayer = document.getElementById("endGamePlayers");
    secondsElapsed = 0;
    gameId = data.game.id;
    endGameContainer.style.display = "none";
    menuContainer.style.display = "block";
    players = {};
    currentSteps = {};
    while (divPlayer.firstChild) {
        divPlayer.removeChild(divPlayer.firstChild);
        cardContainer.removeChild(cardContainer.firstChild);
        endDivPlayer.removeChild(endDivPlayer.firstChild);
    }
    setTimeout(() => {
        while (divPlayer.firstChild) {
            divPlayer.removeChild(divPlayer.firstChild);
        }

        let fragment = document.createDocumentFragment();
        game.clients.forEach(c => {
            let d = document.createElement("div");
            d.style.display = "flex";
            d.style.alignItems = "center";
            d.style.width = "300px";
            d.style.color = "White";
            d.style.background = c.color;

            let playerIdText = document.createElement("span");
            playerIdText.textContent = c.userName;
            playerIdText.style.marginLeft = "5px";
            d.appendChild(playerIdText);
            d.setAttribute("data-client-id", c.clientId);

            let readyIndicator = document.createElement("span");
            readyIndicator.classList.add("ready-indicator");
            readyIndicator.textContent = c.ready ? " ✔️" : " ❌";
            d.appendChild(readyIndicator);

            if (!document.querySelector(`.id-card[data-clientId="${c.clientId}"]`)) {
                const idCard = createIdCard(c);
                cardContainer.appendChild(idCard);
            }

            fragment.appendChild(d);

            if (!players[c.clientId]) {
                createPlayer(c.color, c.clientId);
            }
        });

        divPlayer.appendChild(fragment);
    }, 400);
});