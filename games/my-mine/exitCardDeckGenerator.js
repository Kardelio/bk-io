const Card = require('./card.js');
const Utils = require('../../server/js/utils.js');

module.exports = (allGameStateHolder, roomCode) => {
    let countForId = 0;
    let exitCardsDeck = [];
    exitCardsDeck.push(
        new Card.ExitCard(
            "All OR Two",
            "all-or-two",
            countForId,
            "Move everyone ONE space out",
            () => {
                console.log("OPTION 1");
                allGameStateHolder[roomCode]["private"]["gameMap"].moveAllPlayers(-1);
            },
            "everyone-one",
            "Move yourself TWO spaces out",
            (player) => {
                console.log("OPTION 2");
                allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(player, -2);
            },
            "self-two"
        )
    )
    countForId++;

    exitCardsDeck.push(
        new Card.ExitCard(
            "Switch OR Two",
            "switch-or-two",
            countForId,
            "Switch with one other player",
            () => {
                console.log("OPTION 1");
                allGameStateHolder[roomCode]["private"]["gameMap"].moveAllPlayers(-1);
            },
            "switch",
            "Move yourself TWO spaces out",
            (player) => {
                console.log("OPTION 2");
                allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(player, -2);
            },
            "self-two"
        )
    )
    countForId++;

    for (let i = 0; i < 3; i++) {
        exitCardsDeck.push(
            new Card.ExitCard(
                "One",
                "one",
                countForId,
                "Move out of the cave by one",
                (player) => {
                    console.log("OPTION 1");
                    allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(player, -1);
                },
                "self-one",
                null,
                null,
                null
            )
        )
        countForId++;
    }

    exitCardsDeck = Utils.shuffleArray(exitCardsDeck);
    return exitCardsDeck;
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