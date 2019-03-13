const db = require('../../config/db');
const help = require('../lib/helpers');

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

exports.createUser = async function (user) {
    let values = [user];
    try {
        return await db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', values)
    } catch (err) {
        console.log(err);
        return (err);
    }
};

exports.checkUserExists = async function (user) {
    let values = [user];
    const result = await db.getPool().query('SELECT * FROM User WHERE username = ?', values.body.username);
    if (result.length != 0) {
        return (true);
    } else {
        return (false)
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

/**

exports.loginUser = async function (field, value, password, done) {
    let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    console.log(token);

    // Check for valid credentials

    const checkSQL = `SELECT password FROM User WHERE ${field} = "${value}"`

    db.getPool().query(checkSQL, function(err, res) {
        if (err) return done(500, "Internal Server Error", "Internal Server Error");
        if (res.length === 0)  return done(400, "Bad Request", "Bad Request");
        let givenPassword = res[0].user_password;
        if (!(givenPassword === password)) return done(400, "Bad Request", "Bad Request");
        const sql = `UPDATE User SET user_token = "${token}" WHERE ${field} = "${value}" AND password = "${password}"`;
        db.getPool().query(sql, function(err, res) {
            if (res.affectedRows === 0) return done(400, "Bad Request", "Bad Request");
            if (err) return done(500, "Internal Server Error", "Internal Server Error");
            help.getUserIdFromToken(token, function (userId) {
                if (userId) {
                    return done(200, "OK", {"id": userId, "token": token});
                } else {
                    return done(500, "Internal Server Error", "Internal Server Error");
                }
            });
        });
    });
}
 */