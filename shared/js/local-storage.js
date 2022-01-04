const LOGIN_USERNAME = "login-username";
const LOGIN_EMAIL = "login-email";
const CURRENT_STORED_USERNAME = "username-editable";
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