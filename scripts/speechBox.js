socket.on("createSpeechBox", (data) =>{
    toggleOverlays(true);
    goodCard.alpha = 0.4;
    badCard.alpha = 0.4;
    if(data.proverky === "ANO"){
        createSpeechBox(messagesKomiseAno, data.index, movePlayerToIndex);
    }
    if(data.proverky === "NE"){
        createSpeechBox(messagesKomiseNe, data.index);
    }
    if(data.index === "Veksl"){
        createSpeechBox(messagesVeksl);
    }
    if(data.index === "PS"){
        createSpeechBox(messagesPS);
    }
    if(data.index === "EL"){
        createSpeechBox(messagesEL);
    }
    if(data.index === "Mina"){
        createSpeechBox(messagesMina);
    }
    if(data.index === "END"){
        removeDirectionArrows();
        createSpeechBox(messagesKonec);
    }
    if(data.index === "GEN"){
        createSpeechBox(messagesGen);
    }
});

function createSpeechBox(dialogueBox,value,action){
    showSpeechBox(dialogueBox.initial);

    function showSpeechBox(message) {
        const speechContainer = document.getElementById("speech-container");
        const speechText = document.getElementById("speech-text");

        speechText.textContent = message;

        speechContainer.classList.remove("hidden");
        speechContainer.classList.add("visible");
    }

    function hideSpeechBox(check) {
        const speechContainer = document.getElementById("speech-container");
        speechContainer.classList.remove("visible");
        speechContainer.classList.add("hidden");

        if(action == movePlayerToIndex || check == true){
            movePlayerToIndex(value);
        }

        if(!playerDrawACard){
            toggleOverlays(false);
            goodCard.alpha = 1;
            badCard.alpha = 1;
        }
    }

    if(dialogueBox.initial == messagesKomiseNe.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "PROVĚRKY";
        function handleResponse(responseMessage, check) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(() =>{
                hideSpeechBox(check);
            }, 3000);
        }
        buttonContainer.style.visibility = "visible";
        let nextBtn = document.getElementById("next-button");
        nextBtn.style.display = "none";
        const player = players[clientId];

        const btn = document.getElementById("use-button");

        if(!btn && player.material == true){
            let useCardBtn = document.createElement("button");
            useCardBtn.classList.add("speech-button");
            useCardBtn.setAttribute("id", "use-button");
            useCardBtn.innerHTML = "Použít kartu";
            useCardBtn.addEventListener("click", () =>{
                const player = players[clientId];
                if(player.material){
                    handleResponse(messagesKomiseNe.card, true);
                    removeSpecialCard("material");
                }
                noBtn.removeEventListener("click", clickedNoBtn);
                nextBtn.removeEventListener("click", clickedNextBtn);
            });
            buttonContainer.appendChild(useCardBtn);
        }

        if(player.money > 30000){
            let nextBtn = document.getElementById("next-button");
            nextBtn.innerHTML = "Podplatit";
            nextBtn.style.display = "block";
            nextBtn.addEventListener("click", clickedNextBtn);
            function clickedNextBtn(){
                if(player.money > 30000){
                    handleResponse(messagesKomiseNe.yes, true);
                    socket.emit("givePlayerMoney", {clientId:player.clientId, money:-30000, gameId});
                }
                else{
                    handleResponse(messagesKomiseNe.noMoney);
                    setTimeout(goBackToStart, 4000);
                }
                noBtn.removeEventListener("click", clickedNoBtn);
                nextBtn.removeEventListener("click", clickedNextBtn);
            }
        }

        let noBtn = document.getElementById("no-button");
        noBtn.style.display = "block";
        noBtn.innerHTML = "Pokračovat>>";
        noBtn.addEventListener("click", clickedNoBtn);
        function clickedNoBtn(){
            setTimeout(hideSpeechBox, 1500);
            setTimeout(goBackToStart, 2000);
            buttonContainer.style.visibility = "hidden";
            noBtn.removeEventListener("click", clickedNoBtn);
            nextBtn.removeEventListener("click", clickedNextBtn);
        }

    }
    else if(dialogueBox.initial == messagesKomiseAno.initial){
        const buttonContainer = document.getElementById("button-container");
        buttonContainer.style.visibility = "visible";

        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Prověrky";

        let noBtn = document.getElementById("no-button");
        noBtn.style.display = "none";

        let nextBtn = document.getElementById("next-button");
        nextBtn.style.display = "block";
        nextBtn.innerHTML = "Pokračovat>>>";
        nextBtn.addEventListener("click", clickedBtn);

        function clickedBtn(){
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 500);
            nextBtn.removeEventListener("click", clickedBtn);
        }

        const btn = document.getElementById("use-button");
        if(btn){
            btn.remove();
        }
    }
    else if(dialogueBox.initial == messagesVeksl.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Veksl";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 3000);
        }
        buttonContainer.style.visibility = "visible";

        let noBtn = document.getElementById("no-button");
        noBtn.style.display = "block";
        noBtn.innerHTML = "Ne";
        noBtn.addEventListener("click", clickedNoBtn);

        function clickedNoBtn(){
            handleResponse(messagesVeksl.no);
            noBtn.removeEventListener("click", clickedNoBtn);
            nextBtn.removeEventListener("click", clickedBtn);
        }

        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Ano";
        nextBtn.addEventListener("click", clickedBtn);
        function clickedBtn(){
            const player = players[clientId];
            if(player.money >= 1000000){
                handleResponse(messagesVeksl.yes);
                socket.emit("givePlayerIcon", {value:"marks", clientId:player.clientId, gameId});
                socket.emit("givePlayerMoney", {clientId:player.clientId, money:-1000000, gameId});
            }
            else{
                handleResponse(messagesVeksl.noMoney);
                setTimeout(moveBackward(-6), 5000);
            }
            noBtn.removeEventListener("click", clickedNoBtn);
            nextBtn.removeEventListener("click", clickedBtn);
        }
    }
    else if(dialogueBox.initial == messagesPS.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Pohraniční stráž";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 5000);
        }
        buttonContainer.style.visibility = "visible";
        const player = players[clientId];

        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Pokračovat>>>";
        nextBtn.addEventListener("click", clickedBtn);
        function clickedBtn(){
            handleResponse(messagesPS.death);
            socket.emit("givePlayerRazitko", {clientId, razitko:"smrt", gameId});
            nextBtn.removeEventListener("click", clickedBtn);
        }

        if(player.vesta == true){
            let noBtn = document.getElementById("no-button");
            noBtn.style.display = "block";
            noBtn.innerHTML = "Použít vestu";
            noBtn.addEventListener("click", clickedNoBtn);

            function clickedNoBtn(){
                if(player.vesta == true){
                    handleResponse(messagesPS.yes);
                    removeSpecialCard("vesta");
                    player.vesta = false;
                }
                noBtn.removeEventListener("click", clickedNoBtn);
            }
        }
        else{
            let noBtn = document.getElementById("no-button");
            if(noBtn){
                noBtn.style.display = "none";
            }
        }
    }
    else if(dialogueBox.initial == messagesEL.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Elektrické záterasy";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 5000);
        }
        buttonContainer.style.visibility = "visible";

        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Přelézt plot";
        nextBtn.addEventListener("click", clickedBtn);
        function clickedBtn(){
            handleResponse(messagesEL.death);
            socket.emit("givePlayerRazitko", {clientId, razitko:"smrt", gameId});
            noBtn.removeEventListener("click", clickedNoBtn);
            nextBtn.removeEventListener("click", clickedBtn);
        }

        const player = players[clientId];
        if(player.kleste == true){
            let noBtn = document.getElementById("no-button");
            noBtn.style.display = "block";
            noBtn.innerHTML = "Použít kleště";
            noBtn.addEventListener("click", clickedNoBtn);

            function clickedNoBtn(){
                if(player.kleste == true){
                    handleResponse(messagesEL.yes);
                    removeSpecialCard("kleste");
                    player.kleste = false;
                }
                noBtn.removeEventListener("click", clickedNoBtn);
                nextBtn.removeEventListener("click", clickedBtn);
            }
        }
        else{
            let noBtn = document.getElementById("no-button");
            if(noBtn){
                noBtn.style.display = "none";
            }
        }
    }
    else if(dialogueBox.initial == messagesMina.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Minové pole";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 5000);
        }
        buttonContainer.style.visibility = "visible";

        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Přejít přes minové pole";
        nextBtn.addEventListener("click", clickedBtn);

        function clickedBtn(){
            handleResponse(messagesMina.death);
            socket.emit("givePlayerRazitko", {clientId, razitko:"smrt", gameId});
            noBtn.removeEventListener("click", clickedNoBtn);
            nextBtn.removeEventListener("click", clickedBtn);
        }

        const player = players[clientId];
        if(player.mina == true){
            let noBtn = document.getElementById("no-button");
            noBtn.style.display = "block";
            noBtn.innerHTML = "Použít plán zaminování";
            noBtn.addEventListener("click", clickedNoBtn);

            function clickedNoBtn(){
                if(player.mina == true){
                    handleResponse(messagesMina.yes);
                    removeSpecialCard("mina");
                    player.mina = false;
                }
                noBtn.removeEventListener("click", clickedNoBtn);
                nextBtn.removeEventListener("click", clickedBtn);
            }
        }
        else{
            let noBtn = document.getElementById("no-button");
            if(noBtn){
                noBtn.style.display = "none";
            }
        }
    }
    else if(dialogueBox.initial == messagesKonec.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "Bundesrepublik Deutschland";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
            buttonContainer.style.visibility = "hidden";

            setTimeout(hideSpeechBox, 5000);
        }
        buttonContainer.style.visibility = "visible";

        const player = players[clientId];
        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Pokračovat>>>";
        nextBtn.addEventListener("click", () => {
            if(player.marks){
                handleResponse(messagesKonec.yes);
                socket.emit("givePlayerRazitko", {clientId, razitko:"vyhra", gameId});
            }
            else{
                handleResponse(messagesKonec.noMoney);
                socket.emit("givePlayerRazitko", {clientId, razitko:"smrt", gameId});
            }
        });

        let noBtn = document.getElementById("no-button");
        noBtn.style.display = "none";
    }
    else if(dialogueBox.initial == messagesGen.initial){
        const speechText = document.getElementById("speech-text");
        const buttonContainer = document.getElementById("button-container");
        const speechHeader = document.getElementById("speech-header");
        speechHeader.textContent = "GEN Políčko";
        function handleResponse(responseMessage) {
            speechText.textContent = responseMessage;
        }
        buttonContainer.style.visibility = "visible";

        let clickCount = 0;
        let nextBtn = document.getElementById("next-button");
        nextBtn.innerHTML = "Pokračovat>>>";
        nextBtn.addEventListener("click", clickedNextBtn);

        function clickedNextBtn(){
            if(clickCount == 0){
                handleResponse(messagesGen.message2);
            }
            else if(clickCount == 1){
                handleResponse(messagesGen.message3);
            }
            else if(clickCount == 2){
                handleResponse(messagesGen.message4);
            }
            else if(clickCount == 3){
                handleResponse(messagesGen.message5);
                buttonContainer.style.visibility = "hidden";
                setTimeout(hideSpeechBox, 3000);
                nextBtn.removeEventListener("click", clickedNextBtn);
                noBtn.removeEventListener("click", clickedNoBtn);
            }

            clickCount++;
        }

        let noBtn = document.getElementById("no-button");
        noBtn.style.display = "block";
        noBtn.innerHTML = "Přeskočit";
        noBtn.addEventListener("click", clickedNoBtn);
        function clickedNoBtn(){
            handleResponse(messagesGen.message5);
            buttonContainer.style.visibility = "hidden";
            setTimeout(hideSpeechBox, 100);
            nextBtn.removeEventListener("click", clickedNextBtn);
            noBtn.removeEventListener("click", clickedNoBtn);
        }
    }
}