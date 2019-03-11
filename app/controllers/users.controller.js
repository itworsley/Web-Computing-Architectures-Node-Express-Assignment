const User = require('../models/users.model');

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
    const sqlCommand = String(req.body);
    const id = req.params.userId;
    const results = await User.getSingleUser(id, sqlCommand);
    if (results.length > 0) {
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } else if (results.length == 0) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    }

    /**
    } catch (err) {
        if (err instanceof HttpError) console.error(err);
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    }
     */
};

exports.createUser = async function (req, res) {
    const sqlCommand = String(req.body);
    const user_data = {"username": req.body.username, "email": req.body.email, "given_name": req.body.givenName,
        "family_name": req.body.familyName, "password": req.body.password};
    const username = user_data["username"].toString();
    const email = user_data["email"].toString();
    const given_name = user_data["given_name"].toString();
    const family_name = user_data["family_name"].toString();
    const password = user_data["password"].toString();
    const values = [[username, email, given_name, family_name, password]];

    /* Checks if fields are empty or email doesn't contain an @ symbol*/
    if (username=="" || email=="" || given_name=="" || family_name=="" || password=="" || !email.includes("@")) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else {
        const results = await User.createUser(values, sqlCommand);
        res.statusMessage = 'Created';
        res.status(201)
            .json(results);
    }
    /**
    try {

    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    }
     */
};

/**
exports.updateUser = async function (req, res) {
    const sqlCommand = String(req.body);
    const values = req.body.toString();
    const id = req.params.userId;
    try {
        const results = await User.updateUser(id, values, sqlCommand);
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
}
 */