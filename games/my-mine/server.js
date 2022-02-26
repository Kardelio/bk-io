// IMPORTANT: fill in the below with the same string as your tag in the games.json
const GAME_TAG = "my-mine";
console.log(`GAME-SERVER: ${GAME_TAG} -> Loaded`);

const Game = require('./game.js');
const Card = require('./card.js');
const CardTags = require('./cardTags.js');
const ExitDeckGen = require('./exitCardDeckGenerator.js');
const CaveDeckGen = require('./caveCardDeckGenerator.js');
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

let getPlayerInfoFromIdFunc = null;
let allGameStateHolder = {};

function createNewGamesInstance(roomCode, players) {
    allGameStateHolder[roomCode]["private"]["gameMap"] = new Game.GameMap(7, players);
    restockCaveCardsDeck(roomCode);
    restockExitCardsDeck(roomCode);
    checkTopCard(roomCode, null);

    //DELETE ME BELOW
    // playerPullsExitCard(roomCode, null);
    // playerPullsExitCard(roomCode, null);
    // playerPullsExitCard(roomCode, null);
    // playerPullsExitCard(roomCode, null);
    // console.log(allGameStateHolder[roomCode]["private"]["gameMap"].findCellOfPlayer("a"));
    // allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount("a", 2);
    // console.log(allGameStateHolder[roomCode]["private"]["gameMap"].findCellOfPlayer("a"));
    // allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount("a", 2);
    // allGameStateHolder[roomCode]["private"]["gameMap"].switchTwoPlayersPositions("a", "b");
    // allGameStateHolder[roomCode]["private"]["gameMap"].switchTwoPlayersPositions("a", "b");

}
allGameStateHolder["ABCD"] = {
    "public": {},
    "private": {}
}
createNewGamesInstance("ABCD", ["a", "b", "c"]);

function addItemToLog(roomCode, message) {
    allGameStateHolder[roomCode].public["log"].push(message);
}

function restockCaveCardsDeck(roomCode) {
    allGameStateHolder[roomCode]["private"]["caveCards"] = generateFreshCaveDeck(roomCode);
    // allGameStateHolder[roomCode]["private"]["caveCardsDiscard"] = Array();
}

function restockExitCardsDeck(roomCode) {
    allGameStateHolder[roomCode]["private"]["exitCards"] = generateFreshExitDeck(roomCode);
    // allGameStateHolder[roomCode]["private"]["exitCardsDiscard"] = Array();
}

function playerPullsCaveCard(roomCode, playerId) {
    let topCard = allGameStateHolder[roomCode]["private"]["caveCards"].shift();
    console.log(topCard);
    allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerWithCaveCard(playerId, topCard)
    addItemToLog(roomCode, `<div class="${GAME_TAG}-log-player-name">${getPlayerInfoFromIdFunc(playerId).name}</div> picked up the card: ${topCard.name}`);
    checkTopCard(roomCode, playerId);
}

function playerPullsExitCard(roomCode, playerId) {
    if (allGameStateHolder[roomCode]["private"]["exitCards"].length > 0) {
        let topCard = allGameStateHolder[roomCode]["private"]["exitCards"].shift();
        // TODO pick option
        if (Object.entries(topCard.triggerOptions).length > 1) {
            console.log("MORE THAN ONE OOPTIOSN");
            console.log(topCard);
            return topCard;
        } else {
            //WORKS
            allGameStateHolder[roomCode]["private"]["gameMap"].triggerExitCard(playerId, topCard, 0)
            addItemToLog(roomCode, `<div class="${GAME_TAG}-log-player-name">${getPlayerInfoFromIdFunc(playerId).name}</div> picked up the EXIT card: ${topCard.name}`);
            return null;
        }
        // allGameStateHolder[roomCode]["private"]["gameMap"].triggerExitCard(playerId, topCard, 1)
        // addItemToLog(roomCode, `${getPlayerInfoFromIdFunc(playerId).name} picked up the EXIT card: ${topCard.name}`);
    } else {
        console.log("Restocking exit deck");
        restockExitCardsDeck(roomCode);
        return playerPullsExitCard(roomCode, playerId);
    }
}

function playerTriggerSpecificExitCardOption(roomCode, playerId, choices, option) {
    allGameStateHolder[roomCode]["private"]["gameMap"].triggerExitCard(playerId, choices, option)
}

function checkTopCard(roomCode, playerId) {
    if (allGameStateHolder[roomCode]["private"]["caveCards"].length > 0) {
        let topCardNow = allGameStateHolder[roomCode]["private"]["caveCards"][0];
        console.log(`NEXRT CARD VISIBLE: ${JSON.stringify(topCardNow)}`);
        if (topCardNow.tag == CardTags.DRAGON_CARD_TAG) {
            console.log("DRAGON IS NEXT CARDDDD");
            if (playerId == null) {
                shuffleDeck(roomCode, "caveCards")
                checkTopCard(roomCode, null);
            } else {
                playerPullsCaveCard(roomCode, playerId);
            }
        }
    } else {
        restockCaveCardsDeck(roomCode);
    }
}

function getTopVisibleCaveCard(roomCode) {
    return allGameStateHolder[roomCode]["private"]["caveCards"][0];
}

function shuffleDeck(roomCode, deckName) {
    allGameStateHolder[roomCode]["private"][deckName] = Utils.shuffleArray(allGameStateHolder[roomCode]["private"][deckName]);
}

function generateFreshExitDeck(roomCode) {
    return ExitDeckGen(allGameStateHolder, roomCode);
}

function generateFreshCaveDeck(roomCode) {
    return CaveDeckGen(allGameStateHolder, roomCode);
}

function updateGameStateObject(roomCode) {
    let thisGame = allGameStateHolder[roomCode]["private"]["gameMap"];
    allGameStateHolder[roomCode]["public"]["game"] = thisGame;
    allGameStateHolder[roomCode]["public"]["topCaveCard"] = getTopVisibleCaveCard(roomCode);
}

module.exports = {
    setup: setup,
    startGame: startGame
}

function setup(app, io, getGameData, getPlayerInfoFromId) {
    getPlayerInfoFromIdFunc = getPlayerInfoFromId;
    io.on("connection", (socket) => {

        socket.on(`${GAME_TAG}-take-top-cave-card`, (socketId, roomCode) => {
            playerPullsCaveCard(roomCode, socketId);
            let nextPlayerIndex = getNextPlayerId(roomCode, getGameData(GAME_TAG, roomCode));
            allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
            allGameStateHolder[roomCode]["public"].choiceMode = null;
            allGameStateHolder[roomCode]["public"].choices = null;
            allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
            updateGame(io, roomCode);
        })

        socket.on(`${GAME_TAG}-take-selected-choice-id`, (socketId, roomCode, choiceId) => {
            console.log(`choice was elected :${choiceId}`);
            console.log(allGameStateHolder[roomCode]["private"].currentPlayerChoices);
            let specificChoice = allGameStateHolder[roomCode]["private"].currentPlayerChoices.triggerOptions[choiceId];
            if (specificChoice.id == "switch") {
                allGameStateHolder[roomCode]["public"].choices = null;
                allGameStateHolder[roomCode]["public"].choiceMode = "players";
                allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
                updateGame(io, roomCode);
            } else {
                allGameStateHolder[roomCode]["private"]["gameMap"].triggerExitCard(socketId, allGameStateHolder[roomCode]["private"].currentPlayerChoices, choiceId)
                addItemToLog(roomCode, `<div class="${GAME_TAG}-log-player-name">${getPlayerInfoFromIdFunc(socketId).name}</div> picked up the EXIT card: ${allGameStateHolder[roomCode]["private"].currentPlayerChoices.name}`);
                addItemToLog(roomCode, `<div class="${GAME_TAG}-log-player-name">${getPlayerInfoFromIdFunc(socketId).name}</div> chose to perform ${allGameStateHolder[roomCode]["private"].currentPlayerChoices.triggerOptions[choiceId].description}`);
                let nextPlayerIndex = getNextPlayerId(roomCode, getGameData(GAME_TAG, roomCode));
                allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
                allGameStateHolder[roomCode]["public"].choices = null;
                allGameStateHolder[roomCode]["public"].choiceMode = null;
                allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
                updateGame(io, roomCode);
            }
        })

        socket.on(`${GAME_TAG}-player-selected-for-switch`, (socketId, roomCode, playerSelectedId) => {
            console.log(`selcted :${playerSelectedId}`);
            allGameStateHolder[roomCode]["private"]["gameMap"].switchTwoPlayersPositions(socketId, playerSelectedId);
            addItemToLog(roomCode, `<div class="${GAME_TAG}-log-player-name">${getPlayerInfoFromIdFunc(socketId).name}</div> picked up the EXIT card AND switched with ${getPlayerInfoFromIdFunc(playerSelectedId).name}`);
            let nextPlayerIndex = getNextPlayerId(roomCode, getGameData(GAME_TAG, roomCode));
            allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
            allGameStateHolder[roomCode]["public"].choices = null;
            allGameStateHolder[roomCode]["public"].choiceMode = null;
            allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
            updateGame(io, roomCode);
        })

        socket.on(`${GAME_TAG}-take-top-exit-card`, (socketId, roomCode) => {
            let currentTopCard = playerPullsExitCard(roomCode, socketId);
            console.log(currentTopCard);
            if (currentTopCard == null) {
                //no choice needed to make
                let nextPlayerIndex = getNextPlayerId(roomCode, getGameData(GAME_TAG, roomCode));
                allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
                allGameStateHolder[roomCode]["public"].choiceMode = null;
                allGameStateHolder[roomCode]["public"].choices = null;
                allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
                updateGame(io, roomCode);
            } else {
                let cleanChoices = currentTopCard.triggerOptions.map(e => e.description)
                allGameStateHolder[roomCode]["public"].choiceMode = "card";
                allGameStateHolder[roomCode]["public"].choices = cleanChoices;
                allGameStateHolder[roomCode]["private"].currentPlayerChoices = currentTopCard;
                updateGame(io, roomCode);
            }
        })
    });
}

// function offerPlayerChoice(io, roomCode, playerId, choices) {
//     let cleanChoices = choices.map(e => e.description)
//     io.to(playerId).emit(`${GAME_TAG}-choice-exit-card`, cleanChoices);
// }

function triggerEndOfRound(roomCode, maxRounds) {
    //give nuggets to top 3
    //reset cards
    //reset dragon
    //rest positions

    if (allGameStateHolder[roomCode]["private"]["gameMap"].roundNumber >= maxRounds) {
        //Calcucate final scores 
        // including gold nuggs
        // pass off controll
        console.log("END GAME");
        addItemToLog(roomCode, `GAME OVER`);
    } else {
        allGameStateHolder[roomCode]["private"]["gameMap"].increaseRoundNumber();
        allGameStateHolder[roomCode]["private"]["gameMap"].setupForNewRound(maxRounds);
        restockExitCardsDeck(roomCode);
        restockCaveCardsDeck(roomCode);
        checkTopCard(roomCode, null);
        // setNextPlayerStartOfRound(roomCode, allGameStateHolder[roomCode]["private"]["gameMap"].lastRoundWinnerId);

        // for (const [key, value] of Object.entries(allGameStateHolder[roomCode]["private"]["gameMap"].nuggets)) {
        //     addItemToLog(roomCode, `${getPlayerInfoFromIdFunc(key).name} has ${value} nuggets`);
        // }
        /**
         * He who won that last round starts
         */

        addItemToLog(roomCode, `--- Round ${allGameStateHolder[roomCode]["private"]["gameMap"].roundNumber} Starting ---`);
        // allGameStateHolder[roomCode]["public"].choiceMode = null;
        // allGameStateHolder[roomCode]["public"].choices = null;
        // allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
        // updateGame(io, roomCode);

        // allGameStateHolder[roomCode]["public"] = createStartGameState(Utils.getRandomNumberInclusive(0, players.length - 1), players);
        // // allGameStateHolder[roomCode] = createStartGameState(getRandomNumberInclusive(0, players.length - 1), players);
        // updateGameStateObject(roomCode);
        // console.log(`===> OBJECT: ${JSON.stringify(allGameStateHolder[roomCode])}`);
        // io.to(roomCode).emit(`${GAME_TAG}-start`, allGameStateHolder[roomCode]["public"]);
    }

}

function getNextPlayerId(roomCode, gameDataObj) {
    let safe = allGameStateHolder[roomCode]["private"].gameMap.getListOfSafePlayers();
    let dead = allGameStateHolder[roomCode]["private"].gameMap.getListOfDeadPlayers();
    let remainingPlayers = allGameStateHolder[roomCode]["public"].players;
    remainingPlayers = remainingPlayers.filter(function(el) {
        return !safe.includes(el) && !dead.includes(el);
    });
    if (remainingPlayers.length > 0) {
        let newIndex = allGameStateHolder[roomCode]["public"].currentPlayerIndex;
        newIndex = newIndex + 1;
        return iterativeGetNextPlayer(roomCode, newIndex, remainingPlayers);
    } else {
        //round over
        triggerEndOfRound(roomCode, gameDataObj.rounds.value);
    }
    /*
                    allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
                allGameStateHolder[roomCode]["public"].choiceMode = null;
                allGameStateHolder[roomCode]["public"].choices = null;
                allGameStateHolder[roomCode]["private"].currentPlayerChoices = null;
    */
}

function setNextPlayerStartOfRound(roomCode, winnerId) {
    console.log(`last round player winner: ${winnerId}`);
    allGameStateHolder[roomCode]["public"].currentPlayerIndex = winnerId;
    // allGameStateHolder[roomCode]["public"].currentPlayerIndex = nextPlayerIndex;
}

function iterativeGetNextPlayer(roomCode, currentNextIndex, currentRemainingPlayers) {
    if (allGameStateHolder[roomCode]["public"].players[currentNextIndex] != undefined) {
        console.log("REMAINGIN PLAYERS");
        console.log(currentRemainingPlayers);
        if (currentRemainingPlayers.includes(allGameStateHolder[roomCode]["public"].players[currentNextIndex])) {
            return currentNextIndex
        } else {
            return iterativeGetNextPlayer(roomCode, currentNextIndex++, currentRemainingPlayers);
        }
    } else {
        if (currentRemainingPlayers.includes(allGameStateHolder[roomCode]["public"].players[0])) {
            return 0
        } else {
            return iterativeGetNextPlayer(roomCode, 1, currentRemainingPlayers);
        }
    }
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
    addItemToLog(roomCode, `--- The Game has Begun! ---`);
    updateGameStateObject(roomCode);
    console.log(`===> OBJECT: ${JSON.stringify(allGameStateHolder[roomCode])}`);
    io.to(roomCode).emit(`${GAME_TAG}-start`, allGameStateHolder[roomCode]["public"]);
}

function startNewRound(roomCode) {

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
    // let thisGame = allGameStateHolder[roomCode]["private"]["gameMap"];
    // allGameStateHolder[roomCode]["public"]["game"] = thisGame;
    // allGameStateHolder[roomCode]["public"]["topCaveCard"] = getTopVisibleCaveCard(roomCode);
    updateGameStateObject(roomCode);

    // console.log(allGameStateHolder[roomCode].privae);
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
        "game": {},
        "choices": null,
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