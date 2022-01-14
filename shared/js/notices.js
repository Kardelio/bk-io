function noticeRequest() {
    return new Promise((res, rej) => {
        fetch("/current-notice")
            .then((data) => {
                return data.json();
            })
            .then(d => {
                if (d == "Failed") {
                    rej("Failed to get notice")
                } else {
                    res(d);
                }
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}

function postNewNotice(message) {
    return new Promise((res, rej) => {
        fetch("/add-notice", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "message": message
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