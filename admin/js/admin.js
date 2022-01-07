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

function displayLiveData(data) {
    // console.log(data);
    let usersOut = "";
    data.users.forEach(user => {
        let email = user.split("-")[0].trim();
        let verified = user.split("-")[1].trim();
        let verifyButton = "";
        if (verified == "false") {
            verifyButton = `
                <button onclick='verifySelectedUser("${email}")'>Verify</button>
            `;
        }
        usersOut += `
            <div>${user} [${verifyButton}]</div>
        `
    });
    document.getElementById("user-list").innerHTML = usersOut;
    let roomsOut = "";
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