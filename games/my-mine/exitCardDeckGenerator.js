const Card = require('./card.js');

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
            "Move yourself TWO spaces out",
            () => {
                console.log("OPTION 2");
                allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(-2);
            }
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
            "Move yourself TWO spaces out",
            () => {
                console.log("OPTION 2");
                allGameStateHolder[roomCode]["private"]["gameMap"].movePlayerByAmount(-2);
            }
        )
    )
    countForId++;

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