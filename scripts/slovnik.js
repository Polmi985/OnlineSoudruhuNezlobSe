const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");

//Definovaní každého HTML elementu, přesněji všech papírů co se tam nachází
const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");
const paper3 = document.querySelector("#p3");
const paper4 = document.querySelector("#p4");
const paper5 = document.querySelector("#p5");
const paper6 = document.querySelector("#p6");
const paper7 = document.querySelector("#p7");
const paper8 = document.querySelector("#p8");

prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);

let currentLocation = 1; //Na jakém papíře se zrovna uživatel nachází
let numOfPapers = 8; //Kolik je papírů
let maxLocation = numOfPapers + 1; //Kolik je max stranek

//Funkce na otevření knihy, deje se pouze na začátku
function openBook() {
    book.style.transform = "translateX(50%)";
    prevBtn.style.transform = "translateX(-180px)";
    nextBtn.style.transform = "translateX(180px)";
}

//Zavření knihy, pouze na konci
function closeBook(isAtBeginning) {
    if(isAtBeginning) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
    
    prevBtn.style.transform = "translateX(0px)";
    nextBtn.style.transform = "translateX(0px)";
}

//Přechod na další stránku, vždycky do přidá dané stránce třidu flipped
function goNextPage() {
    if (currentLocation < maxLocation) {
        switch (currentLocation) {
            case 1:
                openBook();
                paper1.classList.add("flipped");
                setTimeout(() => { paper1.style.zIndex = 1; }, 500); //Počkání na dokončení animace
                break;
            case 2:
                paper2.classList.add("flipped");
                setTimeout(() => { paper2.style.zIndex = 2; }, 500);
                break;
            case 3:
                paper3.classList.add("flipped");
                setTimeout(() => { paper3.style.zIndex = 3; }, 500);
                break;
            case 4:
                paper4.classList.add("flipped");
                setTimeout(() => { paper4.style.zIndex = 4; }, 500);
                break;
            case 5:
                paper5.classList.add("flipped");
                setTimeout(() => { paper5.style.zIndex = 5; }, 500);
                break;
            case 6:
                paper6.classList.add("flipped");
                setTimeout(() => { paper6.style.zIndex = 6; }, 500);
                break;
            case 7:
                paper7.classList.add("flipped");
                setTimeout(() => { paper7.style.zIndex = 7; }, 500);
                break;
            case 8:
                paper8.classList.add("flipped");
                setTimeout(() => { paper8.style.zIndex = 8; closeBook(false); }, 500);
                break;
            default:
                throw new Error("unknown state");
        }
        currentLocation++;
    }
}

//Přechod na předešlou stránku, toto oddělává třidu flipped
function goPrevPage() {
    if (currentLocation > 1) {
        switch (currentLocation) {
            case 2:
                closeBook(true);
                paper1.classList.remove("flipped");
                setTimeout(() => { paper1.style.zIndex = 8; }, 500);
                break;
            case 3:
                paper2.classList.remove("flipped");
                setTimeout(() => { paper2.style.zIndex = 7; }, 500);
                break;
            case 4:
                paper3.classList.remove("flipped");
                setTimeout(() => { paper3.style.zIndex = 6; }, 500);
                break;
            case 5:
                paper4.classList.remove("flipped");
                setTimeout(() => { paper4.style.zIndex = 5; }, 500);
                break;
            case 6:
                paper5.classList.remove("flipped");
                setTimeout(() => { paper5.style.zIndex = 4; }, 500);
                break;
            case 7:
                paper6.classList.remove("flipped");
                setTimeout(() => { paper6.style.zIndex = 3; }, 500);
                break;
            case 8:
                paper7.classList.remove("flipped");
                setTimeout(() => { paper7.style.zIndex = 2; }, 500);
                break;
            case 9:
                openBook();
                paper8.classList.remove("flipped");
                setTimeout(() => { paper8.style.zIndex = 1; }, 500);
                break;
            default:
                throw new Error("unknown state");
        }
        currentLocation--;
    }
}