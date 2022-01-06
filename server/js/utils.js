const exec = require('child_process').exec;
const fs = require("fs");
const user = require("./user.js");
const queryHandler = require("./queryHandler");

// const Pool = require('pg').Pool
// const pool = new Pool({
//     user: 'me',
//     host: 'localhost',
//     database: 'example',
//     password: 'Appsmart123',
//     port: 5432,
// })


const USER_FILE = "server/data/shadow";

module.exports = {
    makeid: makeid,
    shell: shell,
    readJsonFile: readJsonFile,
    writeJsonFile: writeJsonFile,
    getRandomNumberInclusive: getRandomNumberInclusive,
    shuffleArray: shuffleArray,
    getAllAccounts: getAllAccounts,
    verifyUser: verifyUser,
    addUserToList: addUserToList,
    doesUserAlreadyExistWithUsername: doesUserAlreadyExistWithUsername,
    doesUserAlreadyExistWithEmail: doesUserAlreadyExistWithEmail,
    getUserWithEmail: getUserWithEmail
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

function getRandomNumberInclusive(from, to) {
    return Math.floor(Math.random() * to) + from;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function newgetAllAccounts() {

}

function getAllAccounts() {
    if (fs.existsSync(USER_FILE)) {
        let rawData = fs.readFileSync(USER_FILE, 'utf8');
        let splitLines = rawData.split("\n");
        let listOfUsers = [];
        splitLines.forEach(line => {
            let split = line.split("|");
            listOfUsers.push(new user.User(split[0], split[1], split[2], split[3], split[4]));
        });
        return listOfUsers;
    } else {
        return [];
    }
}

function addUserToList(userObj) {
    fs.appendFileSync(USER_FILE, `${userObj.splitToString()}\n`);
}

function deleteSpecificUserFromFile(params) {

}

function editSpecificUserRowInFile(params) {

}

function doesUserAlreadyExistWithUsername(username) {
    return getAllAccounts().filter(e => e.username === username).length > 0
}

function doesUserAlreadyExistWithEmail(email) {
    return getAllAccounts().filter(e => e.email === email).length > 0
}

function getUserWithEmail(email) {
    return getAllAccounts().filter(e => e.email === email)[0];
}

function doesUserAlreadyExistWithUsernameOrEmail(username, email) {
    return getAllAccounts().filter(e => e.username === username || e.email === email).length > 0
}

function getSpecificUserById(id) {
    return getAllAccounts().filter(e => e.id === id);
}

function verifyUser(userId) {

    let users = getAllAccounts();

}