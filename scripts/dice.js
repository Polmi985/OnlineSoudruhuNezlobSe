function createDice(number) {
    const dotPositionMatrix = {
        1: [
            [50, 50]
        ],
        2: [
            [20,20],
            [80,80]
        ],
        3: [
            [20,20],
            [50,50],
            [80,80]
        ],
        4: [
            [20,20],
            [20,80],
            [80,20],
            [80,80]
        ],
        5: [
            [20,20],
            [20,80],
            [50,50],
            [80,20],
            [80,80]
        ],
        6: [
            [20,20],
            [20,80],
            [50,20],
            [50,80],
            [80,20],
            [80,80]
        ]
    };

    const dice = document.createElement("div");
    dice.classList.add("dice");

    for(const dotPosition of dotPositionMatrix[number]){
        const dot = document.createElement("div");
        dot.classList.add("dice-dot");
        dot.style.setProperty("--top", dotPosition[0] + "%");
        dot.style.setProperty("--left", dotPosition[1] + "%");
        dice.appendChild(dot);
    }

    return dice;
}

function randomizeDice(){
    const diceContainer = document.querySelector(".dice-container");
    diceContainer.innerHTML = "";

    const random = Math.floor((Math.random() * 6) + 1);
    const dice = createDice(random);
    diceContainer.appendChild(dice);
}

randomizeDice();

btnRollDice.addEventListener("click", () =>{
    let outOfVezeni = false;
    const interval = setInterval(() => {
        randomizeDice(diceContainer, 1);
    }, 130);

    btnRollDice.disabled = true;

    setTimeout(() => {
        clearInterval(interval);

        const player = players[clientId];
        const dice = document.querySelector(".dice");
        if(clientId === currentPlayerId && !player.mustDrawCard){
            let steps = dice.childNodes.length;
            if(player.isJail == false && player.isBlazinec == false && steps != 6){
                socket.emit("movePlayer", {clientId, steps, targetIndex: undefined, gameId});
                socket.emit("nextTurn", {gameId});
            }
            if(player.isJail == true || player.isBlazinec == true){
                if(steps == 1 || steps == 6){
                    socket.emit("movePlayer", {clientId, steps:1, targetIndex: 2, gameId});
                    outOfVezeni = true;
                    socket.emit("nextTurn", {gameId});
                    player.isJail = false;
                    player.isBlazinec = false;
                }
                else{
                    if(player.isJail == true){
                        socket.emit("nextTurn", {gameId});
                    }
                    if(player.isBlazinec == true){
                        socket.emit("nextTurn", {gameId});
                    }
                }
            }
            if(steps == 6){
                if(!outOfVezeni){
                    socket.emit("movePlayer", {clientId, steps, targetIndex: undefined, gameId});
                }
                setTimeout(() =>{
                    btnRollDice.disabled = false;
                }, 1500);
            }
        }

    }, 1000);

});