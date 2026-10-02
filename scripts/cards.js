function vezeni(){
    let player = players[clientId];
    player.isJail = true;
    socket.emit("movePlayer", {clientId, steps: 1, targetIndex: 0, gameId});
}

function blazinec(){
    const player = players[clientId];
    player.isBlazinec = true;
    socket.emit("movePlayer", {clientId, steps: 1, targetIndex: 1, gameId});
}

function moveBackward(steps){
    socket.emit("movePlayer", {clientId, steps, targetIndex: undefined, gameId});
}

function moveForward(steps){
    socket.emit("movePlayer", {clientId, steps, targetIndex: undefined, gameId});
}

function goBackToStart(){
    socket.emit("movePlayer", {clientId, steps: 0, targetIndex: 2, gameId});
}

function givePlayerMoney(value){
    socket.emit("givePlayerMoney", {clientId, money: value, gameId});
}

function giveOtherPlayersMoney(value){
    let sender = players[clientId];

    if(sender.money >= value * (Object.keys(players).length - 1)){
        Object.keys(players).forEach(player =>{
            if(player != clientId){
                socket.emit("givePlayerMoney", {clientId:player, money:value, gameId});
            }
        });

        const money = (value * (Object.keys(players).length - 1)) * -1;
        socket.emit("givePlayerMoney", {clientId:sender.clientId, money:money, gameId});
    }
    else{
        socket.emit("movePlayer", {clientId:clientId, steps:0, targetIndex: 0, gameId});
    }
}

function movePlayerToIndex(value){
    socket.emit("movePlayer", {clientId, steps: 0, targetIndex: value, gameId});
}

function playerSkipRound(value){
    socket.emit("playerSkipRounds", {value,clientId, gameId});
}

function giveSpecialCard(value){
    socket.emit("givePlayerIcon", {value, clientId, gameId});
}

function removeSpecialCard(value){
    socket.emit("removePlayerIcon", {value, clientId, gameId});
}

let universalCards = [
    { text: "Propustka z vězení", action:giveSpecialCard, value:"vezeni"},
    { text: "Neprůstřelná vesta",action:giveSpecialCard, value:"vesta"},
    { text: "Propustka z vězení",action:giveSpecialCard, value:"vezeni"},
    { text: "Plán zaminování",action:giveSpecialCard, value:"mina"},
    { text: "Propustka z vězení",action:giveSpecialCard, value:"vezeni"},
    { text: "Kleště na zátarasy",action:giveSpecialCard, value:"kleste"},
    { text: "Kompromitující materiál na předsedu prověrkové komise",action:giveSpecialCard, value:"material"},
]

let goodCardsBez = [
    { text: "Podpora od židovské obce 50 Kčs.", action: givePlayerMoney, value: 50},
    { text: "Podepsal si spolupráci s STB. Skoč na KOM.", action: movePlayerToIndex, value: 122},
    { text: "Prodal jsi na zájezdě v Rakousku občanký průkaz a vojenskou knížku za 10 000 Kčs.", action:givePlayerMoney, value: 10000},
    { text: "Ustřihnul jsi dcerce cop a prodal jej parukáři za 500 Kčs.", action: givePlayerMoney, value: 500},
    { text: "Daroval jsi ledvinu za 20 000 Kčs.", action:givePlayerMoney, value: 20000},
    { text: "Založil jsi v podniku svaz mládeže. Skoč na KAN.", action: movePlayerToIndex, value: 104},
    { text: "Našel jsi na ulici 100 Kčs.", action:givePlayerMoney, value:100},
    { text: "Našel jsi v koši 50 Kčs.", action:givePlayerMoney, value: 50},
    { text: "V 50. letech jsi byl ve vězení s 1. tajemníkem. Jdi o 7 polí vpřed.", action:moveForward, value:7},
    { text: "Vypadly ti z telefonního automatu mince v hodnotě 100 Kčs.", action:givePlayerMoney, value:100},
    { text: "Oženil ses s dcerou ministra vnitra. Skoč na KOM.", action: movePlayerToIndex, value: 122},
    { text: "Zachránil jsi život tonoucímu. Odměna 300 Kčs.", action:givePlayerMoney, value:300},
    { text: "Stal jsi se kandidátem strany. Skoč na KAN.", action:movePlayerToIndex, value:104},
    { text: "Prodal jsi láhve za 50 Kčs.", action:givePlayerMoney, value:50},
];

let goodCardsKan = [
    { text: "Chodil jsi s 1. tajemníkem do školy. Skoč na POS.", action:movePlayerToIndex, value:172},
    { text: "Zlepšovací návrh. Odměna 200 Kčs.", action:givePlayerMoney, value:200},
    { text: "Překročil jsi plán výroby o 40%. Jdi o 5 polí vpřed.", action:moveForward, value:5},
    { text: "Vyhrál jsi ve Sportce 2 000 Kčs.", action:givePlayerMoney, value: 2000},
    { text: "Odměna od STB za informaci 200 Kčs.", action:givePlayerMoney, value:200},
    { text: "Vyhrál jsi v Matesu 5 000 Kčs.", action:givePlayerMoney, value: 5000},
    { text: "Vstup do SČSP. Jdi o 5 polí vpřed.", action:moveForward,value:5},
    { text: "Informace po návratu z ciziny 2 000 Kčs.", action:givePlayerMoney, value: 2000},
    { text: "Napsal jsi hudbu ke spartakládní skladbě „Komunisté na trampolínách“, odměna 50 000 Kčs.", action:givePlayerMoney, value: 50000 },
    { text: "Prodal jsi Ottův naučný slovník za 500 Kčs.", action:givePlayerMoney, value: 500},
    { text: "Zkracená doba kandidatury. Skoč na KOM.", action:movePlayerToIndex, value:122},
    { text: "Podepsal jsi spolupráci KGB. Skoč až na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Křivé svědectví u soudu proti disidentovi. Odměna 10 000 Kčs.", action: givePlayerMoney, value: 10000},
    { text: "Za urbanistické řešení sídliště Prosek odměna 100 000 Kčs.", action:givePlayerMoney, value: 100000},
];

let goodCardsKom = [
    { text: "Odsoudils v TV Chartu 77. Skoč o 10 polí vpřed.", action:moveForward, value:10},
    { text: "Zapálil jsi Veletržní palác. Odměna 100 000 Kčs.", action:givePlayerMoney, value:100000},
    { text: "Honorář za přednášky o VŘSR 5 000 Kčs.", action:givePlayerMoney, value:5000},
    { text: "ÚV tě jmenoval voleným poslancem. Jdi na POS.", action:movePlayerToIndex, value: 172},
    { text: "Prodal jsi rodinný šperk za 3 000 Kčs.", action:givePlayerMoney, value:3000},
    { text: "2 000 Kčs diety, které si neproplatil sportovcům.", action:givePlayerMoney, value:2000},
    { text: "Zdědils porcelánový servis po babičce a prodal ho za 3 000 Kčs.", action:givePlayerMoney, value:3000},
    { text: "Vstup do Lidových milicí. Skoč o 10 polí vpřed.", action:moveForward, value:10},
    { text: "Rozehnal jsi s milicionáři demonstraci. Kalorné 2 000 Kčs.", action:givePlayerMoney, value:2000},
    { text: "Podniková prémie 500 Kčs.", action:givePlayerMoney, value:500},
    { text: "Odměna za zlepšovací návrh 3 000 Kčs.", action:givePlayerMoney, value:3000},
    { text: "Recitoval jsi báseň o V. I. Leninovi. O 8 polí vpřed.", action:moveForward, value:8},
    { text: "Vyhrál jsi v Sazce 500 Kčs.", action:givePlayerMoney, value:500},
    { text: "Vyhrál jsi v TV soutěži 50 000 Kčs.", action:givePlayerMoney, value:50000}
];

let goodCardsPos = [
    { text: "Prosadil jsi výstavbu žižkovského TV vysílače. Odměna 100 000 Kčs.", action:givePlayerMoney, value:100000},
    { text: "Vyhrál jsi na dostihách 1 000 Kčs.", action:givePlayerMoney, value:1000},
    { text: "Úplatek za výjezdní doložku 5 000 Kčs.", action:givePlayerMoney, value:5000},
    { text: "Úplatek za přidělení bytu 5 000 Kčs.", action:givePlayerMoney, value:5000},
    { text: "Příspěvek na reprezentaci 5 000 Kčs.", action:givePlayerMoney, value:5000},
    { text: "Jsi v rekvalifikační komisi. Dostaneš úplatek od hudebníka 2 000 Kčs.", action:givePlayerMoney, value:2000},
    { text: "Vystudoval jsi VUML. Jdi o 7 polí vpřed.", action:moveForward,value:7},
    { text: "Zařídil jsi léčení veksláka v Sanopzu. Odměna 5 000 Kčs.", action:givePlayerMoney, value:5000},
    { text: "Popřel jsi v tisku únik radioaktivity. Skoč na ÚV.", action:movePlayerToIndex, value:230},
    { text: "Prodal jsi Tatru 613 za 80 000 Kčs.", action:givePlayerMoney, value:80000},
    { text: "Stal jsi se členem ÚV. Skoč na ÚV.", action:movePlayerToIndex, value:230},
    { text: "Dostal jsi syna řezníka na střední školu. Odměna 10 000 Kčs.", action:givePlayerMoney, value:10000},
    { text: "Nenávratná půjčka na stavbu vily 50 000 Kčs.", action:givePlayerMoney, value:50000},
    { text: "Za vystoupení v pořadu „A léta běží“ získáváš 2 000 Kčs.", action:givePlayerMoney, value:2000}
];

let goodCardsUv = [
    { text: "Jsi podobný Stalinovi. Skoč na POL.", action:movePlayerToIndex, value: 287},
    { text: "Dostaneš k narozeninám od každého 2 000 Kčs od 15 lidí, tj. 30 000 Kčs.", action:givePlayerMoney, value:30000},
    { text: "Jsi zvolen do polibytra. Skoč na POL.", action:movePlayerToIndex, value: 287},
    { text: "Prodal jsi chatu za 200 000 Kčs.", action:givePlayerMoney, value:200000},
    { text: "Jako autor hesel k Únoru dostáváš 80 000 Kčs.", action:givePlayerMoney, value:80000},
    { text: "Prosadils obchodní dům na náměstí Míru v Jihlavě. Odměna 50 000 Kčs.", action:givePlayerMoney, value:50000},
    { text: "Pozval jsi 1. tajemníka na večeři. Skoč o 10 polí vpřed.", action:moveForward, value:10},
    { text: "Zařídil jsi synovi starožitníka modrou knížku. Odměna 10 000 Kčs.", action:givePlayerMoney, value:10000},
    { text: "Zvláštní odměna 10 000 Kčs.", action: givePlayerMoney, value: 10000},
    { text: "Našel jsi na ÚV peněženku s 10 000 Kčs.", action:givePlayerMoney, value:10000},
    { text: "Zvláštní odměna 20 000 Kčs.", action: givePlayerMoney, value: 20000},
    { text: "Odměna za scénář ke Dni tisku 10 000 Kčs.", action: givePlayerMoney, value: 10000},
    { text: "Za návrh slavnostní výzdoby města k 1. máji dostaneš 200 000 Kčs.", action: givePlayerMoney, value: 200000},
    { text: "Při narozeninách 1. tajemníka jsi hrál na harmoniku. O 7 polí vpřed.", action:moveForward, value:7},
];

let goodCardsPol = [
    { text: "Po Černobylské havárii jsi přemluvil cyklisty k závodu v Kyjevě. Dar 50 000 Kčs od ČSTV.", action:givePlayerMoney, value:50000},
    { text: "Souhlas se skladováním toxických odpadů z Kanady. Povize 200 000 Kčs.", action:givePlayerMoney, value:200000},
    { text: "Dar od prezidenta Gabuna v hodnotě 30 000 Kčs.", action:givePlayerMoney, value:30000},
    { text: "Nenavratná půjčka na nové auto 150 000 Kčs.", action: givePlayerMoney, value: 150000},
    { text: "Provize od firmy Leyland 300 000 Kčs.", action: givePlayerMoney, value: 300000},
    { text: "Dar od ČKD k narozeninám 50 000 Kčs.", action:givePlayerMoney, value:50000},
    { text: "Ředitel PZO ti přivezl z BRD videorekordér v hodnotě 25 000 Kčs.", action:givePlayerMoney, value:25000},
    { text: "Velvyslanec SSSR se zamiloval do tvé ženy. Skoč na GEN.", action:movePlayerToIndex, value:361},
    { text: "Zašels mezi dělníky. Pochvala s odměnou 10 000 Kčs.", action:givePlayerMoney, value:10000},
    { text: "Nechal jsi amerického senátora zastřelit medvěda v Tatrách. Dar 100 000 Kčs.", action:givePlayerMoney, value:100000},
    { text: "Prodal jsi vilu za 500 000 Kčs.", action:givePlayerMoney, value:500000},
    { text: "Úplatek 100 000 Kčs od umělce za prosazení titulu „Národní umělec“.", action:givePlayerMoney, value:10000},
    { text: "Nenávratná půjčka na stavbu vily 200 000 Kčs.", action:givePlayerMoney, value:200000},
    { text: "Prosadil jsi v Českém ráji chemičku. Odměna 500 000 Kčs.", action:givePlayerMoney, value:500000},
];

let goodCardsGen = [
    { text: "Příjem z knihy paměti 600 000 Kčs.", action:givePlayerMoney, value:600000},
    { text: "Odměna spřáteleného šejka za vojenskou materiální pomoc 500 000 Kčs.", action:givePlayerMoney, value:500000},
    { text: "Obdržel jsi od Odborů „Národní hrdinství“ za 50letou práci na plnění státního plánu. Odměna 200 000 Kčs.", action:givePlayerMoney, value:200000},
    { text: "Prodal jsi Japonsku korunovační klenoty za 3 000 000 Kčs.", action: givePlayerMoney, value: 3000000},
    { text: "Řád za dovršení výstavby socialismu v severních Čechách 140 000 Kčs.", action: givePlayerMoney, value: 140000},
    { text: "Prosadil jsi výstavbu díla Gabčíkovo. Provize 200 000 Kčs.", action:givePlayerMoney, value:200000},
    { text: "Zásluha o výstavbu atomové elektrárny v Temelíně. Dar od rakouského lidu v hodnotě 100 000 Kčs.", action:givePlayerMoney, value:100000},
    { text: "Dar od rumunského prezidenta v hodnotě 50 000 Kčs.", action:givePlayerMoney, value:50000},
    { text: "Děda Mráz přinels v obálce 90 000 Kčs.", action:givePlayerMoney, value:90000},
    { text: "Dar od SSSR k 10. výročí srpna v hodnotě 500 000 Kčs.", action:givePlayerMoney, value:500000},
    { text: "Obdržel jsi čestný řád Klementa Gottwalda a obálku s 250 000 Kčs.", action:givePlayerMoney, value:250000},
    { text: "Ideologický tajemník s tebou schválně prohrál v kartách 50 000 Kčs.", action:givePlayerMoney, value:50000},
    { text: "Obdržel jsi Leninův řád a obálku se šekem na 300 000 Kčs.", action:givePlayerMoney, value:300000},
    { text: "Za LP s tvými projevy 250 000 Kčs.", action:givePlayerMoney, value:250000},
];

let badCardsBez = [
    { text: "Straníš se kolektivu. Vyplať každému 1 000 Kčs.", action:giveOtherPlayersMoney, value:-1000},
    { text: "Demonstroval jsi za lidská práva. Jdi do vězení.", action:vezeni},
    { text: "Našli ti doma amatérskou vysílačku. Pokuta 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Úplatek popelářům 100 Kčs.", action:givePlayerMoney, value: -100},
    { text: "Nosíš dlouhé vlasy. O 5 polí zpět.", action:moveBackward, value: -5},
    { text: "Koupil jsi jizdní kolo. Zaplať 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Prohrál jsi v kartách poslední výplatu. 1x neházíš.", action:playerSkipRound, value:1},
    { text: "Úplatek instalatérovi 500 Kčs.", action:givePlayerMoney, value: -500},
    { text: "Koupil jsi manželce necky a valchu za 500 Kčs.", action:givePlayerMoney, value: -500},
    { text: "Narodilo se ti dítě. Koupíš kočárek za 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Platíš za celou hospodu 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Nevyvěsil jsi 7. listopadu vlajky. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Při volbách jsi šel za plentu. Vrať se na start.", action:movePlayerToIndex, value: 2},
    { text: "Byl sis na US velvyslanectví pro časopis. Jdi o 6 polí zpět.", action:moveBackward, value: -6},
    { text: "Odmítl jsi členství v KSČ. Jdi o 6 polí zpět.", action:moveBackward, value: -6},
    { text: "Pil jsi v hospodě vedle západního Němce. Podezření ze špionáže. 3x neházíš.", action:playerSkipRound, value:3},
    { text: "Daroval jsi krev a dostal jsi žloutenku. 2x neházíš a 5 000 Kčs úplatek lékařům.", action:givePlayerMoney, value: -5000, secondAction:playerSkipRound, secondValue:2},
    { text: "Nevyvěsil jsi praporky na 1. máje. Pokuta 100 Kčs.", action:givePlayerMoney, value: -100},
    { text: "Udělal jsi v práci zmatek. Náhrada škody 2 500 Kčs.", action:givePlayerMoney, value: -2500},
    { text: "Řekl jsi v hospodě, že Havel bude možná jednou prezident. Jdi do blázince.", action:blazinec},
    { text: "Ukradl jsi v samoobsluze housku. Pokuta 1 000 Kčs.", action:givePlayerMoney, value: -1000},
];

let badCardsKan = [
    { text: "Jdeš na vojenské cvičení. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Koupil jsi motocykl. Zaplať 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Češeš si „Emana“. Jdi na BEZ.", action:movePlayerToIndex, value: 2},
    { text: "Jdeš do vězení pro urážku hlavy státu.", action:vezeni},
    { text: "Viděli tě v americké bundě. Vrať se na KAN.", action:movePlayerToIndex, value: 104},
    { text: "Splátka půjčky na auto 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Odmítl jsi spolupráci s STB. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Pradědeček měl továrnu. Vrať se na KAN.", action:movePlayerToIndex, value: 104},
    { text: "V mládí jsi ministroval. Vrať se na BEZ.", action:movePlayerToIndex, value: 2},
    { text: "Prohraješ 100 000 Kčs na dostihách.", action:givePlayerMoney, value: -100000},
    { text: "Výlet Vlakem družby do SSSR. Zaplatíš 250 Kčs.", action:givePlayerMoney, value:-250},
    { text: "Dárek řediteli k narozeninám za 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Zaplať příspěvky na ROH 50 Kčs.", action:givePlayerMoney, value: -50},
    { text: "Nebyl jsi na manifestaci. Jdi o 5 polí zpět.", action:moveBackward, value: -5},
    { text: "Před jízdou autem jsi pil. Úplatek příslušníkovi VB 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Úplatek lékaři 5 000 Kčs.", action:givePlayerMoney, value: -5000},
    { text: "Inkaso 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Nestál jsi v pozoru při hymně. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Nepozdravil jsi domovnici - předsedkyni domovního výboru. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Nebyl jsi v průvodu a ani si nezazpíval z okna Internacionálu. Zaplať 5 000 Kčs.", action:givePlayerMoney, value: -5000},
    { text: "Pokuta za rychlou jízdu 500 Kčs.", action:givePlayerMoney, value: -500},
];

let badCardsKom = [
    { text: "Celníci ti našli Playboye. Pokuta 1 000 Kčs.", action:givePlayerMoney, value:-1000},
    { text: "Ztratil jsi stranickou legitimaci. Zaplať 2 000 Kčs a jednou neházíš.", action:givePlayerMoney, value: -2000, secondAction:playerSkipRound, secondValue:1},
    { text: "Úplatek na OPBH 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Předplatil sis Rudé Právo. Zaplať 50 Kčs.", action:givePlayerMoney, value: -50},
    { text: "Sušil jsi na Rudém Právu houby. Důtka a pokuta 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Smál ses v mauzoleu V. I. Lenina. Jdi před 2. prověrky.", action:movePlayerToIndex, value:158},
    { text: "Nadával jsi na straníky, ač jím jsi sám. Jdi před 2. prověrky.", action:movePlayerToIndex, value:158},
    { text: "Dovolená na Krymu 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Koupil sis knihu „Rudá záře nad Kladnem“ za 100 Kčs.", action:givePlayerMoney, value: -100},
    { text: "Máš výčitky svědomí, že jsi vstoupil do strany. Nakonec se zblázníš. Jdi do blázince.", action:blazinec},
    { text: "Nechodíš na schůze. Jdi o 10 polí zpět.", action:moveBackward, value:-10},
    { text: "Koupil jsi obraz „Zjevení panenky Marie“ za 200 Kčs.", action:givePlayerMoney, value: -200},
    { text: "Nenosíš stranický odznak. Vrať se na KOM a 2x neházíš.", action:movePlayerToIndex, value: 122, secondAction:playerSkipRound, secondValue:2},
    { text: "Vychvaloval jsi americká auta. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Ztratil jsi poslední výplatu. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Zaplať stranické příspěvky 500 Kčs.", action:givePlayerMoney, value: -500},
    { text: "Zabloudil jsi na Šumavě do hraničního pásma. Pokuta 1 000 Kčs a 2x neházíš.", action:givePlayerMoney, value: -1000, secondAction:playerSkipRound, secondValue:2},
    { text: "Nepodepsal jsi Antichartu. Jdi na BEZ.", action:movePlayerToIndex, value:2},
    { text: "Tančil jsi „Cherleston“. Pokuta 500 Kčs a jdi na 2. prověrky.", action:movePlayerToIndex, value: 158, secondAction:givePlayerMoney, secondValue:-500},
    { text: "Koupil jsi automobil. Zaplať 100 000 Kčs.", action:givePlayerMoney, value: -100000},
    { text: "Po cvičení milic jsi ztratil samopal. Náhrada škody 2 000 Kčs.", action:givePlayerMoney, value: -2000},
];

let badCardsPos = [
    { text: "Tvoje dcera si vzala Švéda. Vrať se na KOM.", action:movePlayerToIndex, value:122},
    { text: "Koupil sis jachtu. Zaplať 200 000 Kčs.", action:givePlayerMoney, value: -200000},
    { text: "Řekl jsi na veřejnosti, že Plzeň osvobodily USA. Jdi do blázince.", action:blazinec},
    { text: "Na MDŽ skončíš na záchytce. Zaplaťíš 500 Kčs a jednou neházíš.", action:givePlayerMoney, value: -500, secondAction:playerSkipRound, secondValue:1},
    { text: "Dal jsi vekslákovi 50 000 Kčs za dolary, které byly falešné.", action:givePlayerMoney, value: -50000},
    { text: "Po návštěvě USA vracíš stranickou legitimaci. Jdi na BEZ.", action:movePlayerToIndex, value:2},
    { text: "Setkal ses v zahraničí s emigrantem. Jdi na KOM.", action:movePlayerToIndex, value:122},
    { text: "Tvého syna pionýra odšátkovali. Vrať se na KOM.", action:movePlayerToIndex, value: 122},
    { text: "Jezdíš na trampy. Zpět na POS.", action:movePlayerToIndex, value: 172},
    { text: "Byl jsi viděn s disidentem. Vrať se na KOM.", action:movePlayerToIndex, value: 122},
    { text: "Byl jsi zbit svými voliči a jdeš do nemocnice. Jednou neházíš.", action:playerSkipRound, value: 1},
    { text: "Kapsář ti ukradl poslední výplatu. Ztratil si 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Opil ses na veřejnosti. Jdi o 10 polí zpět.", action:moveBackward, value: -10},
    { text: "Koupil sis konfiskovanou vilu za 40 000 Kčs.", action:givePlayerMoney, value:-40000},
    { text: "Zaplatíš na solidaritu 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Pohostil jsi doma populárního herce. Náklady 2 000 Kčs.", action:givePlayerMoney, value: -2000},
    { text: "Máš rád jazz. Skoč o 5 polí zpět.", action:moveBackward, value: -5},
    { text: "Zaplatil jsi úklid kanceláří po oslavě MDŽ. 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Stavba bazénu 15 000 Kčs.", action:givePlayerMoney, value: -15000},
    { text: "Ztratil jsi tajné dokumenty. Jdi na KOM.", action:movePlayerToIndex, value: 122},
    { text: "Koupil si v trafice „Lidovou demokracii“. Vrať se na KOM.", action:movePlayerToIndex, value: 122},
];

let badCardsUv = [
    { text: "Máš v knihovně „Hovory s TGM“. Vrať se na KOM a jednou neházíš.", action:movePlayerToIndex, value:122, secondAction:playerSkipRound, secondValue:1},
    { text: "Syn ti emigroval. Vrať se na POS. Jednou neházíš a zaplať 10 000 Kčs.", action:givePlayerMoney, value: -10000, secondAction:playerSkipRound, secondValue:1, thirdAction:movePlayerToIndex, thirdValue: 172},
    { text: "Někdo se ti vloupal do vily a ukradli ti všechny peníze", action:givePlayerMoney, value:"vsechnyPrachyPryc"},
    { text: "Ukradli ti Bony do Tuzexu za 50 000 Kčs.", action:givePlayerMoney, value: -50000},
    { text: "Při Internacionále jsi žvýkal. Pokuta 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Nepoznal jsi manželku 1. tajemníka a nepozdravil ji. 2x neházíš.", action:playerSkipRound, value:2},
    { text: "Za odstranění tetování zaplatíš lékaři 5 000 Kčs.", action:givePlayerMoney, value:-5000},
    { text: "Usnul jsi na zasedání ÚV. Jdi na KOM.", action:movePlayerToIndex, value: 122},
    { text: "Někdo ti v noci vymlátil všechna okna. Škoda 5 000 Kčs.", action:givePlayerMoney, value: -5000},
    { text: "Nákup švýcarkských mléčných výrobků a pitné vody ve vládní prodejně za 1 500 Kčs.", action:givePlayerMoney, value: -1500},
    { text: "Napsal jsi příbuznému v cizině. Jdi na POS.", action:movePlayerToIndex, value: 172},
    { text: "Nechal jsi manželce vybrat sádlo ve vojenské nemocnici. Úplatek 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Velmi se podobáš papežovi Piovi. Vrať se na POS.", action:movePlayerToIndex, value: 172},
    { text: "Byl jsi viděn v kostele. Jdi na POS a jednou neházíš.", action:movePlayerToIndex, value:172, secondAction:playerSkipRound, value:1},
    { text: "Poplatek za vypsání z církve 500 Kčs.", action:givePlayerMoney, value: -500},
    { text: "Koupil jsi v zahraničí známé herečce parfém za 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "V disciplinárním řízení jsi se zastal Žida. Jdi na POS.", action:movePlayerToIndex, value: 172},
    { text: "Na osadě, kde máš chatu, ti někdo prořeže gumy. Škoda 4 000 Kčs.", action:givePlayerMoney, value: -4000},
    { text: "Jsi židovského původu. Vrať se na POS, zaplať 10 000 Kčs a 3x neházej.", action:givePlayerMoney, value: -10000, secondAction:movePlayerToIndex,secondValue:172, thirdAction:playerSkipRound,thirdValue:3},
    { text: "Koupil sis větroň. Zaplať 300 000 Kčs.", action:givePlayerMoney, value: -300000},
    { text: "V den úmrtí sov. 1. tajemníka jsi byl málo smutný. Vrať se o 7 polí zpět.", action:moveBackward, value: -7},
];

let badCardsPol = [
    { text: "Na honu na Konopišti tě pokousal pes. 1x neházíš.", action:playerSkipRound, value:1},
    { text: "Koupil sis letadlo. Zaplať 1 000 000 Kčs.", action:givePlayerMoney, value: -1000000},
    { text: "Byl jsi za války v Hitlerjugend. Jdi o 1 pole zpět.", action:moveBackward, value:-1},
    { text: "Žlučníkový záchvat po recepci. 1x neházíš.", action:playerSkipRound, value: 1},
    { text: "Jezdíš v západním autě. Jdi na POS.", action:movePlayerToIndex, value: 172},
    { text: "Koupil jsi v zahraničí známé herečce šaty za 3 000 Kčs.", action:givePlayerMoney, value:-3000},
    { text: "Kritizoval jsi rumunské hospodářství. 1x neházíš.", action:playerSkipRound, value:1},
    { text: "Dědeček měl živnost. Vrať se na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Uklouzl jsi v GUMu na schodech a zlomil sis nohu. 3x neházíš a zaplať 5 000 Kčs.", action:givePlayerMoney, value: -5000, secondAction:playerSkipRound, secondValue:3},
    { text: "Rozvedl ses a přišel o polovinu jmění.", action:givePlayerMoney, value:"polovinaMoneyPryc"},
    { text: "Prohrál jsi s 1. tajemníkem v gorodkách 5 000 Kčs.", action:givePlayerMoney, value: -5000},
    { text: "Dovolená na Kubě za 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Prohrál jsi schválně s 1. tajemníkem v šachu 10 000 Kčs.", action:givePlayerMoney, value: -10000},
    { text: "Na 1. máje máváš na tribuně 5 hodin třepetalkou. Léčíš si doma akutní tenisový loket. Jednou neházíš", action:playerSkipRound, value:1},
    { text: "Kritizoval jsi 1. tajemníka. Jdi na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Nelíbíš se sov. poradci. Jdi o 3 pole zpět a 1x neházíš.", action:moveBackward, value: -3, secondAction:playerSkipRound, secondValue:1},
    { text: "Jsi přemrštěně sečtělý. Vrať se na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Usnul jsi při Internacionále. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Vyprávěl jsi na ÚV politický vtip. Jdi na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Vnuk nevstoupil do pionýra. Vrať se na ÚV.", action:movePlayerToIndex, value: 230},
    { text: "Rodiče měli pole a dvě krávy. Vrať se na POS a jednou neházíš", action:movePlayerToIndex, value: 172, secondAction:playerSkipRound, secondValue:1},
];

let badCardsGen = [
    { text: "Dostal jsi na letišti od sov. 1. tajemníka opar. 2x neházíš.", action:playerSkipRound, value:2},
    { text: "Uložil jsi do Švýcarska 1 000 000 Kčs a ztratil jsi lístek s číslem konta.", action:givePlayerMoney, value: -1000000},
    { text: "Inkaso 50 Kčs.", action:givePlayerMoney, value:-50},
    { text: "Koupil jsi sovětskému 1. tajemníkovi džíny za 1 000 Kčs.", action:givePlayerMoney, value: -1000},
    { text: "Nedostal jsi instrukce z Moskvy. 3x neházíš.", action:playerSkipRound, value: 3},
    { text: "Velitel ochranky ti šlápl na nohu a zlomil ti ji. 2x neházíš.", action:playerSkipRound, value:2},
    { text: "Koupil sis Mercedes 560 Sel. Zaplať 2 000 000 Kčs.", action:givePlayerMoney, value:-2000000},
    { text: "Necháš si udělat protiatomový kryt pod chatou. Zaplať 100 000 Kčs.", action:givePlayerMoney, value: -100000},
    { text: "Jedeš na přátelskou návštěvu Vietnamu. 1x neházíš.", action:playerSkipRound, value: 1},
    { text: "Umíš špatně rusky. 1x neházíš.", action:playerSkipRound, value:1},
    { text: "Při projevu jsi řekl 2x nevědomky „vole“. Vrať se na POL.", action:movePlayerToIndex, value: 287},
    { text: "Šofér ti přibouchl do dveří Tatry 613 prsty. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Ideologický tajemník tě nešťastnou náhodou zasáhl gorodkou do hlavy a odvezli tě do nemocnice. 3x neházíš.", action:playerSkipRound, value: 3},
    { text: "Hacienda na Orlíku za 50 000 Kčs.", action:givePlayerMoney, value:-50000},
    { text: "Utrhl se s tebou při projevu na Staroměstském náměstí balkón. Jsi týden v nemocnici. 3x neházej.", action:playerSkipRound, value: 3},
    { text: "Dovolená na Krymu 1 500 Kčs.", action:givePlayerMoney, value: -1500},
    { text: "V moskvě ses přiotrávil alkoholem. 2x neházíš.", action:playerSkipRound, value: 2},
    { text: "Odmítl jsi v Moskvě pít. Jdi o 10 polí zpět.", action:moveBackward, value: -10},
    { text: "Nemáš rád vodku. Jdi na POL.", action:movePlayerToIndex, value: 287},
    { text: "Opil ses a nejsi schopen přečíst projev. Vrať se o 10 polí zpět.", action:moveBackward, value: -10},
    { text: "20 000 Kčs vyděračovi za kompromitující fotografie.", action:givePlayerMoney, value: -20000},
];

const goodCardsBezLocal = [...goodCardsBez];
const goodCardsKanLocal = [...goodCardsKan];
const goodCardsKomLocal = [...goodCardsKom];
const goodCardsPosLocal = [...goodCardsPos];
const goodCardsUvLocal = [...goodCardsUv];
const goodCardsPolLocal = [...goodCardsPol];
const goodCardsGenLocal = [...goodCardsGen];

const badCardsBezLocal = [...badCardsBez];
const badCardsKanLocal = [...badCardsKan];
const badCardsKomLocal = [...badCardsKom];
const badCardsPosLocal = [...badCardsPos];
const badCardsUvLocal = [...badCardsUv];
const badCardsPolLocal = [...badCardsPol];
const badCardsGenLocal = [...badCardsGen];

let goodCardSPol = goodCardsPol;

let badCardSPol = badCardsPol;

socket.on("playerDrawACard", (data) =>{
    if(!playerDrawACard){
        if(data.nextPosition.isSpecialBad){
            badCard.interactive = true;
            badCard.buttonMode = true;
            const arrow = createBouncingArrow(140, 280);
            badCard.on("pointerdown", () => app.stage.removeChild(arrow));
            goodCard.alpha = 0.2;
        }
        else{
            goodCard.interactive = true;
            goodCard.buttonMode = true;
            const arrow = createBouncingArrow(140,90);
            goodCard.on("pointerdown", () => app.stage.removeChild(arrow));
            badCard.alpha = 0.2;
        }
        toggleOverlays(true);
        playerDrawACard = true;
    }
});

socket.on("removeGoodCard", (data) =>{
    const player = players[data.clientId];
    if(player.postaveni == "Bezpartijní"){
        goodCardsBez.splice(data.index,1);
        if(goodCardsBez.length < 1){
            goodCardsBez = [...goodCardsBezLocal];
        }
    }
    else if(player.postaveni == "Kandidát"){
        goodCardsKan.splice(data.index,1);
        if(goodCardsKan.length < 1){
            goodCardsKan = [...goodCardsKanLocal];
        }
    }
    else if(player.postaveni == "Komunista"){
        goodCardsKom.splice(data.index,1);
        if(goodCardsKom.length < 1){
            goodCardsKom = [...goodCardsKomLocal];
        }
    }
    else if(player.postaveni == "Poslanec"){
        goodCardsPos.splice(data.index,1);
        if(goodCardsPos.length < 1){
            goodCardsPos = [...goodCardsPosLocal];
        }
    }
    else if(player.postaveni == "Člen ÚV"){
        goodCardsUv.splice(data.index,1);
        if(goodCardsUv.length < 1){
            goodCardsUv = [...goodCardsUvLocal];
        }
    }
    else if(player.postaveni == "Člen Politbyra ÚV"){
        goodCardSPol.splice(data.index,1);
        if(goodCardsPol.length < 1){
            goodCardsPol = [...goodCardsPolLocal];
        }
    }
    else if(player.postaveni == "Generální Tajemník ÚV strany"){
        goodCardsGen.splice(data.index,1);
        if(goodCardsGen.length < 1){
            goodCardsGen = [...goodCardsGenLocal];
        }
    }

});

socket.on("removeBadCard", (data) =>{
    const player = players[data.clientId];
    if(player.postaveni == "Bezpartijní"){
        badCardsBez.splice(data.index,1);
        if(badCardsBez.length < 1){
            badCardsBez = [...badCardsBezLocal];
        }
    }
    else if(player.postaveni == "Kandidát"){
        badCardsKan.splice(data.index,1);
        if(badCardsKan.length < 1){
            badCardsKan = [...badCardsKanLocal];
        }
    }
    else if(player.postaveni == "Komunista"){
        badCardsKom.splice(data.index,1);
        if(badCardsKom.length < 1){
            badCardsKom = [...badCardsKomLocal];
        }
    }
    else if(player.postaveni == "Poslanec"){
        badCardsPos.splice(data.index,1);
        if(badCardsPos.length < 1){
            badCardsPos = [...badCardsPosLocal];
        }
    }
    else if(player.postaveni == "Člen ÚV"){
        badCardsUv.splice(data.index,1);
        if(badCardsUv.length < 1){
            badCardsUv = [...badCardsUvLocal];
        }
    }
    else if(player.postaveni == "Člen Politbyra ÚV"){
        badCardSPol.splice(data.index,1);
        if(badCardsPol.length < 1){
            badCardsPol = [...badCardsPolLocal];
        }
    }
    else if(player.postaveni == "Generální Tajemník ÚV strany"){
        badCardsGen.splice(data.index,1);
        if(badCardsGen.length < 1){
            badCardsGen = [...badCardsGenLocal];
        }
    }

});

goodCard.on("pointerdown", function(event) {
    goodCard.interactive = false;
    goodCard.buttonMode = false;
    goodCard.alpha = 0.5;

    const player = players[clientId];
    const chance = Math.random();

    let randomIndex = Math.floor(Math.random() * goodCardsBez.length);
    let randomCard = goodCardsBez[randomIndex];
    if(chance < 0.1){
        randomIndex = Math.floor(Math.random() * universalCards.length);
        randomCard = universalCards[randomIndex];
    }
    else{
        if(player.postaveni == "Bezpartijní"){
            randomIndex = Math.floor(Math.random() * goodCardsBez.length);
            randomCard = goodCardsBez[randomIndex];
        }
        else if(player.postaveni == "Kandidát"){
            randomIndex = Math.floor(Math.random() * goodCardsKan.length);
            randomCard = goodCardsKan[randomIndex];
        }
        else if(player.postaveni == "Komunista"){
            randomIndex = Math.floor(Math.random() * goodCardsKom.length);
            randomCard = goodCardsKom[randomIndex];
        }
        else if(player.postaveni == "Poslanec"){
            randomIndex = Math.floor(Math.random() * goodCardsPos.length);
            randomCard = goodCardsPos[randomIndex];
        }
        else if(player.postaveni == "Člen ÚV"){
            randomIndex = Math.floor(Math.random() * goodCardsUv.length);
            randomCard = goodCardsUv[randomIndex];
        }
        else if(player.postaveni == "Člen Politbyra ÚV"){
            randomIndex = Math.floor(Math.random() * goodCardsPol.length);
            randomCard = goodCardsPol[randomIndex];
        }
        else if(player.postaveni == "Generální Tajemník ÚV strany"){
            randomIndex = Math.floor(Math.random() * goodCardsGen.length);
            randomCard = goodCardsGen[randomIndex];
        }
    }

    socket.emit("removeGoodCard", { gameId, index:randomIndex, clientId });

    let card = document.createElement("div");
    card.className = "card";

    let cardText = `${player.postaveni}: ${randomCard.text}`;
    card.innerHTML = `
        <div class="cardFront" style="background-image: url(/obrazky/hra/smajlikGood.webp);"></div>
        <div class="cardBack" style="background-color: white; font-size:20px; display:flex; justify-content:center; align-items:center;"><h7><strong>${player.postaveni}</strong>: ${randomCard.text}</h7></div>
    `;

    Object.keys(unknownWords).forEach(word => {
        if (cardText.includes(word)) {
            const infoIcon = createInfoIcon(word);
            card.querySelector(".cardBack").appendChild(infoIcon);
        }
    });

    document.body.appendChild(card);

    positionCard(card, event.clientX, event.clientY);
    animationCard(card, randomCard);
});

badCard.on("pointerdown", function(event) {
    badCard.interactive = false;
    badCard.buttonMode = false;
    badCard.alpha = 0.5;

    const player = players[clientId];

    let randomIndex = Math.floor(Math.random() * badCardsBez.length);
    let randomCard = badCardsBez[randomIndex];

    if(player.postaveni == "Bezpartijní"){
        randomIndex = Math.floor(Math.random() * badCardsBez.length);
        randomCard = badCardsBez[randomIndex];
    }
    else if(player.postaveni == "Kandidát"){
        randomIndex = Math.floor(Math.random() * badCardsKan.length);
        randomCard = badCardsKan[randomIndex];
    }
    else if(player.postaveni == "Komunista"){
        randomIndex = Math.floor(Math.random() * badCardsKom.length);
        randomCard = badCardsKom[randomIndex];
    }
    else if(player.postaveni == "Poslanec"){
        randomIndex = Math.floor(Math.random() * badCardsPos.length);
        randomCard = badCardsPos[randomIndex];
    }
    else if(player.postaveni == "Člen ÚV"){
        randomIndex = Math.floor(Math.random() * badCardsUv.length);
        randomCard = badCardsUv[randomIndex];
    }
    else if(player.postaveni == "Člen Politbyra ÚV"){
        randomIndex = Math.floor(Math.random() * badCardsPol.length);
        randomCard = badCardsPol[randomIndex];
    }
    else if(player.postaveni == "Generální Tajemník ÚV strany"){
        randomIndex = Math.floor(Math.random() * badCardsGen.length);
        randomCard = badCardsGen[randomIndex];
    }

    socket.emit("removeBadCard", { gameId, index:randomIndex, clientId });

    let card = document.createElement("div");
    card.className = "card";

    let cardText = `${player.postaveni}: ${randomCard.text}`;
    card.innerHTML = `
        <div class="cardFront" style="background-image: url(/obrazky/hra/smajlikBad.webp);"></div>
        <div class="cardBack" style="background-color: white; font-size:20px; display:flex; justify-content:center; align-items:center;"><h7><strong>${player.postaveni}</strong>: ${randomCard.text}</h7></div>
    `;

    Object.keys(unknownWords).forEach(word => {
        if (cardText.includes(word)) {
            let existingInfoIcon = card.querySelector(".info-icon");

            if(existingInfoIcon){
                const currentTooltip = existingInfoIcon.getAttribute("data-tooltip");
                existingInfoIcon.setAttribute("data-tooltip", `${currentTooltip}\n${unknownWords[word]}`);
            }
            else{
                const infoIcon = createInfoIcon(word);
                card.querySelector(".cardBack").appendChild(infoIcon);
            }
        }
    });

    document.body.appendChild(card);

    positionCard(card, event.clientX, event.clientY);
    animationCard(card, randomCard);
});

function animationCard(card, randomCard) {
    const player = players[clientId];
    gsap.to(card, {
        duration: 0.7,
        position: "absolute",
        top: "50vh",
        left: "50vw",
        width: "250px",
        height: "375px",
        ease: "power1.out",
        transform: "translate(-50%, -50%)",
        onComplete: () => setupCardAnimation(card, randomCard, player),
    });
}

function setupCardAnimation(card, randomCard, player) {
    gsap.utils.toArray(".card").forEach((card) => {
        gsap.set(card, {
            transformStyle: "preserve-3d",
            transformPerspective: 1000,
        });

        const q = gsap.utils.selector(card);
        const front = q(".cardFront");
        const back = q(".cardBack");

        gsap.set(back, { rotationY: -180 });

        const tl = gsap.timeline({ paused: true })
        .to(front, { duration: 1, rotationY: 180 })
        .to(back, { duration: 1, rotationY: 0 }, 0)
        .to(card, { z: 50 }, 0)
        .to(card, { z: 0 }, 0.5)
        .to(card, 0, { onComplete: () => addCardButtons(card, randomCard, player) });

        card.addEventListener("click", () => tl.play());
    });
}

function addCardButtons(card, randomCard, player) {
    createButton("Vykonat", "deleteBtn", card, () => {
        if (randomCard.action) randomCard.action(randomCard.value);
        if (randomCard.secondAction) randomCard.secondAction(randomCard.secondValue);
        if (randomCard.thirdAction) randomCard.thirdAction(randomCard.thirdValue);

        cleanupCard(card);
    });

        if (randomCard.action === vezeni) {
            if(player.vezeniCard){
                createButton("Použít kartu", "vezeniCard", card, () => {
                    removeSpecialCard("vezeni");
                    cleanupCard(card);
                });
            }

            if(player.money > 50000){
                createButton("Vyplatit kauci 50 000 Kčs", "vezeniCard", card, () => {
                    socket.emit("givePlayerMoney", { clientId, money: -50000, gameId });
                    cleanupCard(card);
                });
            }
        }
}

function createButton(text, className, parent, onClick) {
    let button = document.createElement("button");
    button.className = className;
    button.innerHTML = text;

    button.addEventListener("click", onClick);
    parent.appendChild(button);
    return button;
}

function cleanupCard(card) {
    card.remove();
    toggleOverlays(false);
    goodCard.alpha = 1;
    badCard.alpha = 1;
    playerDrawACard = false;
}

function createInfoIcon(word){
    const infoIcon = document.createElement("div");
    infoIcon.className = "info-icon";
    infoIcon.textContent = "ℹ️";
    infoIcon.setAttribute("data-tooltip", unknownWords[word]);
    infoIcon.style.position = "absolute";
    infoIcon.style.bottom = "5px";
    infoIcon.style.right = "10px";
    infoIcon.style.cursor = "pointer";

    infoIcon.addEventListener("mouseover", function() {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = infoIcon.getAttribute("data-tooltip");
        tooltip.style.whiteSpace = "pre-wrap";
        infoIcon.parentNode.appendChild(tooltip);

        tooltip.style.position = "absolute";
        tooltip.style.top = `${infoIcon.offsetTop - 40}px`;
        tooltip.style.left = `${infoIcon.offsetLeft + 20}px`;
    });

    infoIcon.addEventListener("mouseout", function() {
        const tooltip = infoIcon.parentNode.querySelector(".tooltip");
        if (tooltip) {
            tooltip.remove();
        }
    });

    return infoIcon;
}

function positionCard(card, x, y){
    card.style.top = `${y}px`;
    card.style.left = `${x}px`;
    card.style.display = "block";

    gsap.utils.toArray(".card").forEach(function(card) {
        gsap.set(card, {
            transformStyle: "preserve-3d",
            transformPerspective: 1000
        });
        const q = gsap.utils.selector(card);
        const back = q(".cardBack");

        gsap.set(back, { rotationY:-180 });
    });
}