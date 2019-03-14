const db = require('../../config/db');
const help = require('../lib/helpers');

/**
 * Gets all users within the database, function is not used anymore.
 * @returns {Promise<*>}
 */
exports.getAllUsers = async function () {
    try {
        return await db.getPool().query("SELECT * FROM User");
    } catch (err) {
        console.log(err);
        return(err);
    }

};

/**
 * Checks if user is authorised to see account. If they are, will show username, given name, family name and email.
 * If user is not authorised will not show email.
 * @param userId
 * @param token
 * @param done
 * @returns {Promise<*>}
 */
exports.getSingleUser = async function(userId, token, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        //Checks if user is logged in
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            let fields = '';
            if (!isAuthorised) {
                fields = "username as username, given_name as givenName, family_name as familyName";
            }
            if (userId == currentUser) {
                fields = "username as username, given_name as givenName, family_name as familyName, email";
            }
            const sql = `SELECT ${fields} FROM User WHERE user_id = "${userId}"`;
            db.getPool().query(sql, function(err, result) {
                if (err) return done(500, "Internal server error", "Internal server error");
                if (result.length === 0) done(404, "Not Found", "Not Found");
                done(200, "OK", result[0]);
            });
        });
    });
};

/**
 * Create a new user in the database.
 * @param user
 * @returns {Promise<*>}
 */
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


exports.updateUser = async function (token, givenId, userValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function(isAuthorised) {
            //If current user is authorised to edit user.
            if(!isAuthorised) {
                return done(401, "Unauthorized");
            }
            if(!(currentUser == givenId)) {
                return done(403, "Forbidden");
            }
            let values = '';
            let isEmpty = true;
            if (userValues['username']) {
                if (!isEmpty) {
                    values = values + ", ";
                }
                values = values + `username = "${userValues.username}"`;
                isEmpty = false;
            }
            if (userValues['givenName']) {
                if (!isEmpty) {
                    values = values + ", ";
                }
                values = values + `given_name = "${userValues.givenName}"`;
                isEmpty = false;
            }
            if (userValues['familyName']) {
                if (!isEmpty) {
                    values = values + ", ";
                }
                values = values + `family_name = "${userValues.familyName}"`;
                isEmpty = false;

            }
            if (userValues['email']) {
                //Check the email contains a '@' character
                if (!userValues['email'].includes("@")) {
                    return done(400, "Bad Request");
                }
                if (!isEmpty) {
                    values = values + ", ";
                }
                values = values + `email = "${userValues.email}"`;
                isEmpty = false;

            }
            if (userValues['password']) {
                if (!isEmpty) {
                    values = values + ", ";
                }
                values = values + `password = "${userValues.password}"`;
            }
            const sql = `UPDATE User SET ${values} WHERE user_id = ${givenId}`;
            console.log(sql);
            db.getPool().query(sql, function(err, result) {
                if (err) return done(500, "Internal server error");
                done(200, "OK");
            });
        });
    });
};


exports.loginUser = async function (field, value, password, done) {
    let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

    // Check for valid credentials
    const checkSQL = `SELECT password FROM User WHERE ${field} = "${value}"`
    db.getPool().query(checkSQL, function(err, res) {
        if (err) return done(500, "Internal Server Error", "Internal Server Error");
        if (res.length === 0)  return done(400, "Bad Request", "Bad Request");
        let givenPassword = res[0].password;
        if (!(givenPassword === password)) return done(400, "Bad Request", "Bad Request");
        const sql = `UPDATE User SET auth_token = "${token}" WHERE ${field} = "${value}" AND password = "${password}"`;
        db.getPool().query(sql, function(err, res) {
            if (res.affectedRows === 0) return done(400, "Bad Request", "Bad Request");
            if (err) return done(500, "Internal Server Error", "Internal Server Error");
            help.getUserIdFromToken(token, function (userId) {
                if (userId) {
                    return done(200, "OK", {"userId": userId, "token": token});
                } else {
                    return done(500, "Internal Server Error", "Internal Server Error");
                }
            });
        });
    });
}

exports.logoutUser = function(token, done) {
    help.getUserIdFromToken(token, function(user) {
        help.checkAuthenticated(user, function(isAuthorised){
            if (!isAuthorised) {
                return done(401, "Unauthorized");
            }
            const sql = `UPDATE User SET auth_token = NULL WHERE user_id = "${user}"`;
            db.getPool().query(sql, function(err) {
                if (err) return done(500, "Internal server error");
                return done(200, "OK");
            });
        });
    });
};