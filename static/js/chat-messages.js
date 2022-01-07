/**
 * Complicated for the reason of XSS avoidance
 * @param {*} message 
 * @param {*} name 
 */
function displayMessage(message, name, fromGame = false, displayTime = true) {
    let messageContainerDiv = document.createElement("div");
    messageContainerDiv.className = "single-message";
    if (fromGame) {
        messageContainerDiv.className += " message-from-game";
    }
    let nameDiv = document.createElement("div");
    nameDiv.className = "message-sender";
    nameDiv.innerText = name;

    let messageDiv = document.createElement("div");
    messageDiv.className = "message-message";
    messageDiv.innerText = message;
    if (displayTime) {
        let timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.innerText = `${getTimeToDisplay()}`;
        messageContainerDiv.appendChild(timeDiv);
    }
    messageContainerDiv.appendChild(nameDiv);
    messageContainerDiv.appendChild(messageDiv);


    document.getElementById("chat-messages").appendChild(messageContainerDiv);
    var objDiv = document.getElementById("chat-messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function clearAllChat() {
    document.getElementById("chat-messages").innerHTML = "";
}