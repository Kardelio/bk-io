// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "_____";
console.log(`GAME-SERVER: ${GAME_TAG} -> Loaded`);
/**
 * GAME_TAG - IMPORTANT your unique game tag, use everywhere...
 * getGameData(tag) - Passed in lookup function that gives you data object from games.json...
 * allGameStateHolder - IMPORTANT, game state holder map of room to game state...
 */

/**
 * IMPORTANT
 * DO NOT DELETE THIS VARIABLE
 * This allGameStateHolder is super important.
 * Remember that you are writing server code now and might be juggling more than one 
 * instance of your game.
 * So use this below map to store every room instance of your game!
 */
let allGameStateHolder = {};
const ROCK = "rock";
const PAPER = "paper";
const SCISSORS = "scissors";
let rpsWinningCombo = {
    "rock": "scissors",
    "paper": "rock",
    "scissors": "paper"
};

module.exports = {
    setup: setup,
    startGame: startGame
}

function setup(app, io, getGameData, getPlayerInfoFromId) {
    io.on("connection", (socket) => {
        socket.on(`${GAME_TAG}-example`, (socketId, roomCode, rps) => {
            allGameStateHolder[roomCode].private[`${socketId}`] = rps;
            allGameStateHolder[roomCode].public.players_selected_choice.push(socketId);
            if (allGameStateHolder[roomCode].public.players_selected_choice.length == 2) {
                let p1 = allGameStateHolder[roomCode].public["players"][0];
                let p2 = allGameStateHolder[roomCode].public["players"][1];
                let p1Choice = allGameStateHolder[roomCode].private[p1];
                let p2Choice = allGameStateHolder[roomCode].private[p2];
                if (p1Choice == p2Choice) {
                    allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - DRAW`)
                } else {
                    if (rpsWinningCombo[p1Choice] == p2Choice) {
                        allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - ${getPlayerInfoFromId(p1).name} gets a point`)
                        increasePlayerScore(p1, roomCode, 1);
                    } else {
                        allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - ${getPlayerInfoFromId(p2).name} gets a point`)
                        increasePlayerScore(p2, roomCode, 1);
                    }
                }

                if (isGameOver(roomCode, getGameData(GAME_TAG, roomCode))) {
                    endGame(io, roomCode);
                } else {
                    allGameStateHolder[roomCode].public.players_selected_choice = [];
                    updateGame(io, roomCode);
                }
            } else {
                updateGame(io, roomCode);
            }
        })
    });
}

function isGameOver(roomCode, gameObj) {
    let allScores = 0;
    for (const [key, value] of Object.entries(allGameStateHolder[roomCode].public["score"])) {
        allScores += value;
    }
    if (allScores >= gameObj.best_of) {
        return true;
    }
    return false;
}

function startGame(io, roomCode, players) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Started...`);
    console.log(`===> Players in game: ${players}`);
    /**
     * TODO:
     * Any start of game logic
     * example picking first player
     */
    allGameStateHolder[roomCode] = {
        "public": {},
        "private": {}
    }
    allGameStateHolder[roomCode]["public"] = createStartGameState(0, players);
    console.log(`===> OBJECT: ${JSON.stringify(allGameStateHolder[roomCode])}`);
    io.to(roomCode).emit(`${GAME_TAG}-start`, allGameStateHolder[roomCode]["public"]);
}

function endGame(io, roomCode) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Ending...`);
    /**
     * TODO:
     * Any end of game logic
     * 
     * IMPORTANT
     * DO NOT delete the lines below...
     */
    io.to(roomCode).emit(`${GAME_TAG}-end`, allGameStateHolder[roomCode]["public"]);
    delete allGameStateHolder[roomCode];
}

function updateGame(io, roomCode) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Updating...`);
    /**
     * TODO:
     * Any update logic before sending to client
     * Most likely this logic is done in the socket events above...
     */
    console.log(allGameStateHolder[roomCode].private);
    io.to(roomCode).emit(`${GAME_TAG}-update`, allGameStateHolder[roomCode]["public"]);
}

/**
 * Utility functions below...
 */

/**
 * use a function like this to create a consitent represention 
 * of the game state object that will constantly be sent to 
 * ALL clients
 */
function createStartGameState(currentPlayerIndex, players) {
    return {
        "players_selected_choice": [],
        "players": players,
        "log": [],
        "score": {}
    }
}

function increasePlayerScore(playerId, roomCode, amount) {
    if (allGameStateHolder[roomCode]["public"]["score"][playerId] == undefined) {
        allGameStateHolder[roomCode]["public"]["score"][playerId] = amount;
    } else {
        allGameStateHolder[roomCode]["public"]["score"][playerId] = allGameStateHolder[roomCode]["public"]["score"][playerId] + amount;
    }
}