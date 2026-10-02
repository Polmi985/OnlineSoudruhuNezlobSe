# ☭ Soudruhu, nezlob se!

> **Webová multiplayer adaptace kultovní satirické deskové hry Ivana Mládka**  
> Vytvořeno jako projekt pro **klauzurní práce z JavaScriptu (2. ročník, 1. pololetí)**.

---

## 📌 O projektu

Tento projekt vznikl jako školní klauzurní práce zaměřená na pokročilé programování v JavaScriptu, synchronizaci stavu v reálném čase přes WebSockets a tvorbu interaktivního 2D grafického rozhraní. 

Hra je digitální verzí originální společenské hry **Ivana Mládka** z roku 1991 (později znovuvydané společností EFKO k 30. výročí Sametové revoluce). Hra satirickou formou reflektuje absurdity života a kariérismu v době normalizačního Československa.

> [!NOTE]  
> Tato hra v žádném případě nepropaguje totalitní režim ani dobu socialismu – jedná se o historickou satiru a nadsázku.

---

## 🎮 Cíl hry a herní princip

Cílem každého hráče je projít kariérním žebříčkem od řadového bezpartijního občana až po **Generálního tajemníka Ústředního výboru KSČ**, nashromáždit dostatek finančních prostředků (minimálně 1 000 000 Kčs), u veksláka směnit koruny za západoněmecké marky (50 000 DM) a úspěšně překonat nástrahy železné opony do **BRD** (Západního Německa).

Vítězí hráč, který jako první dosáhne cíle s valutami a přežije překonání hranice.

---

## 📜 Pravidla hry

### 🎖️ Kariérní pásma
Hráči postupují po spirále herního plánu přes následující hodnosti:
1. **BEZ** – Bezpartijní (startovní pole č. 2)
2. **KAN** – Kandidát KSČ
3. **KOM** – Člen komunistické strany
4. **POS** – Poslanec
5. **ÚV** – Člen Ústředního výboru
6. **POL** – Člen Politbyra ÚV
7. **GEN** – Generální tajemník ÚV strany

---

### 🎲 Pohyb a herní pole
- **Hod kostkou:** Hráč hází kostkou a posune se o daný počet polí. Při hození **6** hází hráč znovu.
- **Výplaty:** Políčka označená finanční částkou (700, 750, 800 Kčs...) znamenají výplatu od státu. Při posunu vpřed hráč inkasuje peníze. Pokud hráč přeskočí více výplat skokem vpřed, sčítají se.
- **Šťastné kartičky (zelený smajlík):** Hráč si táhne pozitivní kartu odpovídající jeho aktuálnímu pásmu (odměny, kariérní skoky).
- **Špatné kartičky (červený smajlík):** Hráč si táhne postihovou kartu (pokuty, ztráta tahu, pád v kariéře, vězení).
- **Speciální předměty:** Některé karty dávají trvalé předměty uložené u průkazu:
  - 🎫 *Propustka z vězení*
  - 📁 *Kompromitující materiál na předsedu prověrkové komise*
  - 🦺 *Neprůstřelná vesta*
  - ✂️ *Kleště na zátarasy*
  - 🗺️ *Plán zaminování*

---

### ⚖️ Speciální zóny a mechaniky

#### 1. Prověrky (pásmo KOM)
- Šlápnutí na **ANO**: Hráč je prověřen a postupuje na konec prověrek.
- Šlápnutí na **NE**: Neúspěch u prověrek. Hráč padá zpět na **BEZ**, pokud nepoužije *Kompromitující materiál*, nebo neuplatí komisi částkou **30 000 Kčs**.

#### 2. Vězení a Blázinec
- **Vězení:** Hráč se sem dostane příkazem z karty nebo bankrotem (záporný stav konta).
  - *Propuštění:* Hodem 1 nebo 6 (návrat na BEZ), použitím karty *Propustka z vězení*, nebo složením kauce **50 000 Kčs**.
- **Blázinec:** Vstup pouze na základě karty.
  - *Propuštění:* Hodem 1 nebo 6 (začíná se opět od BEZ).

#### 3. Vyhazování protihráčů
- V pásmech **BEZ** až **ÚV** se hráči nevyhazují a mohou stát na stejném políčku.
- V pásmu **POL** smí hráč vyhodit soupeře **pouze zezadu** (vyhozený hráč platí 100 000 Kčs a vrací se na začátek pásma POL).
- V pásmu **GEN** je možný pohyb oběma směry (pomocí šipek). Vyhazovat lze v obou směrech (vyhozený platí 100 000 Kčs a vrací se na GEN; vyhození z pole VEKSL připraví hráče o veškeré peníze!).

#### 4. Finále a útěk do BRD
Na konci pásma GEN:
1. Hráč musí přímo skočit na pole **VEKSL** a směnit 1 000 000 Kčs za 50 000 DM. Bez milionu korun není směna možná.
2. Následuje hraniční pásmo se smrtícími nástrahami:
   - **PS (Pohraniční stráž):** Záchrana pouze s kartou *Neprůstřelná vesta*, jinak smrt a konec ve hře.
   - **Elektrické zátarasy (Vysoké napětí):** Záchrana pouze s kartou *Kleště na zátarasy*, jinak smrt a konec ve hře.
   - **MINA (Minové pole):** Záchrana pouze s kartou *Plán zaminování*, jinak výbuch a konec ve hře.
3. Kdo projde do cíle se západoněmeckými markami, stává se vítězem!

---

## 💻 Technické řešení & Architektura

Hra běží na architektuře klient-server s obousměrnou komunikací v reálném čase:

- **Serverová část:**
  - **Node.js** & **Express** pro servírování statických souborů.
  - **Socket.IO** zajišťuje herní místnosti, tahový systém, správu lobby, synchronizaci pohybu a akcí všech hráčů.
  - Generování unikátních herních kódů pomocí `uuid`.

- **Klientská část:**
  - **Pixi.js (v7):** Hardwarově akcelerované 2D vykreslování herní plochy, animace pozic figurek a překryvných vrstev.
  - **GSAP:** Plynulé přechody, animace chůze figurek a 3D obracení karet.
  - **HTML5 & CSS3:** Vizuální styl stylizovaný do retro socialistických průkazů KSČ.

### 📁 Modulární struktura frontendových skriptů
Klientský kód je rozdělen do specializovaných skriptů:

| Soubor | Účel |
|---|---|
| `scripts/board.js` | Definice souřadnic všech 448 polí herní spirály a jejich typů |
| `scripts/dictionary.js` | Výkladový slovník dobových pojmů zobrazený v nápovědě u karet |
| `scripts/dialogMessages.js` | Texty hlášek a dialogů pro prověrky, pohraničí a speciální pole |
| `scripts/player.js` | Tvorba hráče, pohyb, kolize/vyhazování, průkazy, ikony a razítka |
| `scripts/cards.js` | Balíčky šťastných/špatných karet, jejich akce, obsluha tažení a animace |
| `scripts/speechBox.js` | Interaktivní modální dialogové okno s rozhodovacími tlačítky |
| `scripts/dice.js` | Vykreslení hrací kostky, animace rotace a vyhodnocení hodu |
| `scripts/main.js` | Jádro hry: Socket.IO připojení, stav hry, lobby, časovač, životní cyklus |
| `scripts/menu.js` | Logika hlavního menu a připojování do místností |
| `scripts/slovnik.js` | Prohlížeč dobového výkladového slovníku |

---

## 🚀 Instalace a spuštění

### Požadavky
- [Node.js](https://nodejs.org/) (verze 18 nebo novější)
- npm (součást instalace Node.js)

### Postup instalace
1. Naklonujte nebo stáhněte repozitář:
   ```bash
   git clone <URL_REPOZITARE>
   cd SoudruhuNezlobSe
   ```

2. Nainstalujte potřebné závislosti:
   ```bash
   npm install
   ```

3. Spusťte server:
   ```bash
   npm start
   # nebo: node index.js
   ```

4. Otevřete prohlížeč na adrese:
   ```text
   http://localhost:9091
   ```

Hostitel klikne na **Hrát -> Založit hru**, zadá jméno a nasdílí vygenerovaný kód hry ostatním hráčům, kteří se připojí přes **Připojit se do hry**.

---

## 👨‍💻 Autor & Kredity

- **Autor webové aplikace:** David Polmi (*klauzurní práce z JavaScriptu*)
- **Původní námět a desková hra:** Ivan Mládek (1991)
- **Vydavatel novodobé deskové verze:** EFKO-karton s.r.o.
