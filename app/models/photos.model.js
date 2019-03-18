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
                    fs.writeFile("app/photos/users/user" + userId + fileType, buffer, function(err, data) {});
                    const checkUserPhotoSql = `SELECT profile_photo_filename FROM User WHERE user_id = ${userId}`
                    db.getPool().query(checkUserPhotoSql, function(err, result) {
                        // If there is no profile photo
                        if (result[0].profile_photo_filename == null) {
                            const addPhotoSql = `UPDATE User SET profile_photo_filename = "${userId + fileType}" WHERE user_id = ${userId}`;
                            db.getPool().query(addPhotoSql, function(err, result) {
                                if (err) return done(404, "Not Found", "Not Found");
                                done(201, "Created", "Created");
                            });
                        } else {
                            const updatePhotoSql = `UPDATE User SET profile_photo_filename = "${userId + fileType}" WHERE user_id = ${userId}`;
                            db.getPool().query(updatePhotoSql, function(err, result) {
                                if (err) return done(404, "Not Found", "Not Found");
                                done(200, "OK", "OK");
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
                if (err) return done(404, "Not Found", "Not Found");
                if (result[0].profile_photo_filename == null) {
                    return done(404, "Not Found", "Not Found");
                }
                let fileType = ""
                if(result[0].profile_photo_filename.includes("jpeg") || result[0].profile_photo_filename.includes("jpg")) {
                    fileType = "jpeg"
                } else if (result[0].profile_photo_filename.includes("png")) {
                    fileType = "png"
                } else {
                    return done(404, "Not Found", "Not Found");
                }
                fs.readFile("app/photos/" + result[0].profile_photo_filename, function(err, data) {
                    if (err) return done(404, "Not Found", "Not Found");
                    if (data == null) {
                        return done(404, "Not Found", "Not Found");
                    } else {
                        done(200, "OK", data, fileType);
                    }
                });
                //console.log(result);
                //done(200, "OK", photo);
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
                                    fs.unlink('app/photos/'+result[0].profile_photo_filename, function(err) {
                                        if (err) return done(404, "Not Found", "Not Found");
                                        return done(200, "OK", "OK");
                                    });
                                }

                                //if (err) return done(404, "Not Found", "Not Found");
                                //return done(200, "OK", "OK");
                            });
                        }
                    });
                });
            });
        }
    });
};


exports.addPhotoToVenue = async function (token, venueId, req, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
                db.getPool().query(userSql, function (err, res) {
                    if (err) return done(500, "Internal Server Error");
                    if (res.length === 0) return done(404, "Not Found", "Not Found");
                    const venueAdmin = res[0].admin_id;
                    if (!(venueAdmin == currentUser)) {
                        return done(401, "Unauthorized", "Unauthorized");
                    } else {
                        let form = new formidable.IncomingForm();
                        form.parse(req, function(err, fields, files) {
                            let description = Object.values(fields)[0];
                            console.log("DESCRIPTION: " + description);
                        });
                        form.on('end', function(fields, files) {
                            console.log(fields);
                            const imageType = this.openedFiles[0].type;
                            const temp_path = this.openedFiles[0].path;
                            const incoming = this._events;
                            console.log("INCOMING: \n", incoming);
                            const events = incoming.field[0];
                            console.log("EVENTS: \n",  typeof(events));
                            const description = "";
                            console.log(description);

                            const folderPath1 = "app/photos";
                            const folderPath2 = "app/photos/venues";
                            if (!fs.existsSync(folderPath1)){
                                fs.mkdirSync(folderPath1);
                                if(!fs.existsSync(folderPath2)) {
                                    fs.mkdirSync(folderPath2);
                                }
                            } else if (!fs.existsSync(folderPath2)){
                                fs.mkdirSync(folderPath2);
                            }
                            let type = "";
                            if (imageType == "image/png") {
                                type = '.png'
                            } else if (imageType == "image/jpeg") {
                                type = '.jpeg'
                            } else {
                                return done(400, "Bad Request", "Bad Request");
                            }
                            const newFilePath = 'app/photos/venues/venue';
                            const newFileName = newFilePath + venueId + type
                            fs.copyFile(temp_path, newFileName, function(err) {
                                if (err) {
                                    return done(400, "Bad Request", "Bad Request");
                                } else {
                                    const sqlQuery = `INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description) VALUES (${venueId}, ${newFileName},  )`
                                    return done(201, "Created", "Created");
                                }
                            })


                        })
                        //console.log(Object.values(files));
                        //const buffer = new Buffer(files);
                        //console.log(buffer);
                        // const folderPath = "app/photos/venues";
                        // if (!fs.existsSync(folderPath)){
                        //     fs.mkdirSync(folderPath);
                        // }
                        //
                        // let fileType = "";
                        //
                        // if (request.headers['content-type']=='image/png') {
                        //     fileType = ".png"
                        // } else if (request.headers['content-type']=='image/jpeg') {
                        //     fileType = ".jpeg"
                        // } else {
                        //     return done(400, "Bad Request", "Bad Request");
                        // }
                        // fs.writeFile("app/photos/venues" + userId + fileType, buffer, function(err, data) {});
                        // console.log(description);
                        // console.log(files);
                        // console.log(Object.values(files))
                    }
                });
            }
        });
    });
};
/*
exports.postPhoto = function(token, auctionId, req, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorised", "Unauthorised");
            }
            const userSql = `SELECT auction_userid, auction_startingdate FROM auction WHERE auction_id = ${auctionId}`;
            db.getPool().query(userSql, function(err, result) {
                if (err) return done(500, "Internal server error", "Internal server error");
                if (result.length === 0) return done(404, "Not Found", "Not Found");
                let auctionCreator = result[0].auction_userid;
                if (!(auctionCreator == currentUser)) {
                    return done(401, "Unauthorised", "Unauthorised");

                }
                // Check auction has not started
                let startDate = Date.parse(result[0].auction_startingdate);
                let currentDate = datetime.create().format('Y-m-d H:M:S');
                if (startDate < Date.parse(currentDate)) {
                    return done(400, "Bad request", "Bad request - Forbidden");
                }
                // Check there is not already an image for the auction
                let imageName = `${auctionId}.png`;
                const photoCheckSql = `SELECT * FROM auction WHERE auction_id = ${auctionId} AND auction_primaryphoto_URI = "${imageName}"`;
                db.getPool().query(photoCheckSql, function(err, result) {
                    if (err) return done(500, "Internal server error", "Internal server error");
                    if (!(result.length === 0)) return done(400, "Bad request", "Bad request - you must delete the old photo before adding a new one");
                    let writeError = false;
                    try {
                        req.pipe(fs.createWriteStream(`./app/photos/${imageName}`));
                    }
                    catch(err) {
                        writeError = true;
                        imageName = 'default.png';
                    } finally {
                        const sql = `UPDATE auction SET auction_primaryphoto_URI = "${imageName}" WHERE auction_id = ${auctionId}`;
                        db.getPool().query(sql, function(err, result) {
                            if (err) return done(500, "Internal server error", "Internal server error");
                            if (writeError) return done(500, "Internal server error", "Internal server error");
                            return done(201, "OK", "OK");
                        });
                    }
                });
            });
        });
    });
};
*/