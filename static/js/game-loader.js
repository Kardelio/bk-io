let mapOfGames = {};

function storeGames(games) {
    console.log(games);
    knownListOfGames = games;
    let out = "";
    knownListOfGames.forEach(game => {
        out += returnSingleGameDiv(game);
    });
    document.getElementById("game-selection-div-inner").innerHTML = `
        <div>
            <i onclick="closeGameSelectionMenu()" class="fa fa-times-circle close-icon negative-front"aria-hidden="true"></i>
            <div>What would you like to play?</div>
            ${out}
        </div>
    `;
}

function returnSingleGameDiv(gameObj) {
    return `
        <div id="game-option-${gameObj.id}" onclick="selectGame('${gameObj.id}')" class="game-option">
            <div class="single-game-title">${gameObj.title}</div>
            <div class="single-game-description">
                <img src="${gameObj.folder}/logo.png" class="single-game-img"/>
                <div>
                    <div class="single-game-description">${gameObj.description}</div>
                    <div class="single-game-min-max-players">Min: ${gameObj.min_players} - Max: ${gameObj.max_players}</div>
                </div>
            </div>
        </div>
    `;
}

function toggleGameSelectScreen(display) {
    if (display) {
        document.getElementById("game-selection-div").style.display = "flex";
    } else {
        document.getElementById("game-selection-div").style.display = "none";
    }
}

function updateCurrentGameWaitingToStartInfo() {
    if (currentSelectedGame != null) {
        let count = knownPlayerArray.filter(p => p.inGame == true).length;
        document.getElementById("start-game-dialog-text").innerHTML = `
            <div>${count}/${currentSelectedGame.max_players}</div>
        `;
    }
}

function requestGames() {
    gamesCurl()
        .then(d => {
            console.log(d);
            if (d.status) {
                storeGames(d.data);
                loadGameModules(d.data);
            } else {
                console.log(d.reason);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function gamesCurl() {
    return new Promise((res, rej) => {
        fetch("/games-list")
            .then((data) => {
                return data.json();
            })
            .then(d => {
                res(d);
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}

async function loadGameModules(games) {
    for (const game of games) {
        await dynamicallyLoadGame(game);
    }
}

async function dynamicallyLoadGame(gameObj) {
    try {
        let obj = await
        import (`/${gameObj.tag}/client.js`);
        loadCssFile(`/${gameObj.tag}/styles.css`)
        if (obj.default != undefined) {
            mapOfGames[gameObj.tag] = obj;
        }
    } catch (err) {
        console.log(err);
    }
}

function loadCssFile(filename) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
} 