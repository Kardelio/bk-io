function enterUserName() {
    let userName = document.getElementById("name").value;
    if (/\S/.test(userName)) {
        currentUserName = userName;
        setInLocalStorage(CURRENT_STORED_USERNAME, currentUserName);
        setUserDetails(currentSocketId, currentUserName);
        showScreen(ROOM);
    }
}