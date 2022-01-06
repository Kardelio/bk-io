const express = require('express');
require("dotenv").config();
const app = express();
const path = require('path');
const fs = require("fs");
const http = require('http');
const jwt = require('jsonwebtoken');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});
const validator = require('validator');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

/**
 * Modules in ./server/js
 */
const utils = require('./server/js/utils');

const REDIRECT_LOGIN_URL = "/auth";

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


function authenticateHTMLPage(req, res, next) {
    if (process.env.SKIP_LOGIN == "true") {
        console.log(`IMPORTANT ---> Login skipped in authenticateHTMLPage`);
        next();
    } else {
        try {
            const token = req.cookies.token;
            // console.log(token);

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decoded;
            // res.cookie("email", decoded.email, { encode: (value) => { return value } });
            // res.cookie("id", decoded.id, { encode: (value) => { return value } });
            // res.cookie("token", token, { encode: (value) => { return value } });
            next();
        } catch (err) {
            console.log("===> User not authenticated! REDIRECTING");
            console.log(err);
            return res.redirect(REDIRECT_LOGIN_URL);
            // return res.status(401).json({ message: "Auth Failed" });
        }
    }
}

require("./server/js/authentication.js")(app);


// app.use(express.static(path.join(__dirname, 'auth')));
// app.use(express.static(path.join(__dirname, 'auth')));


// NOTE: pre auth addition
// app.use(express.static(path.join(__dirname, 'static')));



let idToPlayerNameMap = {};
let roomToPlayerIdMap = {};
let currentAvailableGames = [];
let gameServerJs = {};
let activeGames = {};

let aabitsCache = null;
let aabitsInterval = null;
const aabitsIntervalCount = 5000;

function loadGames() {
    let rawData = fs.readFileSync(process.env.GAMES_FILE, 'utf8');
    currentAvailableGames = JSON.parse(rawData);
    currentAvailableGames.forEach(game => {
        app.use(`/${game.tag}`, express.static(path.join(__dirname, `games/${game.folder}`)));
        gameServerJs[game.id] = require(`./games/${game.folder}/server.js`);
    });
    for (const [key, value] of Object.entries(gameServerJs)) {
        value.setup(app, io, (tag, rc) => {
            return getCurrentGameData(tag, rc);
        }, (id) => {
            return getPlayerUsingId(id);
        });
    }
}
loadGames();

function getAABitsOnLoop() {
    aabitsInterval = setInterval(() => {
        getAABitsFromServer();
    }, aabitsIntervalCount);
}

function getAABitsFromServer() {
    getAABitsRequest()
        .then((d) => {
            aabitsCache = d;
        })
        .catch(err => {
            console.log(`AABits request ERROR : ${err}`);
        });
}

if (process.env.SHOULD_GET_AABITS == "true") {
    getAABitsOnLoop();
}

function copyObject(objectOriginal) {
    return JSON.parse(JSON.stringify(objectOriginal));
}

function getCurrentGameData(tagIn, roomCode) {
    let gameObjCopy = copyObject(currentAvailableGames.find(g => g.tag == tagIn).game_data);
    if (activeGames[roomCode]["altered"] != undefined) {
        for (const [key, value] of Object.entries(activeGames[roomCode]["altered"])) {
            if (gameObjCopy[key] != undefined) {
                gameObjCopy[key].value = value
            }
        }
    }
    return gameObjCopy;
}

function getRoomPlayerIsIn(playerId) {
    for (const [key, value] of Object.entries(roomToPlayerIdMap)) {
        let id = value.indexOf(playerId);
        if (id > -1) {
            return key;
        }
    }
    return null;
}

function removePlayerFromRoom(playerId) {
    let roomId = getRoomPlayerIsIn(playerId);
    if (roomId != null) {
        if (roomToPlayerIdMap[roomId] != undefined) {
            let index = roomToPlayerIdMap[roomId].indexOf(playerId);

            roomToPlayerIdMap[roomId].splice(index, 1);
            if (roomToPlayerIdMap[roomId].length <= 0) {
                delete roomToPlayerIdMap[roomId];
            }
        }
    }
    console.log(`****> All remaining players in all rooms: ${JSON.stringify(roomToPlayerIdMap)}`);
}

function addPlayerToRoom(playerId, roomCode) {
    if (roomToPlayerIdMap[roomCode] == undefined) {
        roomToPlayerIdMap[roomCode] = Array(playerId);
    } else {
        roomToPlayerIdMap[roomCode].push(playerId);
    }
    console.log(`****> Players in room ${roomCode}: ${JSON.stringify(roomToPlayerIdMap)}`);
}

// function removePlayerFromRoom(playerId, roomCode) {
//     const index = roomToPlayerIdMap[roomCode].indexOf(playerId);
//     if (index > -1) {
//         roomToPlayerIdMap[roomCode].splice(index, 1);
//     }
//     console.log(`****> Players in room ${roomCode}: ${JSON.stringify(roomToPlayerIdMap)}`);
// }

function getPlayerUsingId(id) {
    return { "id": id, "name": idToPlayerNameMap[id] }
}

function checkIfRoomHasAnActiveGame(roomCode) {
    if (activeGames[roomCode] !== undefined) {
        return activeGames[roomCode]["id"];
    }
    return -1;
}

function sendPlayerUpdate(playerRoomCode) {
    let playerRoomObj = [];
    if (roomToPlayerIdMap[playerRoomCode] != undefined) {
        roomToPlayerIdMap[playerRoomCode].forEach(playerId => {
            playerRoomObj.push(getPlayerUsingId(playerId));
        });
    }
    if (activeGames[playerRoomCode] !== undefined) {
        activeGames[playerRoomCode]["players"].forEach(playerCode => {
            let playerIns = playerRoomObj.find(o => o.id == playerCode)
            if (playerIns !== undefined) {
                playerIns["inGame"] = true;
            }
        });
    }
    io.to(playerRoomCode).emit("player-update", playerRoomObj);
}


io.on('connection', (socket) => {
    console.log(`---> ${socket.id} Connected`);

    socket.on('disconnect', () => {
        console.log(`<--- ${socket.id} Disconnected`);

        let playerRoomCode = getRoomPlayerIsIn(socket.id);
        socket.leave(playerRoomCode);
        removePlayerFromRoom(socket.id);
        delete idToPlayerNameMap[socket.id];
        sendPlayerUpdate(playerRoomCode);
    });

    socket.on('newroom', (name) => {
        console.log(`===> ${socket.id} (${name}) Started a NEW ROOM`);
        idToPlayerNameMap[socket.id] = name;
        let roomName = utils.makeid(5);
        socket.join(roomName);
        addPlayerToRoom(socket.id, roomName);
        socket.emit('gameCode', roomName, idToPlayerNameMap);
        sendPlayerUpdate(roomName);
    });

    socket.on("joinroom", (code, name) => {
        console.log(`===> ${socket.id} (${name}) Joined a ROOM (${code})`);
        idToPlayerNameMap[socket.id] = name;
        const room = io.sockets.adapter.rooms.get(code);
        if (room) {
            socket.join(code);
            socket.emit('joined', code, idToPlayerNameMap);
            addPlayerToRoom(socket.id, code);
            sendPlayerUpdate(code);
        } else {
            console.log(`===> ${socket.id} (${name}) Tried to join a room that does NOT exist: (${code})`);
            socket.emit('noroom');
        }
        let currentGameId = checkIfRoomHasAnActiveGame(code);
        if (currentGameId > -1) {
            io.to(socket.id).emit("game-selected", currentAvailableGames[currentGameId]);
        }
    })

    socket.on('select-game', (gameId, roomCode, socketId) => {
        let idOfGame = currentAvailableGames.findIndex(x => x.id == gameId);
        if (idOfGame > -1) {
            io.to(roomCode).emit("game-selected", currentAvailableGames[idOfGame]);
            console.log(`===> ${socket.id} (${roomCode}) Started a SELECTED game: ${currentAvailableGames[idOfGame].title}`);
            activeGames[roomCode] = { "id": idOfGame, "players": [], "started": false, "boss": socketId };
        } else {
            console.log(`===> ${socket.id} (${roomCode}) Tried to start a game that does NOT exist: ${gameId}`);
        }
    })

    socket.on('leave-room', (roomCode) => {
        console.log(`===> ${socket.id} Leaving the ROOM (${roomCode})`);
        socket.leave(roomCode);
        removePlayerFromRoom(socket.id);
        sendPlayerUpdate(roomCode);
    })

    socket.on('cancel-game', (roomCode, socketId) => {
        let currentGameId = checkIfRoomHasAnActiveGame(roomCode);
        if (currentGameId > -1) {
            endCurrentGame(roomCode);
            io.to(roomCode).emit("game-cancelled");
        }
    })

    socket.on('join-game', (gameId, roomCode, playerCode) => {
        console.log(`Player ${playerCode} wants to join in ${roomCode} - ${gameId}`);
        if (activeGames[roomCode].started == false) {
            if (activeGames[roomCode]["players"].length < currentAvailableGames[gameId]["max_players"]) {
                activeGames[roomCode]["players"].push(playerCode);

                sendPlayerUpdate(roomCode);

                if (playerCode == activeGames[roomCode]["boss"]) {
                    //This is the game creator
                    io.to(playerCode).emit("wait-for-start");
                }
            } else {
                io.to(playerCode).emit("game-full-sorry");
            }
        } else {
            io.to(playerCode).emit("game-started-sorry");
        }
    })

    socket.on('update-player-info', (socketId, name, roomCode) => {
        idToPlayerNameMap[socketId] = name;
        if (roomCode != "" && roomCode != undefined) {
            sendPlayerUpdate(roomCode);
        }
    })

    socket.on('game-over', (playerId, roomCode) => {
        endCurrentGame(roomCode);
        sendPlayerUpdate(roomCode);
    })

    socket.on('add-altered-game-data', (roomCode, playerCode, key, type, value) => {
        if (activeGames[roomCode]["altered"] == undefined) {
            activeGames[roomCode]["altered"] = {}
        }
        if (type == "int") {
            activeGames[roomCode]["altered"][key] = parseInt(value);
        } else {
            activeGames[roomCode]["altered"][key] = value;
        }
    })

    socket.on('start-selected-game-requested', (roomCode, playerCode) => {
        let currentGameId = checkIfRoomHasAnActiveGame(roomCode);
        if (currentGameId > -1) {
            if (activeGames[roomCode]["players"].length >= currentAvailableGames[currentGameId]["min_players"]) {
                activeGames[roomCode].started = true;
                gameServerJs[currentGameId].startGame(io, roomCode, activeGames[roomCode]["players"]);
            } else {
                io.to(playerCode).emit("game-needs-more-players-sorry");
            }
        }
    })

    socket.on("message", (message, name, code) => {
        console.log(`Message: ${message}, Name: ${name}, Code: ${code}`);
        let cleanMessage = validator.escape(message)
            //Below comment does not inclue sender: https://socket.io/docs/v3/emit-cheatsheet/
            // socket.broadcast.to(code).emit("incoming-message", cleanMessage, name);
        io.to(code).emit("incoming-message", cleanMessage, name);
    })

});

app.get("/aabits", (req, res) => {
    // getAABits(res);
    res.write(JSON.stringify(aabitsCache));
    res.end();
})

app.get("/version", (req, res) => {
    try {
        let rawData = fs.readFileSync("version.json", 'utf8');
        let currentVersionInfo = JSON.parse(rawData);
        res.write(JSON.stringify(currentVersionInfo));
        res.end();
    } catch (err) {
        outRes.status = false;
        outRes.reason = err.message;
        res.write(`${err}`);
        res.end();
    }
})

app.get("/games-list", (req, res) => {
    var outRes = {
        status: true,
        reason: "",
        data: {}
    }
    outRes.status = true;
    outRes.data = currentAvailableGames;
    res.write(JSON.stringify(outRes));
    res.end();
});

function endCurrentGame(roomCode) {
    delete activeGames[roomCode];
}

// function getAABits(res) {
//     getAABitsRequest()
//         .then((d) => {
//             res.write(JSON.stringify(d));
//             res.end();
//         })
//         .catch(err => {
//             res.write(JSON.stringify(err));
//             res.end();
//         });
// }

function getAABitsRequest() {
    return new Promise((res, rej) => {
        utils.shell(`curl -s ${process.env.AABITS_URL}`)
            .then((data) => {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    rej(e);
                }
            })
            .then(d => {
                res(d);
            })
            .catch(err => {
                rej(err);
            })
    });
}

app.use('/shared', express.static(path.join(__dirname, 'shared')));
//ORDER FOR  THE TWO BELOW IS A PROBLEM!
app.use(REDIRECT_LOGIN_URL, express.static(path.join(__dirname, 'auth')));
app.use(authenticateHTMLPage, express.static(path.join(__dirname, 'static')));

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('listening on *:3000');
});