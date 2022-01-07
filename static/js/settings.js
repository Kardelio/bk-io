function toggleUserSettingsMenu() {
    let div = document.getElementById("settings-change-div");
    if (div.style.display == "none" || div.style.display == '') {
        // document.getElementById("settings-name").value = currentUserName;
        div.style.display = "flex";
    } else {
        div.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", event => {
    // document.getElementById("settings-cancel-button").onclick = () => {
    //     toggleUserSettingsMenu();
    // };
    // document.getElementById("settings-confirm-button").onclick = () => {
    //     storeChangedUserSettings();
    //     toggleUserSettingsMenu();
    // };
    document.getElementById("settings-logout-button").onclick = () => {
        logoutTrigger();
        toggleUserSettingsMenu();
    }
});

// function storeChangedUserSettings() {
//     let userName = document.getElementById("settings-name").value;
//     if (/\S/.test(userName)) {
//         currentUserName = userName;
//         setInLocalStorage(CURRENT_STORED_USERNAME, currentUserName);
//         setUserDetails(currentSocketId, currentUserName);
//         emitUserNameChanged();
//     }
// }

// function emitUserNameChanged() {
//     socket.emit("update-player-info", currentSocketId, currentUserName, currentRoomCode);
// }