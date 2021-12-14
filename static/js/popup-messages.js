function displayPopupMessage(message, type) {
    let popup = document.createElement("div");
    popup.className = "single-popup fade-in";
    let id = Id(); //Id function from utils
    popup.id = id;
    popup.innerHTML = `<div class="popup-item ${type}">${message}</div>`;
    document.getElementById("notification-div").appendChild(popup);
    setTimeout(() => {
        document.getElementById(id).classList.remove("fade-in");
        document.getElementById(id).classList.add("fade-out");
        document.getElementById(id).addEventListener("animationend", () => {
            document.getElementById("notification-div").removeChild(popup);
        })
    }, 3000);
}