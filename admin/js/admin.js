let liveDataInterval = null;
let liveDataIntervalTime = 5000;

document.addEventListener("DOMContentLoaded", event => {
    document.getElementById("update-time").value = liveDataIntervalTime;

    document.getElementById("change-update-time-button").onclick = () => {
        let newTime = document.getElementById("update-time").value;
        changeTimeAndRestartPing(newTime)
    }
    document.getElementById("notice-send").onclick = () => {
        sendNewNotice();
    }

    continueToAskForLive();
    getCurrentNotice();
});

function getCurrentNotice() {
    noticeRequest()
        .then(d => {
            document.getElementById("notice-message").value = d.message;
        })
        .catch(err => {

        })
}

function postRequestAddNotice(message) {

    postNewNotice(message)
        .then(d => {
            if (d.status) {
                console.log(d);
            } else {
                console.log(`Failed with ${JSON.stringify(d)}`);
            }
            // getCurrentNotice();
        })
        .catch(err => {
            console.log(err);
        })
}

function sendNewNotice() {
    let message = document.getElementById("notice-message").value;

    if (message != undefined && message != null && message.length > 0) {
        postRequestAddNotice(message);
    } else {
        console.log("Nope");
    }
}

function changeTimeAndRestartPing(timeMillis) {
    liveDataIntervalTime = timeMillis;
    clearInterval(liveDataInterval);
    liveDataInterval = null;
    continueToAskForLive();
}

function continueToAskForLive() {
    getLiveInfo();
    liveDataInterval = setInterval(() => {
        getLiveInfo();
    }, liveDataIntervalTime);
}

const fake = {
    "users": [
        "benzin7@hotmail.co.uk - true - ben",
        "test@test.com - true - test",
        "harrison.brown@live.co.uk - true - hzzæ",
        "ajzahtiri@gmail.com - true - az",
        "cjcaudwell@gmail.com - true - Windows"
    ],
    "rooms": [{
            "room": "jZR58",
            "users": [{
                "id": "S-B23qcEddT8wHjQAAAD",
                "name": "ben"
            }]
        },
        {
            "room": "s01ks",
            "users": [{
                "id": "NaxYshFf2CfE45JDAAAF",
                "name": "ben"
            }]
        }
    ],
    "online": [{
            "user": {
                "id": "S-B23qcEddT8wHjQAAAD",
                "name": "ben"
            }
        },
        {
            "user": {
                "id": "NaxYshFf2CfE45JDAAAF",
                "name": "ben"
            }
        }
    ]
};

function displayLiveData(data) {
    // console.log(data);
    let usersOut = "";
    data.users.forEach(user => {
        let email = user.split("-")[0].trim();
        let verified = user.split("-")[1].trim();
        let username = user.split("-")[2].trim();
        let verifyButton = `
                <div class="single-user-block-button-div">
        `;
        verifyButton += `
                    <button class="delete-button" onclick='deleteSelectedUser("${email}")'>Delete</button>
                    `;
        if (verified == "false") {
            verifyButton += `
                    <button class="verify-button" onclick='verifySelectedUser("${email}")'>Verify</button>
            `;
        }

        verifyButton += `
                </div>
        `;
        usersOut += `
            <div class="single-user-block">
                <div class="single-user-block-info">
                    <span class="single-user-block-email">${email}</span>
                    <span class="single-user-block-username">${username}</span>
                </div>
                ${verifyButton}
            </div>
        `
    });
    document.getElementById("user-list").innerHTML = usersOut;

    let roomsOut = "";

    roomsOut += "<div class='online-block'>";
    roomsOut += `
        <div class='single-room-name'>
            Online...
        </div>
        `;
    roomsOut += "<div class='users-in-room'>"
    data.online.forEach(onlineUser => {
        roomsOut += `
                <div class="single-user-name">
                    ${onlineUser.user.name}
                </div>
        `;
    });
    roomsOut += "</div></div>";

    data.rooms.forEach(room => {
        let singleRoom = "<div class='single-room-block'>";
        singleRoom += `
            <div class="single-room-name">
                ${room.room}
            </div>
        `;
        singleRoom += "<div class='users-in-room'>"
        room.users.forEach(user => {
            singleRoom += `
                <div class="single-user-name">
                    ${user.name}
                </div>
            `;
        });
        singleRoom += "</div></div>";
        roomsOut += singleRoom;
    });
    document.getElementById("room-list").innerHTML = roomsOut;
}

function getLiveInfo() {
    // console.log("UPDATE");
    // displayLiveData(fake);
    getLive().then(d => {
        displayLiveData(d.data);
    })
}

function getLive() {
    return new Promise((res, rej) => {
        fetch("/live")
            .then((data) => {
                return data.json();
            })
            .then(d => {
                res(d);
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}

function deleteSelectedUser(userEmail) {
    deletesUserGet(userEmail)
        .then(d => {
            console.log(d);
        })
}

function deletesUserGet(email) {
    return new Promise((res, rej) => {
        fetch(`/delete-email?email=${email}`)
            .then((data) => {
                return data.json();
            })
            .then(d => {
                res(d);
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}

function verifySelectedUser(userEmail) {
    verifyUserGet(userEmail)
        .then(d => {
            console.log(d);
        })
}


function verifyUserGet(email) {
    return new Promise((res, rej) => {
        fetch(`/verify-email?email=${email}`)
            .then((data) => {
                return data.json();
            })
            .then(d => {
                res(d);
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}