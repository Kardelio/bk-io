function updatePlayersRow(playerArray) {
    let diffs = compareTwoArrays(knownPlayerArray, playerArray);
    // compareTwoMaps(knownPlayerArray, playerArray);
    console.log("DIFFS:" + JSON.stringify(diffs));
    displayPlayerJoinOrLeftEvents(diffs);
    knownPlayerArray = playerArray;
    displayKnownPlayerList(knownPlayerArray);
}

function getPlayerInfomation(idIn) {
    return knownPlayerArray.find(e => e.id == idIn);
}

function displayPlayerJoinOrLeftEvents(diffs) {
    diffs.added.forEach(addedPlayer => {
        playerJoinedEvent(addedPlayer.name);
    });
    diffs.left.forEach(leftPlayer => {
        playerLeftEvent(leftPlayer.name);
    });
}

function playerJoinedEvent(name) {
    displayPopupMessage(`${name} has joined`, "positive");
}

function playerLeftEvent(name) {
    displayPopupMessage(`${name} has left`, "negative");
}

function clearPlayersInRoomList() {
    document.getElementById("who-is-here").innerHTML = "";
}

function displayKnownPlayerList(listIn) {
    let out = "";
    listIn.forEach(element => {
        let inGameClass = "";
        if (element.inGame) {
            inGameClass = "inGame";
        }
        let thisIsMe = "";
        if (currentSocketId == element.id) {
            console.log("This is the player now");
            thisIsMe = "<div class='simple-dot'></div>";
        }
        out += `<div class="one-here ${inGameClass}">${thisIsMe}${element.name}</div>`
    });
    document.getElementById("who-is-here").innerHTML = out;
}

function removeNamefromList(name) {
    const index = knownPlayerList.indexOf(name);
    if (index > -1) {
        knownPlayerList.splice(index, 1);
    }
}