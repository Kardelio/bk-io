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
    //KEEP IN MIND SPECTATORS CAN SEE
    getGameSpace().innerHTML = `
        <div class="simple-row-container">
            <img src="${GAME_TAG}/media/rock.png" style="width: 100px; height: 100px;">
            <img src="${GAME_TAG}/media/paper.png" style="width: 100px; height: 100px;">
            <img src="${GAME_TAG}/media/scissors.png" style="width: 100px; height: 100px;">
        </div>
    `;
}

/**
 * Make sure to EXPORT any functions that your DOM (UI) calls
 */
export function takeTop() {
    console.log("Taking top");
    socket.emit(`${GAME_TAG}-take-top-cave-card`, currentSocketId, currentRoomCode);
}

export function exampleFunctionToBeUsedByDOM(which) {
    yourCurrentSelection = which;
    /**
     * IMPORTANT:
     * This is an example server socket emission!
     * Tell the server information using lines like this...
     * You should not control or deal with game logic in this file.
     * THE SERVER should deal with and hold game logic
     * you should only send user input to the server, this is an example of that...
     */
    socket.emit(`${GAME_TAG}-example`, currentSocketId, currentRoomCode, which);
}

/**
 * Use this function to render the game state.
 * When the server sends you a GAME STATE object (you can define this in server.js)
 * You should render (draw) the relevant info to the screen for the player (players) to see 
 * and interact with...
 */
function renderGameState(state) {
    /**
     * Render and draw the current game state.
     * IMPORTANT: the state object should dictate what
     * and how is being drawn, do NOT let your UI hold it's own state
     */
    console.log(state);
    // getGameSpace().innerHTML = `
    //     <div class="${GAME_TAG}-game-container">
    //         Game UI Here...
    //     </div>
    //     ${displayScore(state)}
    // `;
    if (state.players[state.currentPlayerIndex] == currentSocketId) {
        getGameSpace().innerHTML = `
        <button onclick='mapOfGames["${GAME_TAG}"].takeTop()'>top</button>
    `;
    } else {
        document.getElementById(`${GAME_TAG}-coin-buttons`).innerHTML = ``;
    }
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