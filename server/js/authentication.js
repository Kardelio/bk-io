const utils = require('./utils');
const express = require('express');
const user = require('./user');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const ApiResponse = require("./ApiResponse.js");

const REDIRECT_LOGIN_URL = "/auth";

module.exports = function(app) {

    app.post("/register", (req, res) => {
        const response = new ApiResponse()

        if (req.body.email != undefined && req.body.email != null && req.body.email.length > 0 &&
            req.body.username != undefined && req.body.username != null && req.body.username.length > 0 &&
            req.body.password != undefined && req.body.password != null && req.body.password.length > 0) {
            console.log("===> User " + req.body.email + " attempting to register...");
            if (utils.doesUserAlreadyExistWithUsername(req.body.username) || utils.doesUserAlreadyExistWithEmail(req.body.email)) {
                response.setNegativeResponse("User already exists");
                res.status(500).json(response);
            } else {
                bcrypt.hash(req.body.password, 10)
                    .then(hash => {
                        let newUser = new user.User(
                            uuidv4(), req.body.username, req.body.email, hash, "0"
                        )
                        utils.addUserToList(
                            newUser
                        );
                        response.message = "User created successfully";
                        response.data = newUser.splitToString();
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        response.setNegativeResponse(`/register (1 - hash) Server Error: ${err}`);
                        res.status(500).json(response);
                    });
            }
        }
    })

    app.post("/login", (req, res) => {
        const response = new ApiResponse()

        if (req.body.email != undefined && req.body.email != null && req.body.email.length > 0 &&
            req.body.password != undefined && req.body.password != null && req.body.password.length > 0) {
            console.log("===> User " + req.body.email + " attempting to login...");
            let attemptedUser = utils.getUserWithEmail(req.body.email);
            if (attemptedUser != undefined && attemptedUser != null) {
                if (attemptedUser.verified === "1") {
                    bcrypt.compare(req.body.password, attemptedUser.hash)
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
                    response.setNegativeResponse("User is NOT verified");
                    res.status(500).json(response);
                }
            } else {
                response.setNegativeResponse("User can NOT be found");
                res.status(500).json(response);
            }
        } else {
            response.setNegativeResponse("Email or Password was not suitable");
            res.status(500).json(response);
        }
    })

    app.get("/logout", (req, res) => {
        console.log("===> User " + req.cookies.email + " attempting to logout...");
        // res.cookie("token", "", { encode: (value) => { return value } });
        // res.status(200).json({});
        res.clearCookie('token', { path: '/' });
        res.clearCookie('id', { path: '/' });
        res.clearCookie('email', { path: '/' });
        res.status(200).json({});
        // res.redirect(307, '/test');
        // res.redirect('/auth');
    });

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

    // function authenticateHTMLPage(req, res, next) {
    //     if (process.env.SKIP_LOGIN == "true") {
    //         console.log(`IMPORTANT ---> Login skipped in authenticateHTMLPage`);
    //         next();
    //     } else {
    //         try {
    //             const token = req.cookies.token;
    //             // console.log(token);

    //             const decoded = jwt.verify(token, process.env.JWT_KEY);
    //             req.userData = decoded;
    //             res.cookie("email", decoded.email, { encode: (value) => { return value } });
    //             res.cookie("id", decoded.id, { encode: (value) => { return value } });
    //             res.cookie("token", token, { encode: (value) => { return value } });
    //             next();
    //         } catch (err) {
    //             console.log("===> User not authenticated! REDIRECTING");
    //             return res.redirect("/auth");
    //             // return res.status(401).json({ message: "Auth Failed" });
    //         }
    //     }
    // }

    // app.use(authenticateHTMLPage, express.static(path.join(__dirname, 'static'), { redirect: false }));
    // app.use("/bbb", express.static(path.join(__dirname, 'auth')));

}