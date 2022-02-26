const hostname = window.location.hostname;
var socket = null
    // if (params["debug"] == 'true') {
if (hostname == 'localhost' || hostname.startsWith("192.168")) {
    /**
     * For local testing you need to change this url to match your local IP address...
     */
    // socket = io('http://192.168.2.105:3000/');
    // socket = io('http://192.168.0.32:3000/');
    // socket = io('http://192.168.178.39:3000/');
    // socket = io('http://192.168.0.38:3000/');
    socket = io('http://192.168.178.39:3000/');
    console.log("IS RUNNING IN DEBUG");
} else {
    socket = io('https://bk-io.herokuapp.com/');
}

socket.on("connect", () => {
    currentSocketId = socket.id;
    setUserDetails(currentSocketId, "");
    socket.emit("provide-name", currentUserName);
})
socket.on("gameCode", (code, playersMap) => {
    showScreen(GAME);
    toggleGameSelectionIconDisplay(true);
    setGameId(code);
    toggleChatWindow(isCurrentlyInRoom());
    isPlayerGameStarter = true;
    toggleLeaveRoomButton();
});
socket.on("joined", (code, playersMap) => {
    showScreen(GAME);
    setGameId(code);
    toggleChatWindow(isCurrentlyInRoom());
    toggleLeaveRoomButton();
});
socket.on("noroom", () => {
    displayNoRoomWarning();
});
socket.on("incoming-message", (message, name) => {
    displayMessage(message, name);
});
socket.on("player-update", (arrayOfPlayers) => {
    console.log("Current players in room: " + JSON.stringify(arrayOfPlayers));
    updatePlayersRow(arrayOfPlayers);
    updateCurrentGameWaitingToStartInfo();
});
socket.on("game-selected", (gameObj) => {
    console.log(gameObj);
    setCurrentGame(gameObj);
    offerGameToPlayers(gameObj);
    runSetupForCurrentGame(gameObj);
});
socket.on("wait-for-start", () => {
    displayGameStartDialog();
});
socket.on("game-full-sorry", () => {
    displayGameFullPopup();
});
socket.on("game-started-sorry", () => {
    displayGameStartedPopup();
});
socket.on("game-needs-more-players-sorry", () => {
    displayNeedMorePlayersPopup();
})
socket.on("game-cancelled", () => {
    resetAndCleanup();
    toggleOfferParticipationScreen(false, null);
    toggleGameStartDialog(false);
    toggleGameSelectScreen(false);
    clearGameScreen();
})