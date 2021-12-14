// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "coin-flip";
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

export default function() {
    setup();
}

function setup() {
    console.log(`GAME-CLIENT: ${GAME_TAG} -> Setup`);
    // socket.emit(`${GAME_TAG}-setup`, currentRoomCode);

    getGameSpace().innerHTML = ``;

    // temp = obj;
    // console.log(temp);
    // start();
}

export function flipit(guess) {
    socket.emit(`${GAME_TAG}-flip`, currentSocketId, currentRoomCode, guess);
}

function renderGameState(state) {
    getGameSpace().innerHTML = `
        <div id='${GAME_TAG}-heads'><img src="${GAME_TAG}/media/coin-heads.png" style="width: 100px; height: 100px;"></div>
        <div id='${GAME_TAG}-tails'><img src="${GAME_TAG}/media/coin-tails.png" style="width: 100px; height: 100px;"></div>
        <div id='${GAME_TAG}-coin-buttons' class='${GAME_TAG}-buttons-div'></div>
        <div id='${GAME_TAG}-score'></div>
    `;

    if (state.players[state.currentPlayerIndex] == currentSocketId) {
        document.getElementById(`${GAME_TAG}-coin-buttons`).innerHTML = `
        <button onclick='mapOfGames["${GAME_TAG}"].flipit("heads")'>heads</button>
        <button onclick='mapOfGames["${GAME_TAG}"].flipit("tails")'>tails</button>
    `;
    } else {
        document.getElementById(`${GAME_TAG}-coin-buttons`).innerHTML = ``;
    }

    let scoreOut = "";
    for (const [key, value] of Object.entries(state.score)) {
        console.log(`${key}: ${value}`);
        scoreOut += `
            <div>${getPlayerInfomation(key).name} -> ${value}</div>
        `;
    }
    document.getElementById(`${GAME_TAG}-score`).innerHTML = scoreOut;

    if (state.coinResult == "heads") {
        document.getElementById(`${GAME_TAG}-heads`).style.display = "block";
        document.getElementById(`${GAME_TAG}-tails`).style.display = "none";
    } else if (state.coinResult == "tails") {
        document.getElementById(`${GAME_TAG}-heads`).style.display = "none";
        document.getElementById(`${GAME_TAG}-tails`).style.display = "block";
    } else {
        document.getElementById(`${GAME_TAG}-heads`).style.display = "none";
        document.getElementById(`${GAME_TAG}-tails`).style.display = "none";
    }

    // document.getElementById(`${GAME_TAG}-coin`).innerHTML = JSON.stringify(state);
}

function renderEndGameState(state) {
    getGameSpace().innerHTML = `
        Done
    `;
}

socket.on(`${GAME_TAG}-start`, (gameState) => {
    renderGameState(gameState)
})

socket.on(`${GAME_TAG}-update`, (gameState) => {
    renderGameState(gameState)
})

socket.on(`${GAME_TAG}-end`, (gameState) => {
    let winnerName = "";
    let currentHighScore = 0;
    for (const [key, value] of Object.entries(gameState.score)) {
        if (value > currentHighScore) {
            currentHighScore = value;
            winnerName = getPlayerInfomation(key).name;
        }
    }
    displayMessage(`${winnerName} won the game with ${currentHighScore} points!`, GAME_TAG, true);
    renderEndGameState(gameState);
    resetAndCleanup();
})