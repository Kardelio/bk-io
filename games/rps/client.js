// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "rps";
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

// let temp = null;
let yourCurrentSelection = null;

export default function() {
    setup();
}

function setup() {
    console.log(`GAME-CLIENT: ${GAME_TAG} -> Setup`);
    //KEEP IN MIND SPECTATORS CAN SEE
    getGameSpace().innerHTML = `
        <div class="simple-row-container">
            <img src="/${GAME_TAG}/media/rock.png" style="width: 100px; height: 100px;">
            <img src="/${GAME_TAG}/media/paper.png" style="width: 100px; height: 100px;">
            <img src="/${GAME_TAG}/media/scissors.png" style="width: 100px; height: 100px;">
        </div>
    `;
}

/**
 * Make sure to EXPORT any functions that your DOM (UI) calls
 */
export function selectRPS(which) {
    console.log("RPS: SELECTION: " + which);
    yourCurrentSelection = which;
    /**
     * IMPORTANT:
     * This is an example server call.
     * You should not control or deal with game logic in this file.
     * THE SERVER should deal with and hold game logic
     * you should only send user input to the server, this is an example of that...
     */
    socket.emit(`${GAME_TAG}-selection`, currentSocketId, currentRoomCode, which);
}

function renderGameState(state) {
    /**
     * Render and draw the current game state.
     * IMPORTANT: the state object should dictate what
     * and how is being drawn, do NOT let your UI hold it's own state
     */
    console.log(state);
    if (state.players_selected_choice.length == 2) {
        getGameSpace().innerHTML = `
        <div class="simple-row-container standard-gap">
        i  DONE
        </div>
    `;
    } else if (state.players_selected_choice.includes(currentSocketId)) {
        getGameSpace().innerHTML = `
        <div class="simple-row-container standard-gap">
            you selected ${yourCurrentSelection}
            </br>
            Waiting for other player...
        </div>
    `;
    } else {
        getGameSpace().innerHTML = `
        <div class="simple-row-container standard-gap">
            <button onclick='mapOfGames["${GAME_TAG}"].selectRPS("rock")'>
                <img src="/${GAME_TAG}/media/rock.png" style="width: 100px; height: 100px;">
            </button>
            <button onclick='mapOfGames["${GAME_TAG}"].selectRPS("paper")'>
                <img src="/${GAME_TAG}/media/paper.png" style="width: 100px; height: 100px;">
            </button>
            <button onclick='mapOfGames["${GAME_TAG}"].selectRPS("scissors")'>
                <img src="/${GAME_TAG}/media/scissors.png" style="width: 100px; height: 100px;">
            </button>
        </div>
        ${displayScore(state)}
        ${displayLog(state)}
    `;
    }
}

function displayScore(state) {
    let out = `<div class="${GAME_TAG}-score-container">`;
    for (const [key, value] of Object.entries(state.score)) {
        out += `
            <div class="${GAME_TAG}-score-line">
                ${getPlayerInfomation(key).name} -> ${value}
            </div>
        `;
    }
    out += `</div>`;
    return out;
}

function displayLog(state) {
    let out = `<div class="${GAME_TAG}-log-container">`;
    state.log.forEach(element => {
        out += `
        <div class="${GAME_TAG}-log-line">
            ${element}
        </div>
        `;
    });
    out += `</div>`;
    return out;
}

function renderSpectatorState(state) {
    getGameSpace().innerHTML = `
    <div class="simple-row-container standard-gap">
        SSSHhhhh spectator!
    </div>
`;
}

function renderEndGameState(state) {
    /**
     * Render and draw any specific end game state.
     * IMPORTANT: the state object should dictate what
     * and how is being drawn, do NOT let your UI hold it's own state
     */
    console.log(state);
    getGameSpace().innerHTML = ``;
}

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
     */
    displayMessage(`${winnerName} won the game!`, GAME_TAG, true);
    renderEndGameState(gameState);
    resetAndCleanup();
})