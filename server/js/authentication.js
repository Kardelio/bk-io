const utils = require('./utils');
const express = require('express');
const user = require('./user');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const ApiResponse = require("./ApiResponse.js");
const queryHandler = require('./queryHandler');
const { query } = require('express');

const REDIRECT_LOGIN_URL = "/auth";

module.exports = function(app) {

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
                        console.log(attemptedUser);
                        if (attemptedUser.verified == true) {
                            console.log("user is verified");

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



            // let attemptedUser = utils.getUserWithEmail(req.body.email);
            // if (attemptedUser != undefined && attemptedUser != null) {
            //     if (attemptedUser.verified === "1") {
            //         bcrypt.compare(req.body.password, attemptedUser.hash)
            //             .then(compared => {
            //                 if (compared) {
            //                     jwt.sign({
            //                         email: attemptedUser.email,
            //                         id: attemptedUser.id,
            //                     }, process.env.JWT_KEY, {
            //                         expiresIn: process.env.TOKEN_EXPIRE_TIME
            //                     }, (err, token) => {
            //                         if (err) {
            //                             console.log(err);
            //                             response.setNegativeResponse(`Authentication Failed`);
            //                             res.status(403).json(response);
            //                         } else {
            //                             response.message = "Login success";
            //                             // response.data = token;
            //                             response.data = {
            //                                 "token": token,
            //                                 "username": attemptedUser.username,
            //                                 "email": attemptedUser.email
            //                             }
            //                             console.log("===> User " + req.body.email + " successfully logged in!");
            //                             // res.cookie("token", token);
            //                             res.cookie("email", attemptedUser.email, { encode: (value) => { return value } });
            //                             res.cookie("id", attemptedUser.id, { encode: (value) => { return value } });
            //                             res.cookie("token", token, { encode: (value) => { return value } });
            //                             res.status(200).json(response);
            //                         }
            //                     })
            //                 } else {
            //                     response.setNegativeResponse(`Authentication Failed`);
            //                     res.status(403).json(response);
            //                 }
            //             })
            //             .catch(err => {
            //                 response.setNegativeResponse(`Error with Pass compare: ${err}`);
            //                 res.status(500).json(response);
            //             });
            //     } else {
            //         response.setNegativeResponse("User is NOT verified");
            //         res.status(500).json(response);
            //     }
            // } else {
            //     response.setNegativeResponse("User can NOT be found");
            //     res.status(500).json(response);
            // }
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
    /**
     * authenticate middleware function
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    //Use this for API requets
    // function authenticate(req, res, next) {
    //     console.log("===> Auth Check...");
    //     console.log(req.cookies);

    //     try {
    //         const token = req.headers.authorization.split(" ")[1];
    //         console.log(token);

    //         const decoded = jwt.verify(token, process.env.JWT_KEY);
    //         req.userData = decoded;
    //         res.cookie("email", decoded.Email, { encode: (value) => { return value } });
    //         res.cookie("id", decoded.UserID, { encode: (value) => { return value } });
    //         res.cookie("token", token, { encode: (value) => { return value } });
    //         next();
    //     } catch (err) {
    //         console.log("===> User not authenticated! REDIRECTING");
    //         return res.redirect("/auth");
    //         // return res.status(401).json({ message: "Auth Failed" });
    //     }
    // }
}