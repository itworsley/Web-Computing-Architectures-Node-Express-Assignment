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
    User.createUser(req.body, function (statusCode, statusMessage, result) {
        res.statusMessage = statusMessage;
        res.status(statusCode).json(result);
    });
};

/*
exports.createUser = async function (req, res) {


    const sqlCommand = String(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const givenName = req.body.givenName;
    const familyName = req.body.familyName;
    const password = req.body.password;
    let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    //console.log(username, email, givenName, familyName, password);
    //console.log(!username || !(/^\s*$/.test(username)));
    if (!username || !(/^\s*$/.test(username))) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
    if (!re.test(email)) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
    if (!givenName || (/^\s*$/.test(givenName))) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
    if (!familyName || (/^\s*$/.test(familyName))) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
    if (!password || (/^\s*$/.test(password))) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
    else {
        const values = [[username, email, givenName, familyName, password]];
        //const values = [[username, email, givenName, familyName, password]];
        //console.log(values);
        // Check if duplicate user
        const result = await db.getPool().query('SELECT * FROM User WHERE username = ?', req.body.username);
        if (result.length !== 0) {
            res.statusMessage = 'Bad Request';
            res.status(400)
                .send();
        } else {
            const results = await User.createUser(values, sqlCommand);
            res.statusMessage = 'Created';
            const json_result = {"userId": results.insertId};
            console.log(json_result);
            res.status(201)
                .send(json_result);
        }
    }
};
*/

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