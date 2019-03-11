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
    const user_data = {"user_id": req.body.username };
    const user = user_data["user_id"].toString();
    const values = [[user]];
    try {
        const results = await User.createUser(values, sqlCommand);
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