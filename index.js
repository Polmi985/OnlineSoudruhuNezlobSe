const http = require("http");
const express = require("express");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { v4: uuidv4 } = require('uuid');

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

let clients = {}; //Objekt pro klienty
let games = {}; //Objekt pro všechny hry

//Připojení Socket.io
io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);
    clients[socket.id] = { socket: socket, color: null }; //Tento objekt ukládá informace o připojených hráčů/klientů, každý hráč má unikátní ID

    //Odeslání klientovi jeho clientId
    socket.emit("connectClient", { clientId: socket.id });

    //Požadavek na Vytvoření hry
    socket.on("create", () => {
        const gameId = uuidv4(); //Vytvoření unikátního gameId pomocí uuid knihovny
        games[gameId] = { id: gameId, clients: [], currentPlayerIndex: 0, started : false }; //Do objektu games se přidá nová hra

        //Poslání klientovi o nově vytvořené hře
        socket.emit("createGame", { game: games[gameId] });
    });

    //Požadavek na připojení klient k danému gameId
    socket.on("join", ( { gameId, userName } ) => {
        const game = games[gameId];
        const clientId = socket.id;
        
        //Pokud hra neexistuje hráče to nepřipojí
        if (!game) {
            io.to(clientId).emit("gameNotFound");
            return;
        }
        //Pokud hra už začala tak to hrače nepřipojí
        if(game.started){
            io.to(clientId).emit("gameAlreadyStarted");
            return;
        }
        //Pokud jsou ve hře už 4 klienti tak to hráče taky nepřipojí
        if (game.clients.length >= 6) {
            io.to(clientId).emit("gameNotFound");
            return;
        }

        //Hráči je přidělená barva a je přídán do seznamu hráčů hry
        const color = ["Red", "Green", "Blue", "Yellow", "Black", "White"][game.clients.length];
        clients[clientId].color = color;
        game.clients.push({ clientId, color, userName,photo:null });

        io.to(gameId).emit("joinGame", { game }); //Pošle informaci klientům že to připojil hráč

        socket.emit("joinGame", { game }); //Pošle se pouze tomu klientovi kdo to právě připojil

        socket.join(gameId); //Klienta to připojí do socket room
    });

    //Požadavek na pohyb hráče
    socket.on("movePlayer", ({ clientId, steps, targetIndex, gameId}) => {
        const game = games[gameId];       
        if (game) {
            io.to(game.id).emit("playerMoved", { clientId, steps,targetIndex }); //Poslání informací klientům
        }
    });

    let round = 1;
    let playedPlayersCount = 0;    
    //Požadavek na další tah
    socket.on("nextTurn", ({ gameId }) => {
        const game = games[gameId];
        if (game) {

            const activePlayers = game.clients.filter(player => !player.removeFromTurn); //Zjistí kolik klientů má removeFromTurn na false
            
            //Pokud je aktivni jenom jeden klient tak to ukončí hru
            if (activePlayers.length == 1 && game.started == true) {
                io.to(game.id).emit("gameEnded", {game, clientId:activePlayers[0].clientId});
                return;
            }

            //Hledání dalšího hráče který je připraven na tah, pokud daný hráč má skipRounds nebo removeFromTurn tak ho to přeskočí
            do {
                game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.clients.length;
                const currentPlayer = game.clients[game.currentPlayerIndex];

                if(currentPlayer.removeFromTurn){
                    continue;
                }
                
                //Hráči kteří mají vynechané hody tak se přeskočí
                if(currentPlayer.skipRounds > 0) {
                    currentPlayer.skipRounds--;
                }                 
                else{
                    break;
                }
            } while (true);
    
            playedPlayersCount++;
            
            //Přičítání kol
            if (playedPlayersCount === game.clients.length) {
                round++;
                playedPlayersCount = 0;
            }
    
            const nextPlayer = game.clients[game.currentPlayerIndex];
    
            io.to(game.id).emit("turn", { clientId: nextPlayer.clientId }); //Poslání informací všem klientům
        }
    });

    //Požadavek na restart hry, prostě restartuje všechny věci co se týče hry
    socket.on("restartGame", ({gameId}) =>{
        const game = games[gameId];
        if(game){
            game.started = false;
            game.clients.forEach(client =>{
                client.removeFromTurn = false;
                client.skipRounds = 0;
                round = 1;
                playedPlayersCount = 0;
            });
            io.to(game.id).emit("restartGame", {game});
        }
    });

    //Požadavek na přeskočení hráče při tahu
    socket.on("playerSkipRounds", ({value,clientId,gameId}) =>{
        const game = games[gameId];
        if(game){
            const player = game.clients.find(c => c.clientId === clientId);
            if (player) {
                player.skipRounds = value;
            }
        }
    });

    //Požadavek aby daný hráč byl vždycky přeskočen při tahu
    socket.on("disablePlayer", ({clientId,gameId}) =>{
        const game = games[gameId];
        if(game){
            const player = game.clients.find(c => c.clientId === clientId);
            if(player){
                player.removeFromTurn = true;
                io.to(clientId).emit("disablePlayer");
            }
        }
    });
    
    //Požadavek na přepnutí klientovi ready indicator
    socket.on("buttonReady", ({ clientId, gameId, ready }) =>{
        const game = games[gameId];
        if(game){
            const player = game.clients.find(c => c.clientId === clientId);
            if(player){
                player.ready = ready;
                io.to(game.id).emit("readyClient", game);
            }

            if(game.clients.every(c => c.ready)){
                io.to(game.id).emit("allPlayersReady", true); //Pokud všichni klienti jsou ready tak to pošle informaci o tom že jsou všichni ready
            }
            else{
                io.to(game.id).emit("allPlayersReady", false);
            }
        }
    });

    //Požadavek na startnutí hry, posílá se všem klientům
    socket.on("startGame", ({gameId}) =>{
        const game = games[gameId];
        if(game){
            game.started = true;
            io.to(game.id).emit("gameStarted", game);
        }
    });

    //Požadavek na vytáhnutí karty, posílá se pouze klientovi který si musí vytáhnout kartu
    socket.on("playerMustDrawACard", ({clientId, nextPosition, gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(clientId).emit("playerDrawACard", {clientId, nextPosition});
        }
    });

    //Požadavek na změnění barvy, posílá se všem klientům
    socket.on("changeColor", ({color, clientId, gameId}) => {
        const game = games[gameId];
        if(game){
            const player = game.clients.find(client => client.clientId === clientId);
            if(player){
                player.color = color;
            }
            io.to(game.id).emit("updateColor", {clientId, color});
        }
    });    

    //Požadavek na změnění fotky u průkazu, posílá se všem klientům
    socket.on("changePhoto", ({photo, clientId, gameId}) => {
        const game = games[gameId];
        if (game) {    
            const player = game.clients.find(client => client.clientId === clientId);
            if(player){
                player.photo = photo;
                console.log(player.photo);
            }        
            io.to(game.id).emit("updatePhoto", {clientId, photo});
        }
    });

    //Požadavek na přidání ikony, posílá se všem klientům
    socket.on("givePlayerIcon", ({value,clientId,gameId}) => {
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("givePlayerIcon", {value,clientId});
        }
    });

    //Požadavek na odstranění ikony, posílá se všem klientům
    socket.on("removePlayerIcon", ({value, clientId,gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("removePlayerIcon", {value,clientId});
        }
    });

    //Požadavek na přidání razítka, posílá se všem klientům
    socket.on("givePlayerRazitko", ({clientId, razitko,gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("givePlayerRazitko", {clientId,razitko});
        }
    });

    //Požadavek na změnu postaní hráče, posílá se všem klientům
    socket.on("playerChangePostaveni", ({clientId, postaveni, gameId}) => {
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("playerChangedPostaveni", {clientId, postaveni});
        }
    });
    
    //Požadavek na poslání čísla průkazu hráče, posílá se všem klientům
    socket.on("getRandomIdNumber", ({clientId, randomNumber, gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("playerChangeIdNumber", {clientId, randomNumber});
        }
    });

    //Požadavek na přídání peněz, posílá se všem klientům
    socket.on("givePlayerMoney", ({clientId, money, gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("givePlayerMoney", {clientId, money});
        }
    });

    //Požadavek na odstranění špatné karty z pole, posílá se všem klientům
    socket.on("removeBadCard", ({gameId, index, clientId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("removeBadCard", {index,clientId});
        }
    });

    //Požadavek na vytvoření dialogue boxu, posílá se pouze danému klientovi
    socket.on("createSpeechBox", ({clientId,gameId, index,proverky}) =>{
        const game = games[gameId];
        if(game){
            io.to(clientId).emit("createSpeechBox", {clientId, index,proverky});
        }
    })

    //Požadavek na odstranění dobré karty z pole, posílá se všem klientům
    socket.on("removeGoodCard", ({gameId, index, clientId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("removeGoodCard", {index,clientId});
        }
    });

    //Požadavek na vytvoření šipek na posun dopředu a dozadu, posílá se pouze danému klientovi
    socket.on("createDirectionalArrows", ({clientId,gameId,type}) =>{
        const game = games[gameId];
        if(game){
            io.to(clientId).emit("createDirectionalArrows", {type,clientId});
        }
    });

    //Požadavek na změnění pohybu hráče
    socket.on("changePlayerDirection", ({direction, clientId,gameId}) =>{
        const game = games[gameId];
        if(game){
            io.to(game.id).emit("changePlayerDirection", {direction,clientId});
        }
    });

    //Odpojení klienta
    socket.on("disconnect", () => {
        const clientId = socket.id;  
        const game = Object.values(games).find(g => g.clients.some(c => c.clientId === clientId)); //Najit hru pomocí clientId
        delete clients[socket.id]; //Odstranění daného klienta z objektu clients
        if(game){
            const wasHost = game.clients[0].clientId === clientId; //Určení kdo byl hostem
            game.clients = game.clients.filter(c => c.clientId !== socket.id);

            io.to(game.id).emit("playerLeft", clientId); //Posílání informace že hráč odešel ze hry

            if (wasHost && game.clients.length > 0) { //Pokud to odpojí host tak se host dá novému hráči
                const newHostId = game.clients[0].clientId;
                game.clients[0].isHost = true;
                io.to(newHostId).emit("newHost");
            }

            if (game.clients.length === 1 && game.started == true) { //Pokud je hra už začla a odpojí to všichni a zůstane tam jeden, tak to odpojí i toho jednoho
                io.to(game.id).emit("allPlayersLeft", game);
                delete games[game.id]; //Odstranění hry
            }

            if(game.clients.length == 0){ //Odstranění hry pokud ve hře nejsou žádní hráči
                delete games[game.id];
            }
        }
    });
});

const port = process.env.PORT || 9091;

server.listen(port, () => console.log("Server running on port 9091"));