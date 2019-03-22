const User = require('../models/users.model');


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