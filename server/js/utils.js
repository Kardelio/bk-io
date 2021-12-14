const exec = require('child_process').exec;
const fs = require("fs");

module.exports = {
    makeid: makeid,
    shell: shell,
    readJsonFile: readJsonFile,
    writeJsonFile: writeJsonFile
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function readJsonFile(file) {
    let rawData = fs.readFileSync(process.env.GAMES_FILE, 'utf8');
    return JSON.parse(rawData);
}

function writeJsonFile(jsonStr, file) {
    try {
        fs.writeFileSync(file, jsonStr);
        return true;
    } catch (err) {
        return false;
    }
}

function shell(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stdout == undefined || stdout == null || stdout == "") {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}