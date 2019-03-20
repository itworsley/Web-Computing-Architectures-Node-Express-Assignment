const User = require('../models/users.model');
const db = require('../../config/db');
const passwordHash = require('password-hash');

exports.getAllUsers = async function (req, res) {
    const sqlCommand = String(req.body);
    try {
        const results = await User.getAllUsers(sqlCommand);
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.getSingleUser = async function (req, res) {
    const id = req.params.id;
    const token = req.header("X-Authorization");
    User.getSingleUser(id, token, function (statusCode, statusMessage, result) {
        res.statusMessage = statusMessage;
        res.status(statusCode).json(result);
    });
};

exports.createUser = async function (req, res) {
    const sqlCommand = String(req.body);
    if (!(req.body.username) || !(req.body.email) || !(req.body.givenName) || !(req.body.familyName) || !(req.body.password) ) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else {
        const user_data = {
            "username": req.body.username, "email": req.body.email, "given_name": req.body.givenName,
            "family_name": req.body.familyName, "password": req.body.password
        };
        const username = user_data["username"].toString();
        const email = user_data["email"];
        const given_name = user_data["given_name"].toString();
        const family_name = user_data["family_name"].toString();
        const password = passwordHash.generate(user_data["password"].toString());
        const values = [[username, email, given_name, family_name, password]];

        /* Checks if password is empty or email doesn't contain an @ symbol*/
        if (password == "" || !email.includes("@") || email.length === 0) {
            res.statusMessage = 'Bad Request';
            res.status(400)
                .send("XXX");
        } else {
            // Check if duplicate user
            const result = await db.getPool().query('SELECT * FROM User WHERE username = ?', req.body.username);
            if (result.length != 0) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();
            } else {
                const results = await User.createUser(values, sqlCommand);
                res.statusMessage = 'Created';
                const json_result = {"userId": results.insertId};
                res.status(201)
                    .json(json_result);
            }

        }
    }
};

exports.updateUser = async function (req, res) {
    const length = Object.keys(req.body).length;
    if (length === 0) {
        res.statusMessage = "Bad Request";
        return res.status(400).send();
    }
    const id = req.params.id;
    let token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        User.updateUser(token, id, req.body, function (statusCode, statusMessage) {
            res.statusMessage = statusMessage;
            res.status(statusCode).json(statusMessage);
        });
    }
};



exports.login = async function (req, res) {
    // Check if password is given in query
    if (!req.body["password"]) {
        res.statusMessage = "Bad Request";
        return res.status(400).send();
    }
    let field = '';
    let value = '';
    if (req.body['username']) {
        field = "username";
        value = req.body['username'];
    } else if (req.body['email']) {
        field = "email";
        value = req.body['email'];
    } else {
        res.statusMessage = "Bad Request";
        return res.status(400).send();
    }
    User.loginUser(field, value, req.body['password'], function(statusCode, statusMessage, result) {
        res.statusMessage = statusMessage;
        res.status(statusCode).json(result);
    })
};

exports.logout = function(req, res) {
    let token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        User.logoutUser(token, function (statusCode, statusMessage) {
            res.statusMessage = statusMessage;
            res.status(statusCode).send(statusMessage);
        });
    }
};