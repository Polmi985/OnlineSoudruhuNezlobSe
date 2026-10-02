const socket = io();

let host = false;

const menuBtns = document.querySelectorAll("#menuBtn");
const backBtns = document.querySelectorAll("#backBtn");

let errorMessage = document.querySelectorAll("#errorMessage");

//Pro každý HTML element který má id menuBtn tak to přidá event listener, zobrazí další kontent zaleží na data-target
menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".divContainer").forEach(div => {
            div.style.display = "none";
        });
        const target = btn.getAttribute("data-target");
        document.getElementById(target).style.display = "flex";
    });
});

//Pro každý HTML element ktery ma id backBtn tak to přidá event listener, který zobrazí předešlý kontent zalezí na data-target
backBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".divContainer").forEach(div => {
            div.style.display = "none";
        });
        const target = btn.getAttribute("data-target");
        document.getElementById(target).style.display = "flex";
    });
});

//Resetuje vždycky input kde bylo někde něco napsané, resetuje ho vzdycky když se klikne na nějaké tlačítko
function resetInput(){
    document.getElementById("userName").value = "";
    document.getElementById("hostUserName").value = "";
    document.getElementById("textGameId").value = "";
    errorMessage[0].style.display = "none";
    errorMessage[1].style.display = "none";
}

//Na tlačitko Založit hru to přidá event listener click, který se poprvé podívá jestli uživatel zadal jméno nebo ne, poté se podívá na délku jmena
//A pokud je všechno v pořádku tak ho to pošle do hry, do url připojí proměnné jestli hráč je host a hřáčovo jméno
document.getElementById("btnStart").addEventListener("click", () =>{
    const userName = document.getElementById("hostUserName").value;

    if (userName === "") {
        errorMessage[0].textContent = "!!Nezadali jste jmeno!!";
        errorMessage[0].style.display = "block";
    } else if (userName.length > 16) {
        errorMessage[0].textContent = "!!Jméno nesmí být delší než 20 znaků!!";
        errorMessage[0].style.display = "block";
    } else {
        host = true;
        window.location.href = `/subpages/game.html?host=${host}&userName=${userName}`;
    }
});

//Na tlačitko připojit se do hry to přidá event listener click, uděla podobné funkce jako když kliknete na tlacitko zalozit hru
//Akorat to v url posílá dané gameId které uživatel zadal
document.getElementById("btnJoin").addEventListener("click", () =>{
    const userName = document.getElementById("userName").value;
    const gameId = document.getElementById("textGameId").value;

    if (userName === "" || gameId === "") {
        errorMessage[1].textContent = "!!Zadejte všechny údaje!!";
        errorMessage[1].style.display = "block";
    } else if (userName.length > 16) {
        errorMessage[1].textContent = "!!Jméno nesmí být delší než 20 znaků!!";
        errorMessage[1].style.display = "block";
    } else {
        host = false;
        window.location.href = `/subpages/game.html?userName=${userName}&host=${host}&gameId=${gameId}`;
    }
});
