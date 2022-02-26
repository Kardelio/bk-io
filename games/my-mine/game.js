class GameMap {
    constructor(numberOfPlaces, players) {
        this.numberOfPlaces = numberOfPlaces
        this.roundNumber = 1;
        this.gems = {}
        this.map = Array(this.numberOfPlaces).fill(Array());
        this.safe = Array();
        this.dead = Array();
        this.nuggets = {}
        this.lastRoundWinnerId = null;
        this.dragonIndex = this.numberOfPlaces;
        this.playerList = players;
        players.forEach(player => {
            this.setPlayerToStartCell(player);
        });
        this.printGameStatus();
        // this.moveAllPlayers(-2);
    }

    printGameStatus() {
        for (let index = 0; index < this.map.length; index++) {
            let out = `[`;
            const element = this.map[index];
            out += `${element}`;
            if (index == this.dragonIndex) {
                out += "-D-";
            }
            out += `]`;
            process.stdout.write(out);
        }
        process.stdout.write("\n------------------\n");
    }

    moveDragon() {
        console.log("DRAGONNNNNNNn");
        this.dragonIndex -= 1;
        let playersInThatCell = this.getPlayersInCell(this.dragonIndex);
        playersInThatCell.forEach(player => {
            this.killPlayer(player, this.dragonIndex);
        });
        this.printGameStatus();
    }

    moveAllPlayers(amount) {
        this.playerList.forEach(playerId => {
            this.movePlayerByAmount(playerId, amount);
        });
    }

    findCellOfPlayer(playerId) {
        let currentCellId = null;
        for (let index = 0; index < this.map.length; index++) {
            const element = this.map[index];
            if (element.indexOf(playerId) > -1) {
                currentCellId = index;
                break;
            }
        }
        return currentCellId;
    }

    switchTwoPlayersPositions(playerA, playerB) {
        if (playerA != playerB) {
            let playerACell = this.findCellOfPlayer(playerA)
            let playerBCell = this.findCellOfPlayer(playerB)
            this.removePlayerFromCell(playerA, playerACell)
            this.removePlayerFromCell(playerB, playerBCell)
            this.putPlayerInCell(playerA, playerBCell)
            this.putPlayerInCell(playerB, playerACell)
            this.printGameStatus();
        } else {
            console.log(`PlayerA ${playerA} is the SAME as PlayerB ${playerB}`);
        }
    }

    getPlayersInCell(cellId) {
        return this.map[cellId];
    }

    setPlayerToStartCell(playerId) {
        this.putPlayerInCell(playerId, this.getStartingCellIndex());
    }

    getStartingCellIndex() {
        let startingSpace = Math.round(this.numberOfPlaces / 2);
        let startingSpaceIndex = startingSpace - 1;
        return startingSpaceIndex
    }

    putPlayerInCell(playerId, cellId) {
        this.map[cellId] = [playerId].concat(this.map[cellId]);
    }

    removePlayerFromCell(playerId, cellId) {
        this.map[cellId] = this.map[cellId].filter(e => e !== playerId);
    }

    killPlayer(playerId, lastIndex) {
        console.log(`KILLED: ${playerId} - ${lastIndex}`);
        this.dead.push(playerId);
        this.removePlayerFromCell(playerId, lastIndex);
        console.log(this.dead);
    }

    escapePlayer(playerId, lastIndex) {
        console.log(`ESCAPED: ${playerId}`);
        this.safe.push(playerId);
        this.removePlayerFromCell(playerId, lastIndex);
        console.log(this.safe);
    }

    getListOfSafePlayers() {
        return this.safe;
    }

    getListOfDeadPlayers() {
        return this.dead;
    }

    movePlayerWithCaveCard(playerId, caveCard) {
        console.log(caveCard.name);
        caveCard.activate(playerId);
        // this.collectGames(playerId, caveCard.amountOfGems);
        // this.movePlayerByAmount(playerId, caveCard.movementAmount)
    }

    triggerExitCard(playerId, exitCard, option) {
        console.log(exitCard.name);
        console.log(option);
        exitCard.activateOption(option, playerId);
    }

    collectGems(playerId, amount) {
        if (this.gems[playerId] == undefined) {
            this.gems[playerId] = amount;
        } else {
            this.gems[playerId] = this.gems[playerId] + amount;
        }
        console.log(this.gems);
    }

    movePlayerByAmount(playerId, amount) {
        this.printGameStatus();
        let currentCellId = this.findCellOfPlayer(playerId);
        // let whereInCell = null;
        // for (let index = 0; index < this.map.length; index++) {
        //     const element = this.map[index];
        //     if (element.indexOf(playerId) > -1) {
        //         // whereInCell = element.indexOf(playerId);
        //         currentCellId = index;
        //         break;
        //     }
        // }
        if (currentCellId != null) {
            if (amount != 0) {
                this.removePlayerFromCell(playerId, currentCellId)
                let destinationCell = currentCellId + amount;
                if (destinationCell >= 0 && destinationCell < (this.dragonIndex)) {
                    this.putPlayerInCell(playerId, destinationCell);
                } else {
                    if (Math.sign(amount) == 1) {
                        this.killPlayer(playerId, currentCellId)
                    } else {
                        this.escapePlayer(playerId, currentCellId);
                    }
                }
            }
            this.printGameStatus();
        } else {
            console.log(`Players with id: ${playerId} DOES NOT EXIST`);
        }
    }

    getGemsForSpecificPlayer(playerId) {
        if (this.gems[playerId] != undefined) {
            return this.gems[playerId]
        } else {
            return 0
        }
    }

    calculateNuggets() {
        console.log(`Safe order is this ${this.safe}`);
        let ranks = {
            "first": {
                "player": null,
                "gems": 0,
                "nuggets": 3
            },
            "second": {
                "player": null,
                "gems": 0,
                "nuggets": 2
            },
            "third": {
                "player": null,
                "gems": 0,
                "nuggets": 1
            }
        };
        this.safe.forEach(plyr => {
            let g = this.getGemsForSpecificPlayer(plyr);
            if (g > ranks.first.gems) {
                ranks.first.gems = g;
                ranks.first.player = plyr;
            }
        });
        if (ranks.first.player != null) {
            this.lastRoundWinnerId = ranks.first.player;
            this.safe.splice(this.safe.indexOf(ranks.first.player), 1);
        }

        this.safe.forEach(plyr => {
            let g = this.getGemsForSpecificPlayer(plyr);
            if (g > ranks.second.gems) {
                ranks.second.gems = g;
                ranks.second.player = plyr;
            }
        });
        if (ranks.second.player != null) {
            this.safe.splice(this.safe.indexOf(ranks.second.player), 1);
        }

        this.safe.forEach(plyr => {
            let g = this.getGemsForSpecificPlayer(plyr);
            if (g > ranks.third.gems) {
                ranks.third.gems = g;
                ranks.third.player = plyr;
            }
        });
        if (ranks.third.player != null) {
            this.safe.splice(this.safe.indexOf(ranks.third.player), 1);
        }

        for (const [key, value] of Object.entries(ranks)) {
            console.log(`${key}: ${value}`);
            if (value.player != null) {
                if (this.nuggets[value.player] == undefined) {
                    this.nuggets[value.player] = value.nuggets;
                } else {
                    this.nuggets[value.player] = this.nuggets[value.player] + value.nuggets;
                }
            }
        }
        console.log(this.nuggets);
        /*
        const mapSort1 = new Map([...myMap.entries()].sort((a, b) => b[1] - a[1]));
console.log(mapSort1);
        */
    }

    increaseRoundNumber() {
        this.roundNumber++;
    }

    setupForNewRound() {
        this.calculateNuggets();
        // this.roundNumber++;
        // console.log(`Round next: ${this.roundNumber} max rounds: ${maxRounds}`);
        // if (this.roundNumber > maxRounds) {
        //     console.log("END THE GAME SON ------------");
        // }
        this.playerList.forEach(player => {
            this.setPlayerToStartCell(player);
        });
        this.dead = [];
        this.safe = [];
        this.gems = {};
        this.dragonIndex = this.numberOfPlaces;
    }
}

module.exports = {
    GameMap
}