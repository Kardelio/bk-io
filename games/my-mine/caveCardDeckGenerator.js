const Card = require('./card.js');
const CardTags = require('./cardTags.js');
const Utils = require('../../server/js/utils.js');

const twoGemsOneDangerNumber = 15;
const oneGemNumber = 29;
const oneGemOneSafeNumber = 5;
const dragonCardNumber = 9;
const totalCaveCards = dragonCardNumber + twoGemsOneDangerNumber + oneGemNumber + oneGemOneSafeNumber;

/*
DRAGON_CARD_TAGp
9x dragons
15x 2 and danger
5x one and safe
29x one

2-6
*/

module.exports = (allGameStateHolder, roomCode) => {
    let countForId = 0;
    let caveCardsDeck = [];
    for (let i = 0; i < dragonCardNumber; i++) {
        caveCardsDeck.push(
            new Card.Card(
                "Dragon",
                CardTags.DRAGON_CARD_TAG,
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
                CardTags.TWO_GEM_CLOSER,
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
                CardTags.ONE_GEM_STAY,
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
                CardTags.ONE_GEM_EXIT,
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