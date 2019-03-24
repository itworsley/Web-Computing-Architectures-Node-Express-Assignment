const db = require('../../config/db');
const help = require('../lib/helpers');
const fs = require("fs");
const formidable = require('formidable');

exports.addPhotoToUser = async function (token, userId, request, done) {
    const checkUserExists = `SELECT user_id FROM User WHERE user_id = "${userId}"`;
    db.getPool().query(checkUserExists, function(err, result) {
        if(result[0] == undefined) {
            return done(404, "Not Found", "Not Found");
        } else {
            help.getUserIdFromToken(token, function(currentUser) {
                help.checkAuthenticated(currentUser, function (isAuthorised) {
                    if (!isAuthorised) {
                        return done(401, "Unauthorized", "Unauthorized");
                    }
                    if((currentUser !=userId)) {
                        return done(403, "Forbidden", "Forbidden");
                    }

                    const buffer = new Buffer(request.body);
                    const folderPath1 = "app/photos";
                    const folderPath2 = "app/photos/users";
                    if (!fs.existsSync(folderPath1)){
                        fs.mkdirSync(folderPath1);
                        if(!fs.existsSync(folderPath2)) {
                            fs.mkdirSync(folderPath2);
                        }
                    } else if(!fs.existsSync(folderPath2)) {
                        fs.mkdirSync(folderPath2);
                    }

                    let fileType = "";

                    if (request.headers['content-type']=='image/png') {
                        fileType = ".png"
                    } else if (request.headers['content-type']=='image/jpeg') {
                        fileType = ".jpeg"
                    } else {
                        return done(400, "Bad Request", "Bad Request");
                    }

                    const newFilePath = 'app/photos/users/';
                    let newFileName = "user" + userId + fileType;

                    fs.writeFile(newFilePath + newFileName, buffer, function(err, data) {});
                    const checkUserPhotoSql = `SELECT profile_photo_filename FROM User WHERE user_id = ${userId}`
                    db.getPool().query(checkUserPhotoSql, function(err, result) {
                        // If there is no profile photo
                        if (result[0].profile_photo_filename == null) {
                            const addPhotoSql = `UPDATE User SET profile_photo_filename = "${newFileName}" WHERE user_id = ${userId}`;
                            db.getPool().query(addPhotoSql, function(err, result) {
                                if (err) return done(404, "Not Found", "Not Found");
                                done(201, "Created", "Created");
                            });
                        } else {
                            const updatePhotoSql = `UPDATE User SET profile_photo_filename = "${newFileName}" WHERE user_id = ${userId}`;
                            db.getPool().query(updatePhotoSql, function(err, resx) {
                                if (fileType ===".png") {
                                    if (result[0].profile_photo_filename.includes(".jpeg")) {
                                        fs.unlink(`app/photos/users/user${userId}.jpeg`, function(err) {
                                            if (err) return done(404, "Not Found", "XXX");
                                            done(200, "OK", "OK");
                                        });
                                    } else {
                                        done(200, "OK", "OK");
                                    }
                                }
                                if (fileType === ".jpeg") {
                                    if (result[0].profile_photo_filename.includes(".png")) {
                                        fs.unlink(`app/photos/users/user${userId}.png`, function(err) {
                                            if (err) return done(404, "Not Found", "XXY");
                                            done(200, "OK", "OK");
                                        });
                                    } else {
                                        done(200, "OK", "OK");
                                    }

                                }
                            });
                        }
                    });

                });

            });
        }
    });

};

exports.getUserPhoto = async function (userId, request, done) {
    const checkUserSql = `SELECT * From User WHERE user_id = "${userId}"`;
    db.getPool().query(checkUserSql, function(err, result) {
        if (result.length == 0) {
            return done(404, "Not Found", "Not Found");
        } else {
            const sql = `SELECT profile_photo_filename FROM User WHERE user_id = "${userId}"`;
            db.getPool().query(sql, function(err, result) {
                if (err) {
                    return done(404, "Not Found", "Not Found");
                } else {
                    if (result[0].profile_photo_filename == null) {
                        return done(404, "Not Found", "Not Found");
                    }
                    let fileType = "";
                    if(result[0].profile_photo_filename.includes("jpeg") || result[0].profile_photo_filename.includes("jpg")) {
                        fileType = "jpeg"
                    } else if (result[0].profile_photo_filename.includes("png")) {
                        fileType = "png"
                    } else {
                        return done(404, "Not Found", "Not Found");
                    }
                    fs.readFile("app/photos/users/" + result[0].profile_photo_filename, function(err, data) {
                        if (err) return done(404, "Not Found", "NOT FOUND");
                        if (data == null) {
                            return done(404, "Not Found", "Not Found");
                        } else {
                            done(200, "OK", data, fileType);
                        }
                    });
                }

            });
        }
    });
};

exports.deleteUserPhoto = function(token, userId, done) {
    const checkUserExists = `SELECT user_id FROM User WHERE user_id = "${userId}"`;
    db.getPool().query(checkUserExists, function(err, result) {
        if (result[0] == undefined) {
            return done(404, "Not Found", "Not Found");
        } else {
            help.getUserIdFromToken(token, function (currentUser) {
                help.checkAuthenticated(currentUser, function (isAuthorised) {
                    if (!isAuthorised) {
                        return done(401, "Unauthorized", "Unauthorized");
                    }
                    if ((currentUser != userId)) {
                        return done(403, "Forbidden", "Forbidden");
                    }
                    const checkUserPhoto = `SELECT profile_photo_filename FROM User WHERE user_id = "${userId}"`;
                    db.getPool().query(checkUserPhoto, function (err, result) {
                        if (result[0].profile_photo_filename == null) {
                            return done(404, "Not Found", "Not Found");
                        } else {
                            const sql = `UPDATE User SET profile_photo_filename = NULL WHERE user_id = "${userId}"`;
                            db.getPool().query(sql, function (err) {
                                if (err) return done(404, "Not Found", "Not Found");
                                else {
                                    fs.unlink('app/photos/users/'+result[0].profile_photo_filename, function(err) {
                                        if (err) return done(404, "Not Found", "Not Found");
                                        return done(200, "OK", "OK");
                                    });
                                }
                            });
                        }
                    });
                });
            });
        }
    });
};


exports.addPhotoToVenue = async function (token, venueId, req, done) {
    help.getUserIdFromToken(token, function (currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
                db.getPool().query(userSql, function (err, res) {
                    if (err) return done(500, "Internal Server Error");
                    if (res.length === 0) return done(404, "Not Found", "Not Found");
                    let venueAdmin = res[0].admin_id;
                    if (!(venueAdmin == currentUser)) {
                        return done(403, "Forbidden", "Forbidden");
                    } else {
                        let fields = [];
                        let newFileName = "";
                        new formidable.IncomingForm().parse(req)
                            .on('fileBegin', function () {
                                const folderPath1 = "app/photos";
                                const folderPath2 = "app/photos/venues";
                                if (!fs.existsSync(folderPath1)) {
                                    fs.mkdirSync(folderPath1);
                                    if (!fs.existsSync(folderPath2)) {
                                        fs.mkdirSync(folderPath2);
                                    }
                                } else if (!fs.existsSync(folderPath2)) {
                                    fs.mkdirSync(folderPath2);
                                }
                            })
                            .on('file', function (name, file) {
                                const imageType = file.type;
                                const temp_path = file.path;
                                let type = "";
                                console.log(imageType);
                                if (imageType === "image/png") {
                                    type = '.png'
                                } else if (imageType === "image/jpeg") {
                                    type = '.jpeg'
                                } else {
                                    return done(400, "Bad Request", "Bad Request");
                                }
                                const newFilePath = 'app/photos/venues/';
                                const random = Math.floor((Math.random() * 1000000) + 1);
                                newFileName = "venue" + venueId + "_" + random + "_" + type;
                                const newFileFull = newFilePath + newFileName;
                                fs.copyFile(temp_path, newFileFull, function (err) {
                                    if (err) {
                                        return done(400, "Bad Request", "Bad Request");
                                    }
                                });
                            })
                            .on('field', function (name, field) {
                                fields.push(field);
                            })
                            .on('error', function() {
                                return done (400, "Bad Request", "Bad Request")
                            })
                            .on('end', function (name, field) {
                                if (fields.length !== 0) {
                                    const description = fields[0];

                                    const checkSql = `SELECT * FROM VenuePhoto WHERE venue_id = ${venueId} AND is_primary = 1`;
                                    db.getPool().query(checkSql, function (err, result) {
                                        if (result.length === 0) {
                                            const sqlQuery = `INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (${venueId}, "${newFileName}", "${description}", 1)`;
                                            db.getPool().query(sqlQuery, function (err) {
                                                if (err) {return done(400, "Bad Request", "Bad Request");}
                                                return done (201, "Created", "Created");
                                            });
                                        } else {
                                            if(fields[1] === "true") {
                                                const updateSql = `UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ${result[0].venue_id} AND photo_filename = "${result[0].photo_filename}"`;
                                                db.getPool().query(updateSql, function (err) {
                                                    if (err) return done(400, "Bad Request", "Bad Request");
                                                    const sqlQuery = `INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (${venueId}, "${newFileName}", "${description}", 1)`;
                                                    db.getPool().query(sqlQuery, function (err) {
                                                        if (err) {return done(400, "Bad Request", "Bad Request");}
                                                        return done (201, "Created", "Created");
                                                    });
                                                });
                                            } else if (fields[1] === "false"){
                                                const sqlQuery = `INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (${venueId}, "${newFileName}", "${description}", 0)`;
                                                db.getPool().query(sqlQuery, function (err) {
                                                    if (err) {return done(400, "Bad Request", "Bad Request");}
                                                    return done (201, "Created", "Created");
                                                });
                                            } else {
                                                return done (400, "Bad Request", "Bad Request")
                                            }
                                        }
                                    });
                                } else {
                                    return done (400, "Bad Request", "Bad Request")
                                }
                            });

                    }
                });
            }
        });
    });
};

exports.getVenuePhoto = async function (venueId, fileName, done) {
    const checkVenueSql = `SELECT * From VenuePhoto WHERE venue_id = "${venueId}"`;
    db.getPool().query(checkVenueSql, function(err, result) {
        if (result.length == 0) {
            return done(404, "Not Found", "Not Found");
        } else {
            const sql = `SELECT photo_filename FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`;
            db.getPool().query(sql, function(err, result) {
                if (err) return done(404, "Not Found", "Not Found");
                if (result[0] === undefined) {
                    return done(404, "Not Found", "Not Found");
                } else {
                    let fileType = "";
                    if(result[0].photo_filename.includes("jpeg") || result[0].photo_filename.includes("jpg")) {
                        fileType = "jpeg"
                    } else if (result[0].photo_filename.includes("png")) {
                        fileType = "png"
                    } else {
                        return done(404, "Not Found", "Not Found");
                    }
                    fs.readFile("app/photos/venues/" + result[0].photo_filename, function(err, data) {
                        if (err) return done(404, "Not Found", "Not Found");
                        if (data == null) {
                            return done(404, "Not Found", "Not Found");
                        } else {
                            done(200, "OK", data, fileType);
                        }
                    });
                }

            });
        }
    });
};


exports.deleteVenuePhoto = function(token, venueId, fileName, done) {
    const checkVenueExists = `SELECT venue_id FROM Venue WHERE venue_id = "${venueId}"`;
    db.getPool().query(checkVenueExists, function(err, result) {
        if (result[0] == undefined) {
            return done(404, "Not Found", "Not Found");
        } else {
            help.getUserIdFromToken(token, function (currentUser) {
                help.checkAuthenticated(currentUser, function (isAuthorised) {
                    if (!isAuthorised) {
                        return done(401, "Unauthorized", "Unauthorized");
                    } else {
                        const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
                        db.getPool().query(userSql, function (err, res) {
                            if (err) return done(500, "Internal Server Error");
                            if (res.length === 0) return done(404, "Not Found", "Not Found");
                            let venueAdmin = res[0].admin_id;
                            if (!(venueAdmin == currentUser)) {
                                return done(403, "Forbidden", "Forbidden");
                            } else {
                                const checkVenuePhoto = `SELECT photo_filename FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`;
                                db.getPool().query(checkVenuePhoto, function (err, result) {
                                    if (result == 0) {
                                        return done(404, "Not Found", "Not Found");
                                    } else {
                                        const checkPrimary = `SELECT is_primary FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`
                                        db.getPool().query(checkPrimary, function (err, result) {
                                            if (err) return done(404, "Not Found", "Not Found");
                                            if (result[0].is_primary == "1") {
                                                const getOtherPhotos = `SELECT photo_filename FROM VenuePhoto WHERE venue_id = "${venueId}"`;
                                                db.getPool().query(getOtherPhotos, function (err, result) {
                                                    if (result.length == 1) {
                                                        const sql = `DELETE FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`;
                                                        db.getPool().query(sql, function (err, result) {
                                                            if (err) return done(404, "Not Found", "Not Found");
                                                            fs.unlink('app/photos/venues/'+fileName, function(err) {
                                                                if (err) return done(404, "Not Found", "Not Found");
                                                                return done(200, "OK", "OK");
                                                            });
                                                        });
                                                    } else {
                                                        let newPrimaryName = "";
                                                        for (let i = 0; i<result.length;i++) {
                                                            if (result[i].photo_filename != fileName) {
                                                                newPrimaryName = result[i].photo_filename;
                                                            }
                                                        }
                                                        const setNewPrimary = `UPDATE VenuePhoto SET is_primary = "1" WHERE venue_id = "${venueId}" AND photo_filename = "${newPrimaryName}"`;
                                                        db.getPool().query(setNewPrimary, function (err) {
                                                            if (err) return done(404, "Not Found", "Not Found");
                                                            const sql = `DELETE FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`;
                                                            db.getPool().query(sql, function (err, result) {
                                                                if (err) return done(404, "Not Found", "Not Found");
                                                                fs.unlink('app/photos/venues/'+fileName, function(err) {
                                                                    if (err) return done(404, "Not Found", "Not Found");
                                                                    return done(200, "OK", "OK");
                                                                });
                                                            });
                                                        });
                                                    }
                                                });
                                            } else {
                                                const sql = `DELETE FROM VenuePhoto WHERE venue_id = "${venueId}" AND photo_filename = "${fileName}"`;
                                                db.getPool().query(sql, function (err, result) {
                                                    if (err) return done(404, "Not Found", "Not Found");
                                                    fs.unlink('app/photos/venues/'+fileName, function(err) {
                                                        if (err) return done(404, "Not Found", "Not Found");
                                                        return done(200, "OK", "OK");
                                                    });
                                                });
                                            }
                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
};

exports.setPrimary = async function (token, venueId, fileName, done) {
    help.getUserIdFromToken(token, function (currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
                db.getPool().query(userSql, function (err, res) {
                    if (err) return done(500, "Internal Server Error");
                    if (res.length === 0) return done(404, "Not Found", "Not Found");
                    let venueAdmin = res[0].admin_id;
                    if (!(venueAdmin == currentUser)) {
                        return done(403, "Forbidden", "Forbidden");
                    } else {
                        const checkFile = `SELECT * FROM VenuePhoto WHERE venue_id = ${venueId} AND photo_filename = "${fileName}"`;
                        db.getPool().query(checkFile, function (err, res) {
                            if (res.length == 0) {
                                return done(404, "Not Found", "Not Found");
                            } else {
                                const setZero = `UPDATE VenuePhoto SET is_primary = "0" WHERE venue_id = ${venueId}`;
                                db.getPool().query(setZero, function (err, res) {
                                    if (err) return done(404, "Not Found", "Not Found");
                                    const setPrimary = `UPDATE VenuePhoto SET is_primary = "1" WHERE venue_id = ${venueId} AND photo_filename = "${fileName}"`;
                                    db.getPool().query(setPrimary, function (err, res) {
                                        if (err) return done(404, "Not Found", "Not Found");
                                        return done(200, "OK", "OK");
                                    });
                                });
                            }
                        });

                    }
                });
            }
        });
    });
};


