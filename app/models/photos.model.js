const db = require('../../config/db');
const help = require('../lib/helpers');
const fs = require("fs");

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
                    //console.log(buffer);
                    const folderPath = "app/photos";
                    if (!fs.existsSync(folderPath)){
                        console.log("Directory Created");
                        fs.mkdirSync(folderPath);
                    }

                    let fileType = "";

                    if (request.headers['content-type']=='image/png') {
                        fileType = ".png"
                    } else if (request.headers['content-type']=='image/jpeg') {
                        fileType = ".jpeg"
                    } else {
                        return done(400, "Bad Request", "Bad Request");
                    }
                    fs.writeFile("app/photos/" + userId + fileType, buffer, function(err, data) {});
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
                                return done(200, "OK", "OK");
                            });
                        }
                    });
                });
            });
        }
    });
};

/*
exports.addPhotoToVenue = async function (token, venueId, venueValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            }
            const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
            db.getPool().query(userSql, function(err, res) {
                if (err) return done(500, "Internal Server Error");
                if (res.length === 0) return done(404, "Not Found", "Not Found");
                const venueAdmin = res[0].admin_id;
                if(!(venueAdmin == currentUser)) {
                    return done(401, "Unauthorized", "Unauthorized");
                }
                let imageName = `${auctionId}.png`;
                const photoCheckSql = `SELECT * FROM Venue WHERE auction_id = ${auctionId} AND auction_primaryphoto_URI = "${imageName}"`;

            });
            let dateAdded = new Date();
            let dd = dateAdded.getDate();
            let mm = dateAdded.getMonth()+1;
            let yyyy = dateAdded.getFullYear();
            if(mm<10) {
                mm='0'+mm;
            }
            dateAdded = yyyy + '-' + mm + '-' + dd;

            let fields = 'admin_id, category_id, venue_name, city, short_description, long_description, date_added, address, latitude, longitude';
            let values = `"${currentUser}", "${venueValues.categoryId}", "${venueValues.venueName}", "${venueValues.city}", "${venueValues.shortDescription}", "${venueValues.longDescription}",
                          "${dateAdded}", "${venueValues.address}", "${venueValues.latitude}", "${venueValues.longitude}"`;
            const sql = `INSERT INTO Venue (${fields}) VALUES (${values})`;
            db.getPool().query(sql, function(err, result) {
                if (err) return done(400, "Bad request", "Bad request");
                const conditions = `admin_id = "${currentUser}" AND category_id = "${venueValues.categoryId}" AND venue_name = "${venueValues.venueName}" AND ` +
                    `city = "${venueValues.city}" AND short_description = "${venueValues.shortDescription}" AND long_description = "${venueValues.longDescription}" AND date_added = "${dateAdded}" ` +
                    `AND address = "${venueValues.address}" AND latitude = "${venueValues.latitude}" AND longitude = "${venueValues.longitude}"`;
                const auctionSql = `SELECT MAX(venue_id) AS venue_id FROM Venue WHERE ${conditions}`;
                db.getPool().query(auctionSql, function (err, result) {
                    if (err || result.length === 0) return done(500, "Internal server error", "Internal server error");
                    done(201, "OK", {"venueId": result[0].venue_id});
                });
            });
        });
    });
};

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