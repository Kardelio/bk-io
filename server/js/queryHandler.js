const res = require('express/lib/response');
const { Client } = require('pg');
const { User } = require('./user');
const { Notice } = require('./notice');
let client = null;

// function connect(cb) {
//     client.connect(err => {
//         if (err) {
//             console.error('connection error', err.stack)
//             cb(false);
//         } else {
//             console.log('connected')
//             cb(true);
//         }
//     })
// }


function postQueryUpdate(query) {
    return new Promise((res, rej) => {
        if (client != null) {
            client.query(query, (err, results) => {
                if (err) {
                    rej(err);
                } else {
                    if (results) {
                        res(results);
                    } else {
                        rej(results);
                    }
                }
            });
        } else {
            rej("Client has not been connected!")
        }
    })
}

function postQuery(query) {
    return new Promise((res, rej) => {
        if (client != null) {
            client.query(query, (err, results) => {
                if (err) {
                    rej(err);
                } else {
                    if (results) {
                        res(results.rows);
                    } else {
                        rej(results);
                    }
                }
            });
        } else {
            rej("Client has not been connected!")
        }
    })
}

function checkIfTableExists(tableName) {
    return postQuery(`SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename ='${tableName}';`)
        .then(d => {
            console.log(d);
            if (d.length > 0) {
                return true
            } else {
                return false
            }
        })
        .catch(e => {
            console.log(e);
            return false;
        })

}

function getAllUsers(cb) {
    postQuery(`
        SELECT * FROM ${process.env.PG_DB_USER_TABLE};
    `)
        .then(d => {
            let outUsers = d.map((item) => {
                return new User(
                    item.id,
                    item.username,
                    item.email,
                    item.hash,
                    item.verified
                )
            });
            cb(outUsers);
        }).catch(err => {
            cb(err);
        })
}

function addNewNotice(message, cb) {
    postQuery(`
        INSERT INTO ${process.env.PG_DB_NOTICE_TABLE} (message) VALUES ('${message}');
    `)
        .then(d => {
            cb(d);
        }).catch(err => {
            cb(err);
        })
}

function getCurrentNotice(cb) {
    postQuery(`
        SELECT * FROM ${process.env.PG_DB_NOTICE_TABLE} ORDER BY date DESC LIMIT 1;
    `)
        .then(d => {
            if (d.length > 0) {
                console.log(d);
                cb(new Notice(d[0].id, d[0].date, d[0].message));
            } else {
                cb(null);
            }
        }).catch(err => {
            console.log(err);
            cb(null);
        })
}

function registerUser(user, cb) {
    console.log(user);
    let isAdmin = false;
    let isVerified = false;
    if (user.username === process.env.ADMIN_ACCOUNT_USERNAME) {
        console.log(`Admin account being registered!`);
        isAdmin = true;
        isVerified = true;
    }
    postQuery(`
        INSERT INTO ${process.env.PG_DB_USER_TABLE} (username, email, hash, verified, isAdmin) VALUES ('${user.username}', '${user.email}', '${user.hash}', ${isVerified}, ${isAdmin});
    `)
        .then(d => {
            cb(d);
        }).catch(err => {
            cb(err);
        })
}

function setupTableFirstTime(tableName) {
    checkIfTableExists(tableName)
        .then(exists => {
            if (exists) {
                console.log(`${tableName} - already exists`);
            } else {
                createTableForFirstTime(tableName, (d) => {
                    console.log("Table has been successfully set up");
                });
            }
        })
}

function createTableForFirstTime(tableName, cb) {
    // TODO change to process.env.PG_TABLE_NAME
    if (tableName === process.env.PG_DB_USER_TABLE) {
        postQuery(`
        CREATE TABLE ${process.env.PG_DB_USER_TABLE} (
            ID SERIAL PRIMARY KEY,
            username VARCHAR(100),
            email VARCHAR(100),
            hash VARCHAR(100),
            verified boolean,
            isAdmin boolean
          );
          `)
            .then(d => {
                cb(d);
            })
    } else if (tableName === process.env.PG_DB_NOTICE_TABLE) {
        //date DATE NOT NULL DEFAULT CURRENT_DATE,
        postQuery(`
        CREATE TABLE ${process.env.PG_DB_NOTICE_TABLE} (
            ID SERIAL PRIMARY KEY,
            date TIMESTAMP default current_timestamp,
            message VARCHAR(3000)
          );
          `)
            .then(d => {
                cb(d);
            })
    } else {
        console.log("NOT DOING ANYTHING");
    }
}

function connectToDB() {
    client = new Client({
        host: process.env.PG_URL,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        database: process.env.PG_DB,
        password: process.env.PG_PASS,
    })
    return new Promise((res, rej) => {
        client.connect(err => {
            if (err) {
                console.error('connection error', err.stack)
                rej("Failed to connect to DB");
            } else {
                res("Connected successfully to DB");
            }
        })
    });
}

function initialiseDB() {
    connectToDB().then(out => {
        console.log(`Connection Message: ${out}`);
        setupTableFirstTime(process.env.PG_DB_USER_TABLE);
        setupTableFirstTime(process.env.PG_DB_NOTICE_TABLE);
    })
}

function checkIfUserIsAdmin(userData, cb) {
    console.log("ADMIN CHECK");
    console.log(userData);
    postQuery(`
        SELECT * FROM ${process.env.PG_DB_USER_TABLE} WHERE email = '${userData.email}' AND isAdmin = true LIMIT 1;
    `)
        .then(d => {
            if (d.length > 0) {
                cb(true);
            } else {
                cb(false);
            }
        }).catch(err => {
            cb(false);
        })
}

module.exports = {
    initialiseDB: initialiseDB,
    postQuery: postQuery,
    postQueryUpdate: postQueryUpdate,
    registerUser: registerUser,
    getAllUsers: getAllUsers,
    addNewNotice: addNewNotice,
    getCurrentNotice: getCurrentNotice,
    checkIfUserIsAdmin: checkIfUserIsAdmin
};