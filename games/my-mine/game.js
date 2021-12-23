class GameMap {
    constructor(numberOfPlaces, players) {
        this.numberOfPlaces = numberOfPlaces
        this.gems = {}
        this.map = Array(this.numberOfPlaces).fill(Array());
        this.safe = Array();
        this.dead = Array();
        this.dragonIndex = this.numberOfPlaces;
        players.forEach(player => {
            this.addPlayerToGame(player);
        });
        this.printGameStatus();
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

    getPlayersInCell(cellId) {
        return this.map[cellId];
    }

    addPlayerToGame(playerId) {
        let startingSpace = Math.round(this.numberOfPlaces / 2);
        let startingSpaceIndex = startingSpace - 1;
        this.putPlayerInCell(playerId, startingSpaceIndex);
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

    movePlayerWithCaveCard(playerId, caveCard) {
        console.log(caveCard.name);
        caveCard.activate(playerId);
        // this.collectGames(playerId, caveCard.amountOfGems);
        // this.movePlayerByAmount(playerId, caveCard.movementAmount)
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
        let currentCellId = null;
        let whereInCell = null;
        for (let index = 0; index < this.map.length; index++) {
            const element = this.map[index];
            if (element.indexOf(playerId) > -1) {
                whereInCell = element.indexOf(playerId);
                currentCellId = index;
                break;
            }
        }
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
        }
    }
}

module.exports = {
    GameMap
}