function logoutTrigger() {
    console.log("Log out");
    logoutCurl()
        .then(d => {
            console.log(d);
            window.location.href = "/";
        })
        .catch(err => {
            console.log(err);
        });
}

function logoutCurl() {
    return new Promise((res, rej) => {
        fetch("/logout")
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