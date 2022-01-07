const user = require('./user');
const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const ApiResponse = require("./ApiResponse.js");
const queryHandler = require('./queryHandler');

module.exports = function(app, io, getPlayerUsingId) {

    app.post("/register", (req, res) => {
        const response = new ApiResponse()

        if (req.body.email != undefined && req.body.email != null && req.body.email.length > 0 &&
            req.body.username != undefined && req.body.username != null && req.body.username.length > 0 &&
            req.body.password != undefined && req.body.password != null && req.body.password.length > 0) {
            console.log("===> User " + req.body.email + " attempting to register...");
            let cleanEmail = req.body.email;
            let cleanUsername = req.body.username;
            let cleanPassword = req.body.password;

            queryHandler.postQuery(`
                SELECT * FROM ${process.env.PG_DB_USER_TABLE} WHERE email = '${cleanEmail}' LIMIT 1;
            `)
                .then(d => {
                    if (d.length == 0) {

                        bcrypt.hash(cleanPassword, 10)
                            .then(hash => {
                                let newUser = new user.User(
                                    null, cleanUsername, cleanEmail, hash, false
                                )

                                queryHandler.registerUser(newUser, (success) => {
                                    response.message = "User created successfully";
                                    res.status(200).json(response);

                                })
                            })
                            .catch(err => {
                                response.setNegativeResponse(`/register (1 - hash) Server Error: ${err}`);
                                res.status(500).json(response);
                            });
                    } else {
                        response.setNegativeResponse("User already exists");
                        res.status(500).json(response);
                    }
                })
                .catch(e => {
                    response.setNegativeResponse(`/register (2 - PG SELECT) Server Error: ${e}`);
                    res.status(500).json(response);

                })
        }
    })

    app.post("/login", (req, res) => {
        const response = new ApiResponse()

        if (req.body.email != undefined && req.body.email != null && req.body.email.length > 0 &&
            req.body.password != undefined && req.body.password != null && req.body.password.length > 0) {
            console.log("===> User " + req.body.email + " attempting to login...");

            let cleanEmail = req.body.email;
            let cleanPassword = req.body.password;

            queryHandler.postQuery(`
                SELECT * FROM ${process.env.PG_DB_USER_TABLE} WHERE email = '${cleanEmail}' AND verified = true LIMIT 1;
            `)
                .then(d => {
                    if (d.length > 0) {
                        let attemptedUser = d[0];
                        if (attemptedUser.verified == true) {
                            bcrypt.compare(cleanPassword, attemptedUser.hash)
                                .then(compared => {
                                    if (compared) {
                                        jwt.sign({
                                            email: attemptedUser.email,
                                            id: attemptedUser.id,
                                        }, process.env.JWT_KEY, {
                                            expiresIn: process.env.TOKEN_EXPIRE_TIME
                                        }, (err, token) => {
                                            if (err) {
                                                console.log(err);
                                                response.setNegativeResponse(`Authentication Failed`);
                                                res.status(403).json(response);
                                            } else {
                                                response.message = "Login success";
                                                // response.data = token;
                                                response.data = {
                                                    "token": token,
                                                    "username": attemptedUser.username,
                                                    "email": attemptedUser.email
                                                }
                                                console.log("===> User " + req.body.email + " successfully logged in!");
                                                // res.cookie("token", token);
                                                res.cookie("email", attemptedUser.email, { encode: (value) => { return value } });
                                                res.cookie("id", attemptedUser.id, { encode: (value) => { return value } });
                                                res.cookie("token", token, { encode: (value) => { return value } });
                                                res.status(200).json(response);
                                            }
                                        })
                                    } else {
                                        response.setNegativeResponse(`Authentication Failed`);
                                        res.status(403).json(response);
                                    }
                                })
                                .catch(err => {
                                    response.setNegativeResponse(`Error with Pass compare: ${err}`);
                                    res.status(500).json(response);
                                });
                        } else {
                            response.setNegativeResponse(`User has NOT been verified`);
                            res.status(500).json(response);
                        }
                    } else {
                        response.setNegativeResponse(`Could NOT find matching User OR user is NOT verified`);
                        res.status(500).json(response);
                    }
                })
                .catch(e => {
                    response.setNegativeResponse(`/register (1 - PG SELECT) Server Error: ${e}`);
                    res.status(500).json(response);
                })
        } else {
            response.setNegativeResponse("Email or Password was not suitable");
            res.status(500).json(response);
        }
    })

    app.get("/logout", (req, res) => {
        console.log("===> User " + req.cookies.email + " attempting to logout...");
        res.clearCookie('token', { path: '/' });
        res.clearCookie('id', { path: '/' });
        res.clearCookie('email', { path: '/' });
        res.status(200).json({});
    });

    app.get("/live", authenticateAdmin, (req, res) => {
        const response = new ApiResponse()
        queryHandler.postQuery(`SELECT * from ${process.env.PG_DB_USER_TABLE}`)
            .then(d => {
                if (d.length > 0) {
                    let currentUsers = d.map((line) => {
                        return `${line.email} - ${line.verified} - ${line.username}`
                    });
                    let roomMap = io.sockets.adapter.rooms;
                    let out = [];
                    let onlineList = [];
                    for (const [key, value] of roomMap.entries()) {
                        let userNames = [];
                        value.forEach(element => {
                            userNames.push(getPlayerUsingId(element));
                        });
                        if (key == userNames[0].id) {
                            onlineList.push({
                                "user": userNames[0]
                            })
                        } else {
                            out.push({
                                "room": key,
                                "users": userNames
                            })
                        }
                    }
                    response.message = `Here are all users`
                    response.data = {
                        "users": currentUsers,
                        "rooms": out,
                        "online": onlineList
                    }
                    res.status(200).json(response);
                } else {
                    response.setNegativeResponse(`Could not find ANY users!`);
                    res.status(500).json(response);
                }
            })
            .catch(e => {
                response.setNegativeResponse(`/register (1 - query) Server Error: ${e}`);
                res.status(500).json(response);
            })
    });

    app.get("/all-users", authenticateAdmin, (req, res) => {
        const response = new ApiResponse()
        queryHandler.postQuery(`SELECT * from ${process.env.PG_DB_USER_TABLE}`)
            .then(d => {
                if (d.length > 0) {
                    response.message = `Here are all users`
                    response.data = d.map((line) => {
                        return `${line.email} - ${line.verified}`
                    })
                    res.status(200).json(response);
                } else {
                    response.setNegativeResponse(`Could not find ANY users!`);
                    res.status(500).json(response);
                }
            })
            .catch(e => {
                response.setNegativeResponse(`/register (1 - query) Server Error: ${e}`);
                res.status(500).json(response);
            })
    });


    app.get("/delete-email", authenticateAdmin, (req, res) => {
        const response = new ApiResponse()

        if (req.query.email != undefined && req.query.email != null && req.query.email.length > 0) {
            let email = req.query.email;
            console.log("===> Delete user with this email: " + email + "");

            queryHandler.postQueryUpdate(`DELETE FROM ${process.env.PG_DB_USER_TABLE} WHERE email = '${email}';`)
                .then(d => {
                    if (d.rowCount > 0) {
                        response.message = `User with email ${email} has been successfully deleted`
                        res.status(200).json(response);
                    } else {
                        response.setNegativeResponse(`Could not locate & update user row`);
                        res.status(500).json(response);
                    }
                })
                .catch(e => {
                    response.setNegativeResponse(`/register (1 - hash) Server Error: ${e}`);
                    res.status(500).json(response);
                })
        } else {
            response.setNegativeResponse(`No email address supplied`);
            res.status(500).json(response);
        }
    })

    app.get("/verify-email", authenticateAdmin, (req, res) => {
        const response = new ApiResponse()

        if (req.query.email != undefined && req.query.email != null && req.query.email.length > 0) {
            let email = req.query.email;
            console.log("===> Verifying email: " + email + " for login");

            queryHandler.postQueryUpdate(`UPDATE ${process.env.PG_DB_USER_TABLE} SET verified = true WHERE email = '${email}';`)
                .then(d => {
                    if (d.rowCount > 0) {
                        response.message = `User with email ${email} has been verified`
                        res.status(200).json(response);
                    } else {
                        response.setNegativeResponse(`Could not locate & update user row`);
                        res.status(500).json(response);
                    }
                })
                .catch(e => {
                    response.setNegativeResponse(`/register (1 - hash) Server Error: ${e}`);
                    res.status(500).json(response);
                })
        } else {
            response.setNegativeResponse(`No email address supplied`);
            res.status(500).json(response);
        }
    })

    function authenticateAdmin(req, res, next) {
        console.log("===> ADMIN Auth Check...");
        try {
            const token = req.cookies.token;

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decoded;
            queryHandler.checkIfUserIsAdmin(decoded, (d) => {
                if (d == true) {
                    console.log("===> User is an ADMIN");
                    next();
                } else {
                    console.log("===> User is NOT an ADMIN");
                    return res.status(500).json({ "message": "You are NOT an ADMIN - STOP IT" });
                }
            });
        } catch (err) {
            console.log("===> User not authenticated!");
            return res.status(500).json({ "message": "You are NOT logged in" });
        }
    }

}