// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "my-mine";
console.log(`GAME-SERVER: ${GAME_TAG} -> Loaded`);
const Game = require('./game.js');
const Card = require('./card.js');
const Utils = require('../../server/js/utils.js');
/**
 * GAME_TAG - IMPORTANT your unique game tag, use everywhere...
 * getGameData(tag) - Passed in lookup function that gives you data object from games.json...
 * allGameStateHolder - IMPORTANT, game state holder map of room to game state...
 */
// var a = new Game();
// var card1 = new deck.CaveCard(2, -1, "abc", "def");
// let gameInstance = new Game.GameMap(7);
// gameInstance.addPlayerToGame("hhh");
// gameInstance.putPlayerInCell("abc", 1);
// gameInstance.putPlayerInCell("tim", 1);
// gameInstance.putPlayerInCell("tom", 5);
// gameInstance.removePlayerFromCell("abc", 1);
// gameInstance.putPlayerInCell("sid", 0);
// gameInstance.movePlayerByAmount("tim", 1);
// gameInstance.movePlayerByAmount("tim", 2);
// gameInstance.movePlayerByAmount("tim", 2);
// gameInstance.movePlayerByAmount("tim", -4);
// gameInstance.movePlayerByAmount("tim", -2);
// gameInstance.movePlayerByAmount("tim", -1);
// gameInstance.moveDragon();
// gameInstance.moveDragon();
// // b.movePlayerByAmount("tom", 1);
// // b.movePlayerByAmount("sid", 2);
// // b.movePlayerByAmount("sid", 2);
// // b.movePlayerByAmount("sid", 1);
// // b.movePlayerByAmount("sid", 1);
// gameInstance.movePlayerWithCaveCard("sid", new Card.Card("Closer", "d", () => {
//     console.log("ACTIVATED CARD");
//     gameInstance.collectGems("sid", 2);
//     gameInstance.movePlayerByAmount("sid", 1);
// }))
// gameInstance.movePlayerWithCaveCard("sid", new Card.Card("Closer", "d", () => {
//     console.log("ACTIVATED CARD");
//     gameInstance.collectGems("sid", 2);
//     gameInstance.movePlayerByAmount("sid", 1);
// }))

// let caveCardsDeck = [];
// let discard = [];

let allGameStateHolder = {};

const DRAGON_CARD_TAG = "dragon";

const twoGemsOneDangerNumber = 7;
const oneGemNumber = 7;
const oneGemOneSafeNumber = 7;
const dragonCardNumber = 3;
const totalCaveCards = dragonCardNumber + twoGemsOneDangerNumber + oneGemNumber + oneGemOneSafeNumber;

function createNewGamesInstance(roomCode, players) {
    allGameStateHolder[roomCode]["private"]["gameMap"] = new Game.GameMap(7, players);
    allGameStateHolder[roomCode]["private"]["caveCards"] = generateFreshCaveDeck(roomCode);
    allGameStateHolder[roomCode]["private"]["caveCardsDiscard"] = Array();
    allGameStateHolder[roomCode]["private"]["exitCards"] = generateFreshExitDeck(roomCode);
    allGameStateHolder[roomCode]["private"]["exitCardsDiscard"] = Array();
    checkTopCard(roomCode, null);
}

function playerPullsCaveCard(roomCode, playerId) {
    let topCard = allGameStateHolder[roomCode]["private"]["caveCards"].shift();
    allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerWithCaveCard(playerId, topCard)
    checkTopCard(roomCode, playerId);
}

function playerPullsExitCard(roomCode, playerId) {

}

function checkTopCard(roomCode, playerId) {
    if (allGameStateHolder[roomCode]["private"]["caveCards"].length > 0) {
        let topCardNow = allGameStateHolder[roomCode]["private"]["caveCards"][0];
        console.log(JSON.stringify(topCardNow));
        if (topCardNow.tag == DRAGON_CARD_TAG) {
            console.log("DRAGON IS NEXT CARDDDD");
            if (playerId == null) {
                shuffleDeck(roomCode)
                checkTopCard(roomCode, null);
            } else {
                playerPullsCaveCard(roomCode, playerId);
            }
        } else {

        }
    }
}

function shuffleDeck(roomCode) {
    allGameStateHolder[roomCode]["private"]["caveCards"] = Utils.shuffleArray(allGameStateHolder[roomCode]["private"]["caveCards"]);
}

function generateFreshExitDeck(roomCode) {
    /*
    1x all OR two
    1x switch OR two
    1x switch OR all
    1x all OR one
    1x one OR 3 gold
    3x one
    2x two OR one
    2x one or switch
    2x all
    2x two
    */
}

/*
9x dragons
15x 2 and danger
5x one and safe
29x one

2-6
*/

function generateFreshCaveDeck(roomCode) {
    let countForId = 0;
    let caveCardsDeck = [];
    for (let i = 0; i < dragonCardNumber; i++) {
        caveCardsDeck.push(
            new Card.Card(
                "Dragon",
                DRAGON_CARD_TAG,
                countForId,
                () => {
                    allGameStateHolder[roomCode]["private"]["gameMap"].moveDragon();
                }
            )
        )
        countForId++;
    }
    for (let i = 0; i < twoGemsOneDangerNumber; i++) {
        caveCardsDeck.push(
            new Card.Card(
                "Closer",
                "closer",
                countForId,
                (player) => {
                    allGameStateHolder[roomCode]["private"]["gameMap"].collectGems(player, 2);
                    allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(player, 1);
                }
            )
        )
        countForId++;
    }
    for (let i = 0; i < oneGemNumber; i++) {
        caveCardsDeck.push(
            new Card.Card(
                "One Gem",
                "one",
                countForId,
                (player) => {
                    allGameStateHolder[roomCode]["private"]["gameMap"].collectGems(player, 1);
                }
            )
        )
        countForId++;
    }
    for (let i = 0; i < oneGemOneSafeNumber; i++) {
        caveCardsDeck.push(
            new Card.Card(
                "One and Out",
                "one-out",
                countForId,
                (player) => {
                    allGameStateHolder[roomCode]["private"]["gameMap"].collectGems(player, 1);
                    allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(player, -1);
                }
            )
        )
        countForId++;
    }
    caveCardsDeck = Utils.shuffleArray(caveCardsDeck);
    // console.log(caveCardsDeck);
    return caveCardsDeck;
}

module.exports = {
    setup: setup,
    startGame: startGame
}

function setup(app, io, getGameData, getPlayerInfoFromId) {
    io.on("connection", (socket) => {

        socket.on(`${GAME_TAG}-take-top-cave-card`, (socketId, roomCode) => {
            playerPullsCaveCard(roomCode, socketId);
        })

        socket.on(`${GAME_TAG}-take-top-exit-card`, (socketId, roomCode) => {
            playerPullsCaveCard(roomCode, socketId);
        })

        socket.on(`${GAME_TAG}-example`, (socketId, roomCode, rps) => {
            // allGameStateHolder[roomCode].private[`${socketId}`] = rps;
            // allGameStateHolder[roomCode].public.players_selected_choice.push(socketId);
            // if (allGameStateHolder[roomCode].public.players_selected_choice.length == 2) {
            //     let p1 = allGameStateHolder[roomCode].public["players"][0];
            //     let p2 = allGameStateHolder[roomCode].public["players"][1];
            //     let p1Choice = allGameStateHolder[roomCode].private[p1];
            //     let p2Choice = allGameStateHolder[roomCode].private[p2];
            //     if (p1Choice == p2Choice) {
            //         allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - DRAW`)
            //     } else {
            //         if (rpsWinningCombo[p1Choice] == p2Choice) {
            //             allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - ${getPlayerInfoFromId(p1).name} gets a point`)
            //             increasePlayerScore(p1, roomCode, 1);
            //         } else {
            //             allGameStateHolder[roomCode].public["log"].push(`${getPlayerInfoFromId(p1).name} picked ${p1Choice}, ${getPlayerInfoFromId(p2).name} picked ${p2Choice} - ${getPlayerInfoFromId(p2).name} gets a point`)
            //             increasePlayerScore(p2, roomCode, 1);
            //         }
            //     }

            //     if (isGameOver(roomCode, getGameData(GAME_TAG, roomCode))) {
            //         endGame(io, roomCode);
            //     } else {
            //         allGameStateHolder[roomCode].public.players_selected_choice = [];
            //         updateGame(io, roomCode);
            //     }
            // } else {
            //     updateGame(io, roomCode);
            // }
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
    createNewGamesInstance(roomCode, players);

    allGameStateHolder[roomCode]["public"] = createStartGameState(Utils.getRandomNumberInclusive(0, players.length - 1), players);
    // allGameStateHolder[roomCode] = createStartGameState(getRandomNumberInclusive(0, players.length - 1), players);
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
        "log": [],
        "currentPlayerIndex": currentPlayerIndex,
        "players": players,
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