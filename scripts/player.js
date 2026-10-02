let previousIndex;

function handlePlayerColor(color, clientId){
    const playerContainer = document.querySelector(`[data-client-id="${clientId}"]`);
    if(color == "Yellow" || color == "White"){
        playerContainer.style.color = "black";
    }
    else{
        playerContainer.style.color = "white";
    }
}

socket.on("playerChangedPostaveni", (data) =>{
    const player = players[data.clientId];

    if(player){
        player.postaveni = data.postaveni;

        const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
        if(idCard){
            idCard.querySelector("#role").textContent = data.postaveni;
        }
    }
});

socket.on("playerChangeIdNumber", (data) =>{
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    if(idCard){
        idCard.querySelector("#card-number").textContent = data.randomNumber;
    }
});

socket.on("givePlayerMoney", (data) =>{
    const player = players[data.clientId];

    if(data.money == "vsechnyPrachyPryc"){
        player.money = 0;
    }
    else if(data.money == "polovinaMoneyPryc"){
        player.money -= (player.money / 2);
    }
    else{
        player.money += data.money;
    }

    if(player.money < 0){
        player.money = 0;
        player.isJail = true;
        socket.emit("movePlayer", {clientId:player.clientId, steps: 1, targetIndex: 0, gameId});
    }
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    if(idCard){
        const formattedMoney = player.money.toLocaleString('cs-CZ').replace(/\s/g, ' ');
        idCard.querySelector("#money").textContent = formattedMoney;
    }
});

socket.on("createDirectionalArrows", (data) =>{
    if(data.type == "add"){
        addDirectionArrows(data.clientId);
    }
    else if(data.type == "remove"){
        removeDirectionArrows();
    }
});

socket.on("changePlayerDirection", (data) =>{
    const player = players[data.clientId];
    if(player){
        player.direction = data.direction;
    }
});

socket.on("playerLeft", (data) =>{
    if(players[data]){
        app.stage.removeChild(players[data]);
        const playerDiv = document.querySelector(`[data-client-id="${data}"]`);
        const idCard = document.querySelector(`.id-card[data-clientId="${data}"]`);
        idCard.remove();
        playerDiv.remove();
        if(data == currentPlayerId){
            socket.emit("nextTurn", {gameId});
        }

        delete players[data];
    }
});

socket.on("playerMoved", (data) => {
    const {clientId, steps,targetIndex} = data;
    if(isWindowFocused){
        movePlayerTeleport(clientId, steps,targetIndex);
    }
    else{
        movePlayer(clientId, steps,targetIndex);
    }
});

function createPlayer(color, clientId) {
    const player = new PIXI.Graphics();
    player.lineStyle(2, 0x000000);
    player.beginFill(PIXI.utils.string2hex(color));
    player.drawCircle(0, 0, 8);
    player.zIndex = 2;
    player.endFill();

    const startPosition = spiralPath[2];
    player.x = startPosition.x * gridSize + gridSize / 2;
    player.y = startPosition.y * gridSize + gridSize / 2;

    app.stage.addChild(player);
    players[clientId] = player;
    currentSteps[clientId] = 2;

    player.postaveni = "BEZ";
    player.money = 2000;
    player.isJail = false;
    player.isBlazinec = false;
    player.vyhra = false;
    player.genPolicko = false;
    player.prohra = false;
    player.direction = "right";
    player.color = color;
    player.clientId = clientId;
    const randomNumber = randomIdNumber();
    socket.emit("getRandomIdNumber", {clientId, randomNumber, gameId});
    movePlayer(clientId,0);

    setTimeout(() =>{
        handlePlayerColor(color,clientId);
    }, 100);
}

function movePlayer(clientId, steps, targetIndex) {
    let player = players[clientId];
    let goingBack = steps < 0;
    let teleportBack = false;
    let totalSteps = steps;
    let totalGiveMoney = 0;
    if(steps == "vyhozen"){
        goingBack = true;
        steps = 0;
    }

    let currentIndex = currentSteps[clientId] || 2;

    if(targetIndex !== undefined){
        previousIndex = currentIndex;
        currentIndex = targetIndex;
        if(previousIndex > targetIndex){
            teleportBack = true;
        }
        steps = 0;
    }

    if(player.direction == "left"){
        steps *= -1;
    }

    function moveOneStep() {
        if (steps !== 0) {
            if (steps > 0) {
                currentIndex = (currentIndex + 1) % spiralPath.length;
            }
            else{
                currentIndex = (currentIndex - 1 + spiralPath.length) % spiralPath.length;
            }

            let nextPosition = spiralPathMap.get(currentIndex);

            if(nextPosition.isEnd){
                steps = 1;
                socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"END"});
            }

            gsap.to(player, {
                x: nextPosition.x * gridSize + gridSize / 2,
                y: nextPosition.y * gridSize + gridSize / 2,
                duration: 0.25,
                onComplete: () => {
                    steps > 0 ? steps-- : steps++;

                    moveOneStep();
                }
            });

            if(nextPosition.giveMoney && player.direction == "right"){
                socket.emit("givePlayerMoney", {clientId, money: nextPosition.giveMoney, gameId});
            }

            if(nextPosition.changePostaveni){
                handleChangedPostaveni(player.clientId, nextPosition);
            }

            if(nextPosition.changePostaveni == "GEN"){
                socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"GEN"});
            }

        }
        else{
            currentSteps[clientId] = currentIndex;
            let nextPosition = spiralPathMap.get(currentIndex);

            const rangeStart = Math.max(0, currentIndex - 10);
            const rangeEnd = currentIndex + 10;
            for(let i = rangeStart; i <= rangeEnd; i++){
                handleOverlappingPlayers(i);
            }

            if(targetIndex !== undefined){
                handleOverlappingPlayers(previousIndex);
                if(teleportBack == false){
                    const start = Math.min(previousIndex, currentIndex);
                    const end = Math.max(previousIndex, currentIndex);
                    for(let i = start; i <= end; i++){
                        const position = spiralPathMap.get(i);
                        if(position && position.giveMoney){
                            totalGiveMoney += position.giveMoney;
                        }
                    }
                    socket.emit("givePlayerMoney", {clientId:player.clientId, money:totalGiveMoney, gameId});
                }
            }

            if(player.postaveni == "Člen Politbyra ÚV" || player.postaveni == "Generální Tajemník ÚV strany" && goingBack == false && currentIndex != 287 || currentIndex != 361){
                handleVyhozeniHrace(player.clientId, currentIndex);
            }

            if (nextPosition.isSpecialBad || nextPosition.isSpecialGood) {
                socket.emit("playerMustDrawACard", {clientId:player.clientId, nextPosition, gameId});
            }

            if(nextPosition.changePostaveni){
                handleChangedPostaveni(player.clientId, nextPosition);
            }

            if(nextPosition.isVeksl){
                socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"Veksl"});
            }

            if(nextPosition.isDeath){
                if(nextPosition.type == "PS"){
                    socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"PS"});
                }
                else if(nextPosition.type == "EL"){
                    socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"EL"});
                }
                else if(nextPosition.type == "MINA"){
                    socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"Mina"});
                }
            }

            if(nextPosition.isEnd){
                socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:"END"});
            }

            if (nextPosition.proverky) {
                setTimeout(() => {
                    if(totalSteps == 6){
                        socket.emit("nextTurn", { gameId });
                        btnRollDice.disabled = false;
                    }
                    if (nextPosition.proverky === "ANO") {
                        socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:nextPosition.proverkyIndex, proverky:"ANO"});
                    } else if (nextPosition.proverky === "NE") {
                        socket.emit("createSpeechBox", {clientId:player.clientId, gameId, index:nextPosition.proverkyIndex, proverky:"NE"});
                    }
                }, 100);
            }

            if(player.postaveni == "Generální Tajemník ÚV strany") {
                socket.emit("changePlayerDirection", {direction:"right", clientId:player.clientId,gameId});
                socket.emit("createDirectionalArrows", {clientId:player.clientId, gameId, type:"add"});
            }
            else if(player.postaveni == "Člen Politbyra ÚV"){
                socket.emit("createDirectionalArrows", {clientId:player.clientId, gameId, type:"remove"});
            }

            if(nextPosition.changePostaveni == "POL"){
                socket.emit("changePlayerDirection", {direction:"right", clientId:player.clientId,gameId});
            }

            teleportBack = false;
        }
    }
    moveOneStep();
}

function movePlayerTeleport(clientId, steps, targetIndex) {
    let player = players[clientId];
    if(player.direction == "left"){
        steps *= -1;
    }

    setTimeout(() =>{
        let goingBack = steps < 0;
        if (!player) {
            return;
        }

        let currentIndex = currentSteps[clientId] || 2;

        if (targetIndex !== undefined) {
            currentIndex = targetIndex;
            steps = 0;
        }
        else if (steps !== 0) {
            currentIndex = (currentIndex + steps + spiralPath.length) % spiralPath.length;
        }

        let nextPosition = spiralPathMap.get(currentIndex);
        if (nextPosition) {
            player.x = nextPosition.x * gridSize + gridSize / 2;
            player.y = nextPosition.y * gridSize + gridSize / 2;

            currentSteps[clientId] = currentIndex;

            if (nextPosition.changePostaveni) {
                handleChangedPostaveni(clientId, nextPosition);
            }

            const rangeStart = Math.max(0, currentIndex - 10);
            const rangeEnd = currentIndex + 10;
            for(let i = rangeStart; i <= rangeEnd; i++){
                handleOverlappingPlayers(i);
            }

            if(player.postaveni == "Člen Politbyra ÚV" || player.postaveni == "Generální Tajemník ÚV strany" && goingBack == false && currentIndex != 287 || currentIndex != 361){
                setTimeout(() =>{
                    handleVyhozeniHrace(player.clientId, currentIndex);
                }, 5000);
            }

            if (nextPosition.isSpecialBad || nextPosition.isSpecialGood) {
                socket.emit("playerMustDrawACard", {clientId:player.clientId, nextPosition, gameId});
            }
        }

    }, 700);
}

function handleOverlappingPlayers(currentIndex) {
    let playersOnSameTile = Object.keys(players).filter(id => currentSteps[id] === currentIndex);
    let playerCount = playersOnSameTile.length;

    const offsetPosition = {
        1: [{ x: 0, y: 0 }],
        2: [{ x: -5, y: -5 }, { x: 5, y: 5 }],
        3: [{ x: 0, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }],
        4: [{ x: -5, y: -5 }, { x: 5, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }],
        5: [{ x: -5, y: -5 }, { x: 5, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }, { x: 10, y:10 }],
        6: [{ x: -5, y: -5 }, { x: 5, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }, { x: 10, y:10 }, { x: -10, y:-10 }]
    };

    let positions = offsetPosition[playerCount] || offsetPosition[4];

    playersOnSameTile.forEach((id, index) => {
        let player = players[id];
        let pos = positions[index];

        const nextPosition = spiralPathMap.get(currentIndex);

        gsap.to(player, {
            x: nextPosition.x * gridSize + gridSize / 2 + pos.x,
            y: nextPosition.y * gridSize + gridSize / 2 + pos.y,
            duration: 0.2
        });
    });
}

function handleVyhozeniHrace(playerClientId,currentIndex) {
    let playersOnSameTile = Object.keys(players).filter(id => currentSteps[id] === currentIndex);
    let playerCount = playersOnSameTile.length;

    if(playersOnSameTile > 1){
        let targetIndex;
        if(currentIndex > 361){
            targetIndex = 361;
        }
        else{
            targetIndex = 287;
        }

        playersOnSameTile.forEach((id) => {
            if(playerCount > 1){
                if(id !== playerClientId){
                    socket.emit("givePlayerMoney", {clientId: id, money: -100000, gameId});
                    socket.emit("movePlayer", {clientId: id, steps:"vyhozen", targetIndex: targetIndex, gameId});
                }
                else if(id === playerClientId){
                    socket.emit("givePlayerMoney", {clientId: playerClientId, money: 100000, gameId});
                }
            }
        });
    }
}

function handleChangedPostaveni(clientId, nextPosition){
    switch(nextPosition.changePostaveni){
        case "BEZ":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Bezpartijní", gameId});
            break;
        case "KAN":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Kandidát", gameId});
            break;
        case "KOM":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Komunista", gameId});
            break;
        case "POS":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Poslanec", gameId});
            break;
        case "UV":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Člen ÚV", gameId});
            break;
        case "POL":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Člen Politbyra ÚV", gameId});
            break;
        case "GEN":
            socket.emit("playerChangePostaveni", {clientId, postaveni: "Generální Tajemník ÚV strany", gameId});
            break;
    }
}

function randomIdNumber(){
    return Math.floor((Math.random() * 1000) + 1);
}

function createIdCard(client){
    let photo = null;
    if(client.photo){
        photo = client.photo;
    }
    else{
        photo = "/obrazky/hra/babis.webp";
    }
    let idCard = document.createElement("div");
    idCard.className = "id-card";
    idCard.setAttribute("data-clientId", client.clientId);
    idCard.innerHTML = `
        <div class="overlay-razitko"></div>
        <div class="header">KRAJSKÝ VÝBOR KSČ PRAHA</div>
        <div class="photo" id="photo" style="background-image: url(${photo}); background-size: cover; background-repeat: no-repeat;"></div>
        <div class="content">
            <div class="field" style="text-align: right; font-weight: bold;">PRŮKAZ č. <span id="card-number">555</span></div>
            <div class="field">
                <div style="font-weight: bold;">Soudr.</div>
                <div id="name">${client.userName}</div>
                <div class="dotted-line"></div>
            </div>
            <div class="field">
                <div id="role">Pracovník KV KSČ ZLÍN</div>
                <div class="dotted-line"></div>
                <div style="text-align: center; font-weight: bold;">funkce</div>
            </div>
            <div class="field" style="margin-top: 10px; font-weight: bold;">
                <div>Peníze: <span id="money">2 000</span> Kčs</div>
                <div class="dotted-line"></div>
            </div>
        </div>
        <div class="icon-container"></div>
    `;
    return idCard;
}

function createBouncingArrow(x, y) {
    const arrow = new PIXI.Graphics();

    arrow.zIndex = 4;
    arrow.beginFill(0xffffff);
    arrow.moveTo(0, 0);
    arrow.lineTo(90, 90);
    arrow.lineTo(90, -90);
    arrow.endFill();

    arrow.x = x;
    arrow.y = y;

    let bounceHeight = 10;
    let bounceSpeed = 0.02;
    let bounceOffset = 0;

    app.ticker.add(() => {
        bounceOffset += bounceSpeed;
        arrow.x = x + Math.sin(bounceOffset * Math.PI) * bounceHeight;
    });

    app.stage.addChild(arrow);

    return arrow;
}

function addDirectionArrows(clientId) {
    let arrowContainer = document.getElementById("arrow-container");
    if (!arrowContainer) {
        arrowContainer = document.createElement("div");
        arrowContainer.id = "arrow-container";
        arrowContainer.style.display = "flex";
        arrowContainer.style.justifyContent = "center";
        arrowContainer.style.marginTop = "10px";

        const leftArrow = document.createElement("button");
        leftArrow.id = "left-arrow";
        leftArrow.textContent = "←";
        leftArrow.style.margin = "0 10px";
        leftArrow.addEventListener("click", () => {
            setPlayerDirection("left",clientId);
            highlightArrow("left");
        });

        const rightArrow = document.createElement("button");
        rightArrow.id = "right-arrow";
        rightArrow.textContent = "→";
        rightArrow.style.margin = "0 10px";
        rightArrow.addEventListener("click", () => {
            setPlayerDirection("right",clientId);
            highlightArrow("right");
        });

        arrowContainer.appendChild(leftArrow);
        arrowContainer.appendChild(rightArrow);

        diceContainer.appendChild(arrowContainer);
    }
}

function highlightArrow(direction) {
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

    if (direction === "left") {
        leftArrow.style.opacity = "1";
        rightArrow.style.opacity = "0.5";
    } else if (direction === "right") {
        rightArrow.style.opacity = "1";
        leftArrow.style.opacity = "0.5";
    }
}

function setPlayerDirection(direction, clientId) {
    socket.emit("changePlayerDirection", {direction,clientId,gameId});
}

function removeDirectionArrows() {
    const arrowContainer = document.getElementById("arrow-container");
    if (arrowContainer) {
        arrowContainer.remove();
    }
}

socket.on("givePlayerRazitko", (data) =>{
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    let razitko = idCard.querySelector(".overlay-razitko");
    if(data.razitko == "smrt"){
        razitko.style.display = "block";
        razitko.style.backgroundImage = "url(/obrazky/hra/razitkoSSSR.png)";
        razitko.style.transform = "translateX(20%) scale(2.1)";
        const player = players[data.clientId];
        player.prohra = true;
        app.stage.removeChild(players[data.clientId]);
        socket.emit("disablePlayer", {clientId:data.clientId,gameId});
        socket.emit("nextTurn", {gameId});
    }
    else if(data.razitko == "vyhra"){
        razitko.style.display = "block";
        razitko.style.backgroundImage = "url(/obrazky/hra/razitkoBRD.png)";
        const player = players[data.clientId];
        player.vyhra = true;
        app.stage.removeChild(players[data.clientId]);
        removeSpecialCard("marks");
        socket.emit("disablePlayer", {clientId:data.clientId,gameId});
        socket.emit("nextTurn", {gameId});
    }
});

socket.on("givePlayerIcon", (data) =>{
    const player = players[data.clientId];
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    const iconContainer = idCard.querySelector(".icon-container");

    if (data.value == "vezeni") {
        let existingIcon = iconContainer.querySelector(".vezeni-icon");
        let countLabel;

        if (existingIcon) {
            countLabel = existingIcon.querySelector(".count-label");
            let currentCount = parseInt(countLabel.textContent.replace("x", ""), 10) || 1;
            currentCount++;
            countLabel.textContent = `${currentCount}x`;
            countLabel.style.fontWeight = "bold";
            existingIcon.style.transform = "translateX(20px)";
        }
        else {
            let icon = createIcon();
            icon.className = "vezeni-icon";
            icon.style.backgroundImage = "url('/obrazky/hra/free.png')";
            icon.style.position = "relative";

            icon.setAttribute("data-tooltip", "Propustka z vězení");
            icon.addEventListener("mouseover", function () {
                const tooltip = document.createElement("div");
                tooltip.className = "icon-tooltip";
                tooltip.textContent = icon.getAttribute("data-tooltip");
                iconContainer.appendChild(tooltip);

                tooltip.style.position = "absolute";
                tooltip.style.top = `${icon.offsetTop - 5}px`;
                tooltip.style.left = `${icon.offsetLeft - 145}px`;
            });

            icon.addEventListener("mouseout", function () {
                const tooltip = iconContainer.querySelector(".icon-tooltip");
                if (tooltip) {
                    tooltip.remove();
                }
            });

            countLabel = document.createElement("span");
            countLabel.className = "count-label";
            countLabel.textContent = "";
            countLabel.style.position = "absolute";
            countLabel.style.top = "0";
            countLabel.style.left = "-25px";
            countLabel.style.fontSize = "20px";
            countLabel.style.color = "black";

            icon.appendChild(countLabel);
            iconContainer.appendChild(icon);
        }

        player.vezeniCard = true;
    }
    else if(data.value == "vesta"){
        let icon = createIcon();
        icon.style.backgroundImage = "url('/obrazky/hra/bulletproof.png')";
        icon.setAttribute("data-tooltip", "Neprůstřelná vesta");
        icon.addEventListener("mouseover", function() {
            const tooltip = document.createElement("div");
            tooltip.className = "icon-tooltip";
            tooltip.textContent = icon.getAttribute("data-tooltip");
            iconContainer.appendChild(tooltip);

            tooltip.style.position = "absolute";
            tooltip.style.top = `${icon.offsetTop - 5}px`;
            tooltip.style.left = `${icon.offsetLeft - 145}px`;
        });

        icon.addEventListener("mouseout", function() {
            const tooltip = iconContainer.querySelector(".icon-tooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
        iconContainer.appendChild(icon);
        player.vesta = true;
    }
    else if(data.value == "mina"){
        let icon = createIcon();
        icon.style.backgroundImage = "url('/obrazky/hra/mina.png')";
        icon.setAttribute("data-tooltip", "Plán zaminování");
        icon.addEventListener("mouseover", function() {
            const tooltip = document.createElement("div");
            tooltip.className = "icon-tooltip";
            tooltip.textContent = icon.getAttribute("data-tooltip");

            tooltip.style.position = "absolute";
            tooltip.style.top = `${icon.offsetTop - 5}px`;
            tooltip.style.left = `${icon.offsetLeft - 125}px`;
            iconContainer.appendChild(tooltip);
        });

        icon.addEventListener("mouseout", function() {
            const tooltip = iconContainer.querySelector(".icon-tooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
        iconContainer.appendChild(icon);
        player.mina = true;
    }
    else if(data.value == "kleste"){
        let icon = createIcon();
        icon.style.backgroundImage = "url('/obrazky/hra/plier.png')";
        icon.setAttribute("data-tooltip", "Kleště na zátarasy");

        icon.addEventListener("mouseover", function() {
            const tooltip = document.createElement("div");
            tooltip.className = "icon-tooltip";
            tooltip.textContent = icon.getAttribute("data-tooltip");
            iconContainer.appendChild(tooltip);

            tooltip.style.position = "absolute";
            tooltip.style.top = `${icon.offsetTop - 5}px`;
            tooltip.style.left = `${icon.offsetLeft - 145}px`;
        });

        icon.addEventListener("mouseout", function() {
            const tooltip = iconContainer.querySelector(".icon-tooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
        iconContainer.appendChild(icon);
        player.kleste = true;
    }
    else if(data.value == "material"){
        let icon = createIcon();
        icon.style.backgroundImage = "url('/obrazky/hra/paper.png')";
        icon.setAttribute("data-tooltip", "Kompromitující materiál na předsedu prověrkové komise");
        icon.addEventListener("mouseover", function() {
            const tooltip = document.createElement("div");
            tooltip.className = "icon-tooltip";
            tooltip.textContent = icon.getAttribute("data-tooltip");
            iconContainer.appendChild(tooltip);

            tooltip.style.position = "absolute";
            tooltip.style.top = `${icon.offsetTop - 5}px`;
            tooltip.style.left = `${icon.offsetLeft - 260}px`;
        });

        icon.addEventListener("mouseout", function() {
            const tooltip = iconContainer.querySelector(".icon-tooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
        iconContainer.appendChild(icon);
        player.material = true;
    }
    else if(data.value == "marks"){
        let icon = createIcon();
        icon.style.backgroundImage = "url('/obrazky/hra/marks.png')";
        icon.setAttribute("data-tooltip", "50 000 DM");
        icon.addEventListener("mouseover", function() {
            const tooltip = document.createElement("div");
            tooltip.className = "icon-tooltip";
            tooltip.textContent = icon.getAttribute("data-tooltip");
            iconContainer.appendChild(tooltip);

            tooltip.style.position = "absolute";
            tooltip.style.top = `${icon.offsetTop - 5}px`;
            tooltip.style.left = `${icon.offsetLeft - 80}px`;
        });

        icon.addEventListener("mouseout", function() {
            const tooltip = iconContainer.querySelector(".icon-tooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
        iconContainer.appendChild(icon);
        player.marks = true;
    }
});

socket.on("removePlayerIcon", (data) =>{
    let player = players[data.clientId];
    const idCard = document.querySelector(`.id-card[data-clientId="${data.clientId}"]`);
    const iconContainer = idCard.querySelector(".icon-container");
    if(data.value == "vezeni"){
        const icon = iconContainer.querySelector('[data-tooltip="Propustka z vězení"]');
        const countLabel = icon.querySelector(".count-label");
        if(countLabel.textContent != ""){
            let currentCount = parseInt(countLabel.textContent.replace("x", ""), 10) || 1;
            currentCount--;
            if(currentCount <= 1){
                countLabel.textContent = "";
                icon.style.transform = "translateX(0px)";
            }
            else{
                countLabel.textContent = `${currentCount}x`;
            }
        }
        else{
            icon.remove();
            player.vezeniCard = false;
        }
    }
    else if(data.value == "vesta"){
        let icon = iconContainer.querySelector('[data-tooltip="Neprůstřelná vesta"]');
        icon.remove();
        player.vesta = false;
    }
    else if(data.value == "mina"){
        let icon = iconContainer.querySelector('[data-tooltip="Plán zaminování"]');
       icon.remove();
       player.mina = false;
    }
    else if(data.value == "kleste"){
        let icon = iconContainer.querySelector('[data-tooltip="Kleště na zátarasy"]');
        icon.remove();
        player.kleste = false;
    }
    else if(data.value == "material"){
        let icon = iconContainer.querySelector('[data-tooltip="Kompromitující materiál na předsedu prověrkové komise"]');
        icon.remove();
        player.material = false;
    }
    else if(data.value == "marks"){
        let icon = iconContainer.querySelector('[data-tooltip="50 000 DM"]');
        if(icon){
            icon.remove();
        }
        player.marks = false;
    }
});

function createIcon(){
    const icon = document.createElement("div");
    icon.style.backgroundSize = "contain";
    icon.style.zIndex = "6";
    icon.style.backgroundRepeat = "no-repeat";
    icon.style.width = "30px";
    icon.style.height = "40px";

    return icon;
}