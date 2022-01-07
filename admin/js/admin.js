let liveDataInterval = null;
let liveDataIntervalTime = 5000;

document.addEventListener("DOMContentLoaded", event => {
    continueToAskForLive();
});

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
        let verifyButton = "";
        if (verified == "false") {
            verifyButton = `
                <div class="single-user-block-button-div">
                    <button onclick='verifySelectedUser("${email}")'>Verify</button>
                </div>
            `;
        }
        usersOut += `
            <div class="single-user-block">
                <div class="single-user-block-email">${email}</div>
                <div class="single-user-block-username">${username}</div>
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

function verifySelectedUser(userEmail) {
    console.log(userEmail);
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