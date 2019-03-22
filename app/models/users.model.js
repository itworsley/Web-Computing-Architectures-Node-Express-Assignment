const db = require('../../config/db');
const help = require('../lib/helpers');
const passwordHash = require('password-hash');
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
            if (userId != currentUser) {
                fields = "username as username, given_name as givenName, family_name as familyName";
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
 * @returns {Promise<*>}
 * @param userData
 * @param done
 */
exports.createUser = async function (userData, done) {
    const username = userData.username;
    const email = userData.email;
    const givenName = userData.givenName;
    const familyName = userData.familyName;
    const password = userData.password;

    let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    if (!username || (/^\s*$/.test(username))) {
        return done(400, "Bad Request", "Bad Request");
    }
    if (!re.test(email)) {
        return done(400, "Bad Request", "Bad Request");
    }
    if (!givenName || (/^\s*$/.test(givenName))) {
        return done(400, "Bad Request", "Bad Request");
    }
    if (!familyName || (/^\s*$/.test(familyName))) {
        return done(400, "Bad Request", "Bad Request");
    }
    if (!password || (/^\s*$/.test(password))) {
        return done(400, "Bad Request", "Bad Request");
    }

    const checkUserSql = `SELECT * FROM User WHERE username = "${username}"`;
    db.getPool().query(checkUserSql, function(err, result) {
        if (result.length !== 0) {
            return done(400, "Bad Request", "Bad Request");
        }
        else {
            const hashPassword = passwordHash.generate(password);
            const addUserSql = `INSERT INTO User (username, email, given_name, family_name, password) VALUES ("${username}", "${email}", "${givenName}", "${familyName}", "${hashPassword}")`;
            db.getPool().query(addUserSql, function(err, result) {
                if (err) return done(400, "Bad request", "Bad request");
                const conditions = `SELECT user_id FROM User WHERE username = "${username}"`;
                db.getPool().query(conditions, function(err, result) {
                    if (err) return done(400, "Bad request", "Bad request");
                    const userId = result[0].user_id;
                    return done(201, "Created", {"userId": userId});
                });
            });
        }
    });
};

exports.updateUser = async function (token, givenId, userValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function(isAuthorised) {
            //If current user is authorised to edit user.
            if(!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                if(!(currentUser == givenId)) {
                    return done(403, "Forbidden", "Forbidden");
                } else {
                    let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
                    // Checks all fields are not empty
                    for (const value in userValues) {
                        if (userValues[value].length === 0) {
                            return done(400, "Bad Request", "Bad Request");
                        }
                    }
                    let values = '';
                    let isEmpty = true;
                    if (userValues['username']) {
                        if(typeof(userValues['username']) !== 'string') {
                            return done(400, "Bad Request", "Bad Request");
                        } else {
                            if (!isEmpty) {
                                values = values + ", ";
                            }
                            values = values + `username = "${userValues.username}"`;
                            isEmpty = false;
                        }

                    }
                    if (userValues['givenName']) {
                        if(typeof(userValues['givenName']) !== 'string') {
                            return done(400, "Bad Request", "Bad Request");
                        } else {
                            if (!isEmpty) {
                                values = values + ", ";
                            }
                            values = values + `given_name = "${userValues.givenName}"`;
                            isEmpty = false;
                        }

                    }
                    if (userValues['familyName']) {
                        if(typeof(userValues['familyName']) !== 'string') {
                            return done(400, "Bad Request", "Bad Request");
                        } else {
                            if (!isEmpty) {
                                values = values + ", ";
                            }
                            values = values + `family_name = "${userValues.familyName}"`;
                            isEmpty = false;
                        }

                    }
                    if (userValues['email']) {
                        if(typeof(userValues['email']) !== 'string') {
                            return done(400, "Bad Request", "Bad Request");
                        } else {
                            //Check the email contains a '@' character
                            if (!re.test(userValues['email'])) {
                                return done(400, "Bad Request", "Bad Request");
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `email = "${userValues.email}"`;
                                isEmpty = false;
                            }
                        }
                    }
                    if (userValues['password']) {
                        if(typeof(userValues['password']) !== 'string') {
                            return done(400, "Bad Request", "Bad Request");
                        } else {
                            if (!isEmpty) {
                                values = values + ", ";
                            }
                            values = values + `password = "${passwordHash.generate(userValues.password)}"`;
                        }
                    }
                    const sql = `UPDATE User SET ${values} WHERE user_id = ${givenId}`;
                    db.getPool().query(sql, function(err, result) {
                        if (err && (err.code === 'ER_DUP_ENTRY')) return done(400, "Bad Request", "Bad Request");
                        done(200, "OK", "OK");
                    });
                }
            }
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
        if ((passwordHash.verify(password, givenPassword)) || password == givenPassword) {
            const sql = `UPDATE User SET auth_token = "${token}" WHERE ${field} = "${value}" AND password = "${givenPassword}"`;
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

        } else {
            return done(400, "Bad Request", "Bad Request");
        }
    });
}

exports.logoutUser = function(token, done) {
    help.getUserIdFromToken(token, function(user) {
        help.checkAuthenticated(user, function(isAuthorised){
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            }
            const sql = `UPDATE User SET auth_token = NULL WHERE user_id = "${user}"`;
            db.getPool().query(sql, function(err) {
                if (err) return done(500, "Internal server error");
                return done(200, "OK", "OK");
            });
        });
    });
};