// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "my-mine";
console.log(`GAME-CLIENT: ${GAME_TAG} -> Loaded`);
/**
 * socket - make socket IO event emissions...
 * getGameSpace() - get the DOM game space, put UI in there...
 * currentRoomCode - current room code player is in...
 * currentSocketId - current socket id (player id to server)...
 * knownPlayerArray - list of player ids and names...
 * getPlayerInfomation(id) - getinformation about a player...
 * displayMessage(message, name) - display a chat message
 */

/**
 * Client side PUBLIC (player can see) local variables are OK
 * Put them here...
 */
let yourCurrentSelection = null;

/**
 * DO NOT DELETE BELOW...
 */
export default function() {
    setup();
}

/**
 * setup() - Function that is called when game is selected BEFORE it is started...
 */
function setup() {
    console.log(`GAME-CLIENT: ${GAME_TAG} -> Setup`);
    // var script = document.createElement("script"); // create a script DOM node
    // script.src = `${GAME_TAG}/cardTags.js`; // set its src to the provided URL
    // import (`/${GAME_TAG}/cardTags.js`).then(module => {
    //     console.log(module);
    //     // module.hello('world');
    // });

    // document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
    //KEEP IN MIND SPECTATORS CAN SEE
    getGameSpace().innerHTML = `
    `;
}

/**
 * Make sure to EXPORT any functions that your DOM (UI) calls
 */
export function takeTop() {
    console.log("Taking top");
    socket.emit(`${GAME_TAG}-take-top-cave-card`, currentSocketId, currentRoomCode);
}

export function takeExit() {
    console.log("Taking exit");
    socket.emit(`${GAME_TAG}-take-top-exit-card`, currentSocketId, currentRoomCode);
}

export function selectOfferedChoice(choiceId) {
    console.log(choiceId);
    socket.emit(`${GAME_TAG}-take-selected-choice-id`, currentSocketId, currentRoomCode, choiceId);
}

export function pickPlayer(playerId) {
    console.log(playerId);
    socket.emit(`${GAME_TAG}-player-selected-for-switch`, currentSocketId, currentRoomCode, playerId);
}

/**
 * Use this function to render the game state.
 * When the server sends you a GAME STATE object (you can define this in server.js)
 * You should render (draw) the relevant info to the screen for the player (players) to see 
 * and interact with...
 */
function renderGameState(state) {
    console.log(state);
    let display = "";

    display += renderRoundNumber(state);
    display += renderGameMap(state);
    if (state.choiceMode == "card" && state.choices != null) {

        display += renderAdditionalOptionsBlock(state, state.players[state.currentPlayerIndex] == currentSocketId);
    } else if (state.choiceMode == "players") {

        display += renderAdditionalOptionsBlock(state, state.players[state.currentPlayerIndex] == currentSocketId);
    } else {
        display += renderCaveDeckTopCard(state, state.players[state.currentPlayerIndex] == currentSocketId);
        display += renderExitCardDeck(state.players[state.currentPlayerIndex] == currentSocketId);
    }
    display += displayGemCountAndLog(state);
    getGameSpace().innerHTML = display;
    var logDiv = document.getElementById(`${GAME_TAG}-log-container`);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function displayGemCountAndLog(state) {
    let out = `<div id="${GAME_TAG}-stat-container">`;
    out += `<div id="${GAME_TAG}-gem-container">`;
    state.game.playerList.forEach(player => {
        let gems = (state.game.gems[player] === undefined) ? 0 : state.game.gems[player];
        let gold = (state.game.nuggets[player] === undefined) ? 0 : state.game.nuggets[player];
        out += `
        <div class="${GAME_TAG}-gem-line">
            <span class="${GAME_TAG}-gem-line-name">${getPlayerInfomation(player).name}</span> : <img src="/${GAME_TAG}/media/gem.png" class="${GAME_TAG}-gem" style="width: 1.5em;"> x ${gems} : <img src="/${GAME_TAG}/media/gold.png" class="${GAME_TAG}-gem" style="width: 1.5em;"> x ${gold}
        </div>
        `;
    });
    out += `</div>`;
    out += `<div id="${GAME_TAG}-log-container">`;
    state.log.forEach(element => {
        out += `
        <div class="${GAME_TAG}-log-line">
            ${element}
        </div>
        `;
    });
    out += `</div>`;
    out += `</div>`;
    return out;
}

function renderRoundNumber(state) {
    let out = "";
    out += `
        <div>Round: ${state.game.roundNumber}</div>
    `
    return out;
}

function renderGameMap(state) {
    let m = state.game.map;
    let deadPlayers = state.game.dead;
    let safePlayers = state.game.safe;
    let out = "<div>";

    out += `<div class="${GAME_TAG}-cave-section">`;
    out += `<div class="${GAME_TAG}-exit-section">`;
    for (let index = 0; index < safePlayers.length; index++) {
        out += `<div class="${GAME_TAG}-player-name ${GAME_TAG}-player-safe-state">${getPlayerInfomation(safePlayers[index]).name}</div>`;
    }
    out += `</div>`;
    for (let index = 0; index < m.length; index++) {
        out += `<div class="${GAME_TAG}-cave-section-inner">`;
        if (index == state.game.dragonIndex) {
            out += `<div class="${GAME_TAG}-dragon"></div>`;
        } else {
            const cell = m[index];
            if (cell.length > 0) {
                cell.forEach(id => {
                    out += `<div class="${GAME_TAG}-player-name">${getPlayerInfomation(id).name}</div>`;
                });
            }
        }
        out += `</div>`;
    }
    out += `<div class="${GAME_TAG}-dead-section">`;
    for (let index = 0; index < deadPlayers.length; index++) {
        out += `<div class="${GAME_TAG}-player-name ${GAME_TAG}-player-dead-state">${getPlayerInfomation(deadPlayers[index]).name}</div>`;
    }
    out += "</div>";
    out += `</div>`;


    out += "</div>";
    return out;
}

function renderAdditionalOptionsBlock(state, isActive) {
    let out = "";
    if (isActive) {
        if (state.choiceMode == "card" && state.choices != null) {
            state.choices.forEach((choice, indx) => {
                out += `
                <button class="${GAME_TAG}-option-card" onclick='mapOfGames["${GAME_TAG}"].selectOfferedChoice("${indx}")'>${choice}</button>
                `;
            });
        } else if (state.choiceMode == "players") {
            state.players.forEach((choice, indx) => {
                out += `
                <button class="${GAME_TAG}-option-card" onclick='mapOfGames["${GAME_TAG}"].pickPlayer("${choice}")'>${getPlayerInfomation(choice).name}</button>
                `;
            });
        } else {
            // display += `
            //     <button onclick='mapOfGames["${GAME_TAG}"].takeTop()'>top</button>
            //     <button onclick='mapOfGames["${GAME_TAG}"].takeExit()'>exit</button>
            // `;
        }
    }
    return out;
}

function renderExitCardDeck(isActive) {
    let out = "";
    if (isActive) {
        out += `<div class="${GAME_TAG}-top-card-active ${GAME_TAG}-card" onclick='mapOfGames["${GAME_TAG}"].takeExit()'>`
    } else {
        out += `<div class="${GAME_TAG}-top-card ${GAME_TAG}-card">`
    }
    out += `
            Exit Card
        `
    out += `</div>`
    return out;
}

function renderCaveDeckTopCard(state, isActive) {
    let out = "";
    if (isActive) {
        out += `<div class="${GAME_TAG}-top-card-active ${GAME_TAG}-card" onclick='mapOfGames["${GAME_TAG}"].takeTop()'>`
    } else {
        out += `<div class="${GAME_TAG}-top-card ${GAME_TAG}-card">`
    }
    switch (state.topCaveCard.tag) {
        case "one":
            out += `
                <img src="/${GAME_TAG}/media/gem.png" class="${GAME_TAG}-gem">
            `
            break;
        case "one-out":
            out += `
                <img src="/${GAME_TAG}/media/gem.png" class="${GAME_TAG}-gem">
                <img src="/${GAME_TAG}/media/arrow.png" class="${GAME_TAG}-arrow-out">
            `
            break;
        case "closer":
            out += `
                <img src="/${GAME_TAG}/media/gem.png" class="${GAME_TAG}-gem">
                <img src="/${GAME_TAG}/media/gem.png" class="${GAME_TAG}-gem">
                <img src="/${GAME_TAG}/media/arrow.png" class="${GAME_TAG}-arrow-closer">
            `
            break;
        default:
            out += `
                ${state.topCaveCard.name}
            `
            break;
    }
    out += `</div>`
    return out;
}

/**
 * use functions like this that return HTML blocks
 * to render specific blocks that might render multiple times...
 */
function displayScore(state) {
    return `<div>SCORE</div`;
}

/**
 * Make sure to consider what a spectator can see...
 * DO NOT DELETE THIS FUNCTION...
 * INSTEAD make changes to it, you should always consider that the game can have spectators...
 */
function renderSpectatorState(state) {
    getGameSpace().innerHTML = `
    <div class="simple-row-container standard-gap">
        SSSHhhhh spectator!
    </div>
`;
}

/**
 * Use this function to render (draw) any END GAME state that your game might have...
 */
function renderEndGameState(state) {
    /**
     * Render and draw any specific end game state.
     * IMPORTANT: the state object should dictate what
     * and how is being drawn, do NOT let your UI hold it's own state
     */
    console.log(state);
    getGameSpace().innerHTML = ``;
}

// function displayChoiceWindow(choices) {
//     console.log(choices);

//     let popup = document.createElement("div");
//     popup.className = "my-mine-choice-popup";
//     let id = Id(); //Id function from utils
//     popup.id = id;
//     let out = "";
//     choices.forEach((choice, indx) => {
//         out += `
//             <button onclick='mapOfGames["${GAME_TAG}"].selectOfferedChoice("${indx}", "${id}")'>${choice}</button>
//         `
//     });
//     popup.innerHTML = `<div class="my-mine-choice-popup-inner">${out}</div>`;
//     getGameSpace().appendChild(popup);
// }

socket.on(`${GAME_TAG}-choice-exit-card`, (choices) => {
    console.log("CHOICE COMMING");
    displayChoiceWindow(choices)
        //TODO displya choice window
})

/**
 * BELOW -> 3x Socket Functions
 * DO NOT DELETE!
 * You can make changes to the first two if you want
 * BUT they are already set up correctly and basically
 * listern for server game state updates and draw respectively.
 * 
 * The 3rd one... -end
 * You can do some end game logic in if you like to display a 
 * chat message to the chat box about who won...
 */
socket.on(`${GAME_TAG}-start`, (gameState) => {
    if (isCurrentPlayerInThisGame(gameState.players)) {
        renderGameState(gameState)
    } else {
        renderSpectatorState(gameState);
    }
})

socket.on(`${GAME_TAG}-update`, (gameState) => {
    if (isCurrentPlayerInThisGame(gameState.players)) {
        renderGameState(gameState)
    } else {
        renderSpectatorState(gameState);
    }
})

socket.on(`${GAME_TAG}-end`, (gameState) => {
    /**
     * TODO:
     * Any end game logic
     * maybe decide a winner's name
     */
    let winnerName = "";
    let currentHighScore = 0;
    for (const [key, value] of Object.entries(gameState.score)) {
        if (value > currentHighScore) {
            currentHighScore = value;
            winnerName = getPlayerInfomation(key).name;
        }
    }
    /**
     * These functions below are important to hand control back over to the engine
     * use true in the 3rd postion here to tell the system this is a game
     * that is writing the message and not a user.
     */
    displayMessage(`${winnerName} won the game!`, GAME_TAG, true);
    /**
     * DO NOT DELETE THESE TWO FUNCTIONS
     * They are super important to pass control back to the hub
     * and officially end the game!
     */
    renderEndGameState(gameState);
    resetAndCleanup();
})