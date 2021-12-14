// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "coin-flip";
console.log(`GAME-SERVER: ${GAME_TAG} -> Loaded`);
/**
 * GAME_TAG - IMPORTANT your unique game tag, use everywhere...
 * getGameData(tag) - Passed in lookup function that gives you data object from games.json...
 * allGameStateHolder - IMPORTANT, game state holder map of room to game state...
 */
let allGameStateHolder = {};

module.exports = {
    setup: setup,
    startGame: startGame
}

function setup(app, io, getGameData, getPlayerInfoFromId) {
    io.on("connection", (socket) => {
        socket.on(`${GAME_TAG}-flip`, (socketId, roomCode, headsOrTails) => {
            let a = getRandomNumberInclusive(1, 2);
            allGameStateHolder[roomCode]["coinResult"] = a == 1 ? "heads" : "tails";
            if (allGameStateHolder[roomCode]["coinResult"] == headsOrTails) {
                allGameStateHolder[roomCode]["match"] = true;
                increasePlayerScore(socketId, roomCode, 1);
            } else {
                allGameStateHolder[roomCode]["match"] = false;
                increasePlayerScore(socketId, roomCode, 0);
            }
            let nextPlayerIndex = getNextPlayerId(roomCode);
            allGameStateHolder[roomCode].currentPlayerIndex = nextPlayerIndex;
            if (isGameOver(roomCode, getGameData(GAME_TAG, roomCode))) {
                endGame(io, roomCode)
            } else {
                updateGame(io, roomCode)
            }
        })
    });
}

function isGameOver(roomCode, gameObj) {
    for (const [key, value] of Object.entries(allGameStateHolder[roomCode]["score"])) {
        if (value >= gameObj.score.value) {
            return true;
        }
    }
    return false;
}

function startGame(io, roomCode, players) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Started...`);
    console.log(`===> Players in game: ${players}`);

    allGameStateHolder[roomCode] = createStartGameState(getRandomNumberInclusive(0, players.length - 1), players);
    io.to(roomCode).emit(`${GAME_TAG}-start`, allGameStateHolder[roomCode]);
}

function endGame(io, roomCode) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Ending...`);
    io.to(roomCode).emit(`${GAME_TAG}-end`, allGameStateHolder[roomCode]);
    delete allGameStateHolder[roomCode];
}

function updateGame(io, roomCode) {
    console.log(`===> (${roomCode}) Game of (${GAME_TAG}) Updating...`);
    io.to(roomCode).emit(`${GAME_TAG}-update`, allGameStateHolder[roomCode]);
}

/**
 * Utility functions below...
 */
function increasePlayerScore(playerId, roomCode, amount) {
    if (allGameStateHolder[roomCode]["score"][playerId] == undefined) {
        allGameStateHolder[roomCode]["score"][playerId] = amount;
    } else {
        allGameStateHolder[roomCode]["score"][playerId] = allGameStateHolder[roomCode]["score"][playerId] + amount;
    }
}

function getNextPlayerId(roomCode) {
    let newIndex = allGameStateHolder[roomCode].currentPlayerIndex;
    newIndex = newIndex + 1;
    if (allGameStateHolder[roomCode].players[newIndex] != undefined) {
        return newIndex;
    } else {
        return 0;
    }
}

function createStartGameState(currentPlayerIndex, players) {
    return {
        "coinResult": "",
        "match": false,
        "currentPlayerIndex": currentPlayerIndex,
        "players": players,
        "score": {}
    }
}

function getRandomNumberInclusive(from, to) {
    return Math.floor(Math.random() * to) + from;
}