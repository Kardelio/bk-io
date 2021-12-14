const CURRENT_STORED_USERNAME = "username";

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