const GAME = "game";
const ROOM = "room-selection";
const NAME = "name-selection";

let currentScreen = NAME;
let showChatWindow = false;
let currentRoomCode = "";
let currentUserName = "";
let currentSocketId = "";
let currentSelectedGame = null;
let isPlayerGameStarter = false;

let knownPlayerList = [];
let knownPlayerArray = [];
let knownListOfGames = [];

document.onkeydown = function(evt) {
    evt = evt || window.event;
    var charCode = evt.key;
    // console.log(charCode);
    if (charCode == "/") {
        toggleChatWindowMinimize();
    }
};

// On DOM readys
document.addEventListener("DOMContentLoaded", event => {

    let pastName = getFromLocalStorage(CURRENT_STORED_USERNAME)
    if (pastName) {
        currentUserName = pastName;
        setUserDetails(currentSocketId, currentUserName);
        currentScreen = ROOM;
    } else {
        currentScreen = NAME;
    }
    showScreen(currentScreen);

    document.getElementById("chat-toggle").onclick = () => {
        toggleChatWindowMinimize();
    }

    document.getElementById("chat-messages").onclick = () => {
        document.getElementById("message-text").focus();
    };

    document.getElementById("enter-name-button").onclick = () => {
        enterUserName();
    };

    document.getElementById("create-room-button").onclick = () => {
        requestCreateNewRoom();
    };

    document.getElementById("join-room-button").onclick = () => {
        let a = document.getElementById("roomcode").value;
        requestJoinRoom(a);
    };

    document.getElementById("message-send").onclick = () => {
        sendMessage();
    };

    requestGames();
    continueToAskForBits();
    askForVersionInfo();

    let chatExpanded = getFromLocalStorage(EXPANDED_CHAT)

    if (chatExpanded) {
        setChatExpanded(chatExpanded);
    } else {
        setChatExpanded("true");
    }
});

function leaveRoomUI() {
    showScreen(ROOM);
    toggleGameSelectionIconDisplay(false);
    clearPlayersInRoomList();
    clearAllChat();
    setGameId("");
    toggleChatWindow(isCurrentlyInRoom());
    toggleLeaveRoomButton();
}

function getGameSpace() {
    return document.getElementById("game-div");
}

function closeGameSelectionMenu() {
    toggleGameSelectScreen(false);
}

function displayGameSelectionMenu() {
    toggleGameSelectScreen(true);
}

function toggleGameSelectionIconDisplay(display) {
    if (display) {
        document.getElementById("options-div-admin").style.display = "flex";
    } else {
        document.getElementById("options-div-admin").style.display = "none";
    }
}

function selectGame(gameIdStr) {
    toggleGameSelectScreen(false);
    let id = knownListOfGames.findIndex(x => x.id == gameIdStr);
    currentSelectedGame = knownListOfGames[id];
    socket.emit("select-game", gameIdStr, currentRoomCode, currentSocketId);
}

function resetAndCleanup() {
    if (isPlayerGameStarter) {
        socket.emit(`game-over`, currentSocketId, currentRoomCode);
    }
    setCurrentGame(null);
}

function offerGameToPlayers(gameObj) {
    toggleOfferParticipationScreen(true, gameObj);
}

function displayGameStartDialog() {
    toggleGameStartDialog(true);
}

function displayGameFullPopup() {
    displayPopupMessage(`Game Full Already - Sorry!`, "info");
}

function displayGameStartedPopup() {
    displayPopupMessage(`Game Already Started - Too Late!`, "info");
}

function displayNeedMorePlayersPopup() {
    displayPopupMessage(`Need more players!`, "info");
    displayGameStartDialog();
}

function runSetupForCurrentGame(gameObj) {
    mapOfGames[gameObj.tag].default();
}

function setCurrentGame(gameObj) {
    if (gameObj != null) {
        document.getElementById("current-game-div").innerHTML = gameObj.title;
    } else {
        document.getElementById("current-game-div").innerHTML = "";
    }
}

function clearGameScreen() {
    getGameSpace().innerHTML = `----`;
}

function showScreen(screen) {
    document.getElementById(currentScreen + "-div").style.display = "none";
    currentScreen = screen;
    document.getElementById(currentScreen + "-div").style.display = "flex";
}

function toggleOfferParticipationScreen(display, gameObj) {
    if (display) {
        document.getElementById("participate-game-which-game").innerHTML = gameObj.title;
        document.getElementById("participate-game-div").style.display = "flex";
        document.getElementById("participate-game-positive").onclick = () => {
            socket.emit("join-game", gameObj.id, currentRoomCode, currentSocketId);
            toggleOfferParticipationScreen(false, null);
        }
        document.getElementById("participate-game-negative").onclick = () => {
            toggleOfferParticipationScreen(false, null);
        }
    } else {
        document.getElementById("participate-game-div").style.display = "none";
    }
}

function toggleGameStartDialog(display) {
    if (display) {
        document.getElementById("start-game-dialog-div").style.display = "flex";
        document.getElementById("start-game-dialog-button-positive").onclick = () => {
            socket.emit("start-selected-game-requested", currentRoomCode, currentSocketId);
            toggleGameStartDialog(false);
        }
        loadGameSettingsIntoDialogArea();
    } else {
        document.getElementById("start-game-dialog-div").style.display = "none";
    }
}

function loadGameSettingsIntoDialogArea() {

    console.log("Current Selected game : " + JSON.stringify(currentSelectedGame));
    let out = "";
    for (const [key, value] of Object.entries(currentSelectedGame.game_data)) {
        out += `<div class="game-data-block">`
        out += `
                <div class="game-data-name">${value.name}</div>
                <div class="game-data-description">${value.description}</div>
            `;
        if (value.type == "int") {
            out += `
                <div class="game-data-value">
                    <input class="game-data-value-input" type="number" id="${currentSelectedGame.tag}+${key}" value="${value.value}" onchange="changeSelectedGameDataKey('${currentSelectedGame.tag}','${key}','${value.type}',this.value)"/>
                </div>
            `;
        } else {
            out += `
                <div class="game-data-value">
                    <input class="game-data-value-input" type="text" id="${currentSelectedGame.tag}+${key}" value="${value.value}" onchange="changeSelectedGameDataKey('${currentSelectedGame.tag}','${key}','${value.type}',this.value)"/>
                </div>
            `;
        }
        out += `</div>`

    }
    document.getElementById("start-game-dialog-game-settings-area").innerHTML = out;

}

function changeSelectedGameDataKey(tag, key, type, value) {
    socket.emit('add-altered-game-data', currentRoomCode, currentSocketId, key, type, value);
}

function setUserDetails(id, name) {
    // if (/\S/.test(id)) {
    //     document.getElementById("user-id").innerHTML = `${id}`;
    // }
    // if (/\S/.test(name)) {
    //     document.getElementById("user-name").innerHTML = `${name}`;
    // }
}

function setGameId(id) {
    currentRoomCode = id;
    if (currentRoomCode != "") {
        document.getElementById("game-id").innerHTML = `${currentRoomCode}`;
    } else {
        document.getElementById("game-id").innerHTML = ``;
    }
}

function toggleChatWindow(isInRoom) {
    if (isInRoom) {
        document.getElementById("entire-chat-container").style.display = "block";
    } else {
        document.getElementById("entire-chat-container").style.display = "none";
    }
}

function toggleLeaveRoomButton() {
    if (document.getElementById("leave-room-icon").style.display == "none" || document.getElementById("leave-room-icon").style.display == '') {
        document.getElementById("leave-room-icon").style.display = "block";
    } else {
        document.getElementById("leave-room-icon").style.display = "none";
    }
}

function toggleChatWindowMinimize() {
    if (document.getElementById("chat-messages").classList.contains("chat-messages-hidden")) {
        setInLocalStorage(EXPANDED_CHAT, "true");
        document.getElementById("chat-toggle").classList.remove("invert");
        document.getElementById("chat-messages").classList.remove("chat-messages-hidden");
    } else {
        setInLocalStorage(EXPANDED_CHAT, "false");
        document.getElementById("chat-toggle").classList.add("invert");
        document.getElementById("chat-messages").classList.add("chat-messages-hidden");
    }
}

function setChatExpanded(expanded) {
    if (expanded == "true") {
        document.getElementById("chat-toggle").classList.remove("invert");
        document.getElementById("chat-messages").classList.remove("chat-messages-hidden");
    } else {
        document.getElementById("chat-toggle").classList.add("invert");
        document.getElementById("chat-messages").classList.add("chat-messages-hidden");
    }
}

function displayNoRoomWarning() {
    document.getElementById("no-room-warning").style.display = "block";
}

function isCurrentlyInRoom() {
    if (/\S/.test(currentRoomCode)) {
        return true;
    } else {
        return false;
    }
}

function sendMessage() {
    let message = document.getElementById("message-text").value;
    if (/\S/.test(message) && isCurrentlyInRoom()) {
        document.getElementById("message-text").value = "";
        socket.emit("message", message, currentUserName, currentRoomCode);
    }
}

function isCurrentPlayerInThisGame(playerListOfGame) {
    return playerListOfGame.includes(currentSocketId);
}

function requestCreateNewRoom() {
    socket.emit("newroom", currentUserName);
}

function requestJoinRoom(roomcode) {
    socket.emit("joinroom", roomcode, currentUserName);
}

function cancelCurrentGame() {
    socket.emit("cancel-game", currentRoomCode, currentSocketId);
}

function leaveRoom() {
    socket.emit("leave-room", currentRoomCode);
    leaveRoomUI();
}