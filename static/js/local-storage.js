const CURRENT_STORED_USERNAME = "username";
const EXPANDED_CHAT = "expanded-chat";

function getFromLocalStorage(key) {
    if (localStorage.getItem(key) != undefined) {
        return localStorage.getItem(key);
    } else {
        return null;
    }
}

function setInLocalStorage(key, value) {
    localStorage.setItem(key, value);
}