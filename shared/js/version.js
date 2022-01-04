function askForVersionInfo() {
    versionInfoRequest()
        .then(d => {
            document.getElementById("version-div").innerHTML = `${d.git_commit_number} - ${d.git_commit_hash}`;
        })
}

function versionInfoRequest() {
    return new Promise((res, rej) => {
        fetch("/version")
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