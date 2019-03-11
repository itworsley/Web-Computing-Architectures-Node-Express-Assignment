const db = require('../../config/db');

exports.getAllUsers = async function () {
    try {
        return await db.getPool().query("SELECT * FROM User");
    } catch (err) {
        console.log(err);
        return(err);
    }

};

exports.getSingleUser = async function(userId) {
    try {
        return await db.getPool().query("SELECT * FROM User WHERE user_id = ?", userId);
    } catch (err) {
        console.log(err);
        return(err);
    }
};

exports.createUser = async function (username) {
    let values = [username];
    try {
        return await db.getPool().query('INSERT INTO User (username) VALUES ?', values)
    } catch (err) {
        console.log(err);
        return (err);
    }
};

/**
exports.updateUser = async function (id, values) {
    let valuesList = ["given_name= 'Teddy'"];
    console.log(valuesList);
    console.log(id);
    try {
        return await db.getPool().query('UPDATE Users SET (?) WHERE user_id = ?', valuesList, id);
    } catch (err) {
        console.log(err);
        return (err);
    }
}*/