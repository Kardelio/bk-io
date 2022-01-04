document.addEventListener("DOMContentLoaded", event => {

    let currentLoginEmail = getFromLocalStorage(LOGIN_EMAIL)
    if (currentLoginEmail) {
        document.getElementById("email").value = currentLoginEmail;
        document.getElementById("password").focus();
    }

    window.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            userLogin();
        }
    });

    document.getElementById("login-submit-button").onclick = () => {
        userLogin();
    }
    document.getElementById("register-submit-button").onclick = () => {
        userRegister();
    }

    askForVersionInfo();


});

function Id() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}

function displayPopupMessage(message, type) {
    let popup = document.createElement("div");
    popup.className = "single-popup fade-in";
    let id = Id(); //Id function from utils
    popup.id = id;
    popup.innerHTML = `<div class="popup-item ${type}">${message}</div>`;
    document.getElementById("response-container-div").appendChild(popup);
    setTimeout(() => {
        document.getElementById(id).classList.remove("fade-in");
        document.getElementById(id).classList.add("fade-out");
        document.getElementById(id).addEventListener("animationend", () => {
            document.getElementById("response-container-div").removeChild(popup);
        })
    }, 3000);
}

function displayErrorMessage(msg) {
    displayPopupMessage(msg, "negative");
}

function displaySuccessMessage(msg) {
    displayPopupMessage(msg, "positive");
}

function userLogin() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (checkVariableIsNotEmpty(email) && checkVariableIsNotEmpty(password)) {
        if (validateEmail(email)) {
            postLogin(email, password)
                .then(d => {
                    document.cookie = `token=${d.data.token}`;
                    window.location.href = "io";
                    setInLocalStorage(CURRENT_STORED_USERNAME, d.data.username);
                    setInLocalStorage(LOGIN_USERNAME, d.data.username);
                    setInLocalStorage(LOGIN_EMAIL, d.data.email);
                })
                .catch(err => {
                    console.log("err:", err);
                    displayErrorMessage(err);
                });
        } else {
            displayErrorMessage("Not valid email format");
        }
    } else {
        displayErrorMessage("Email & Password are all required!");
    }
}

function postLogin(email, password) {
    return new Promise((res, rej) => {
        fetch("/login", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            })
            .then((data) => {
                return data.json()
            }).then((d) => {
                if (d.status) {
                    res(d);
                } else {
                    rej(d.message);
                }
            }).catch((err) => {
                rej(err.message);
            })
    });
}


function userRegister() {
    let email = document.getElementById("email-reg").value;
    let password = document.getElementById("password-reg").value;
    let username = document.getElementById("username-reg").value;

    if (checkVariableIsNotEmpty(email) && checkVariableIsNotEmpty(password) && checkVariableIsNotEmpty(username)) {
        if (validateEmail(email)) {
            postRegister(username, email, password)
                .then(d => {
                    displaySuccessMessage(`
                    <div>${d.message}</div>
                    <div>Please notify the server admin and tell them to verify your email address: <span class="email-span">${email}</span></div>
                `);
                    clearRegisterFields();
                    showShadowContainerBox(d.data);
                })
                .catch(err => {
                    console.log("err:", err);
                    displayErrorMessage(err);
                });
        } else {
            displayErrorMessage("Not valid email format");
        }
    } else {
        displayErrorMessage("Username, Email & Password are all required!");
    }
}

function clearRegisterFields() {
    document.getElementById("email-reg").value = "";
    document.getElementById("password-reg").value = "";
    document.getElementById("username-reg").value = "";
}

function showShadowContainerBox(line) {
    document.getElementById("shadow-container-outer").style.display = "flex";
    document.getElementById("shadow-line-container").innerHTML = line;
}

function postRegister(username, email, password) {
    return new Promise((res, rej) => {
        fetch("/register", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username,
                    "email": email,
                    "password": password
                })
            })
            .then((data) => {
                return data.json()
            }).then((d) => {
                if (d.status) {
                    res(d);
                } else {
                    rej(d.message);
                }
            }).catch((err) => {
                rej(err.message);
            })
    });
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function checkVariableIsNotEmpty(variable) {
    if (variable != undefined && variable != null && variable.length > 0) {
        return true;
    } else {
        return false;
    }
}

// function askForVersionInfo() {
//     versionInfoRequest()
//         .then(d => {
//             document.getElementById("version-div").innerHTML = `${d.git_commit_number} - ${d.git_commit_hash}`;
//         })
// }

// function versionInfoRequest() {
//     return new Promise((res, rej) => {
//         fetch("/version")
//             .then((data) => {
//                 return data.json();
//             })
//             .then(d => {
//                 res(d);
//             })
//             .catch((err) => {
//                 rej(err.message);
//             })
//     });
// }

/*
-block">
                <div class="title">Login</div>
                <input type="text" id="username" class="text-input space-above" />
                <input type="password" id="password" class="text-input space-above" />
                <button id="login-submit-button" class="button space-above">Login</button>
            </div>

    <div class="container">
        <div id="name-selection-div" class="whole-space whole-screen">
            <div class="room-option-block">
                <div class="title">Please enter your name...</div>
                <input type="text" id="name" class="text-input space-above" />
                <button id="enter-name-button" class="button space-above">Confirm</button>
            </div>
        </div>
*/