const db = require('../../config/db');
const help = require('../lib/helpers');

exports.getAllVenues = async function (searchParams, done) {
    let sqlStart = `SELECT DISTINCT Initial.venue_id, Initial.venue_name, Initial.category_id, Initial.city,Initial.short_description, Initial.latitude, Initial.longitude, Initial.meanStarRating, Initial.modeCostRating, Initial.primaryPhoto `;
    let sqlStatement1 = ` FROM (SELECT Venue.venue_id, Venue.venue_name, Venue.admin_id, Venue.category_id, Venue.city, Venue.short_description, Venue.latitude, Venue.longitude, `+
        `Review.star_rating, Review.cost_rating, (SELECT VenuePhoto.photo_filename FROM VenuePhoto WHERE VenuePhoto.venue_id = Venue.venue_id AND VenuePhoto.is_primary = 1) AS primaryPhoto, ` +
        `(SELECT AVG(Review.star_rating) FROM Review WHERE Review.reviewed_venue_id = Venue.venue_id) AS meanStarRating,` +
        `(SELECT DISTINCT ModeCostRating.mode_cost_rating FROM ModeCostRating WHERE ModeCostRating.venue_id = Venue.venue_id ORDER BY ModeCostRating.mode_cost_rating DESC LIMIT 1) AS modeCostRating `;
    if (searchParams['myLatitude'] || searchParams['myLongitude'] || (/^\s*$/.test(searchParams['myLatitude'])) || (/^\s*$/.test(searchParams['myLongitude']))) {
        if(help.checkLatLong(searchParams['myLatitude'], searchParams['myLongitude'])) {
            return done(400, "Bad Request", "Bad Request");
        } else {
            sqlStart += ', Initial.distance';
            sqlStatement1 += `, 111.111 *
             DEGREES(ACOS(LEAST(COS(RADIANS(Venue.latitude))
             * COS(RADIANS(${searchParams['myLatitude']}))
             * COS(RADIANS(Venue.longitude - ${searchParams['myLongitude']}))
             + SIN(RADIANS(Venue.latitude))
             * SIN(RADIANS(${searchParams['myLatitude']})), 1.0))) AS distance `
        }

    }
    let sqlStatement2 = `FROM Venue LEFT JOIN Review ON Review.reviewed_venue_id = Venue.venue_id) AS Initial WHERE Initial.venue_name LIKE CONCAT("%%")`;

    if (searchParams['city'] || (/^\s*$/.test(searchParams['city']))) {
        if(searchParams['city'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        sqlStatement2 += ` AND Initial.city = "${searchParams['city']}"`;
    }
    if (searchParams['q'] || (/^\s*$/.test(searchParams['q']))) {
        if(searchParams['q'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        sqlStatement2 += ` AND Initial.venue_name LIKE CONCAT("%${searchParams['q']}%")`;
    }
    if (searchParams['categoryId'] || (/^\s*$/.test(searchParams['categoryId']))) {
        if(searchParams['categoryId'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        if (isNaN(searchParams['categoryId'])) {
            return done(400, "Bad Request", "Bad Request");
        } else {
            sqlStatement2 += ` AND Initial.category_id = "${searchParams['categoryId']}"`;
        }
    }
    if (searchParams['adminId'] || (/^\s*$/.test(searchParams['adminId']))) {
        if(searchParams['adminId'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        if (isNaN(searchParams['adminId'])) {
            return done(400, "Bad Request", "Bad Request");
        } else {
            sqlStatement2 += ` AND Initial.admin_id = "${searchParams['adminId']}"`;
        }

    }
    if (searchParams['minStarRating'] || (/^\s*$/.test(searchParams['minStarRating']))) {
        if(searchParams['minStarRating'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        if (searchParams['minStarRating'] >=1 && searchParams['minStarRating']<=5) {
            sqlStatement2 += ` AND Initial.meanStarRating >= "${searchParams['minStarRating']}"`;
        } else {
            return done(400, "Bad Request", "Bad Request");
        }

    }
    if (searchParams['maxCostRating'] || (/^\s*$/.test(searchParams['maxCostRating']))) {
        if(searchParams['maxCostRating'].length===0) {
            return done(400, "Bad Request", "Bad Request");
        }
        if (searchParams['maxCostRating'] >=0 && searchParams['maxCostRating']<=4) {
            sqlStatement2 += ` AND Initial.modeCostRating <= "${searchParams['maxCostRating']}"`;
        } else {
            return done(400, "Bad Request", "Bad Request");
        }

    }
    //console.log(searchParams['reverseSort'] === 'false');
    //console.log(typeof(searchParams['sortBy']));
    if (searchParams['sortBy'] || (/^\s*$/.test(searchParams['sortBy']))) {
        let order = 'ASC';
        if (searchParams['reverseSort'] || (/^\s*$/.test(searchParams['reverseSort']))) {
            if(searchParams['reverseSort'].length===0) {
                return done(400, "Bad Request", "Bad Request");
            }
            if (searchParams['reverseSort'] === 'true' || searchParams['reverseSort'] === 'false') {
                if (searchParams['reverseSort'] === 'true') {
                    order = 'DESC';
                } else {
                    order = 'ASC';
                }
            } else {
                return done(400, "Bad Request", "Bad Request");
            }
        }
        if (searchParams['sortBy'] == 'DISTANCE') {
            if (!((searchParams['myLatitude']) && searchParams['myLongitude'])) {
                return done(400, "Bad Request", "Bad Request");
            } else {
                sqlStatement2 += ` ORDER BY Initial.${searchParams['sortBy']} ${order}`;
            }
        } else if (searchParams['sortBy'] == 'COST_RATING') {
            sqlStatement2 += ` ORDER BY Initial.modeCostRating ${order}`;
        } else if (searchParams['sortBy'] == 'STAR_RATING'){
            let dorder = 'DESC';
            if (searchParams['reverseSort'] == 'true') {
                dorder = 'ASC';
            } else {
                sqlStatement2 += ` ORDER BY Initial.meanStarRating ${dorder}`;
            }
        } else {
            return done(400, "Bad Request", "Bad Request");
        }
    }
    let sqlStatement = sqlStart + sqlStatement1 + sqlStatement2;
    if (searchParams['sortBy'] == undefined) {
        let order = 'DESC';
        if (searchParams['reverseSort'] || (/^\s*$/.test(searchParams['reverseSort']))) {
            if(searchParams['reverseSort'].length===0) {
                return done(400, "Bad Request", "Bad Request");
            }
            if (searchParams['reverseSort'] === 'true' || searchParams['reverseSort'] === 'false') {
                if (searchParams['reverseSort'] === 'true') {
                    order = 'ASC';
                } else {
                    order = 'DESC';
                }
            } else {
                return done(400, "Bad Request", "Bad Request");
            }
        }
        sqlStatement += ` ORDER BY Initial.meanStarRating ${order}`;
    }
    if (searchParams['startIndex']) {
        if (searchParams['count']) {
            sqlStatement += ` LIMIT ${searchParams['startIndex']}, ${searchParams['count']} `;
        } else {
            sqlStatement += ` LIMIT ${searchParams['startIndex']}, 99999999999 `;
        }
    }
    if (!searchParams['startIndex'] && searchParams['count']) {
        sqlStatement += ` LIMIT ${searchParams['count']}`;
    }
    db.getPool().query(sqlStatement, function (err, result) {
        if (err) return done(400, "Bad Request", "Bad Request");
        const list = [];
        for (let i = 0; i < result.length; i++) {
            if (searchParams['myLatitude'] && searchParams['myLongitude']) {
                const json_result = {
                    "venueId": result[i].venue_id, "venueName": result[i].venue_name, "categoryId": result[i].category_id, "city": result[i].city,
                    "shortDescription": result[i].short_description, "latitude": result[i].latitude, "longitude": result[i].longitude,
                    "meanStarRating": result[i].meanStarRating, "modeCostRating": result[i].modeCostRating, "primaryPhoto": result[i].primaryPhoto, "distance": result[i].distance
                };
                list.push(json_result);
            } else {
                const json_result = {
                    "venueId": result[i].venue_id, "venueName": result[i].venue_name, "categoryId": result[i].category_id, "city": result[i].city,
                    "shortDescription": result[i].short_description, "latitude": result[i].latitude, "longitude": result[i].longitude,
                    "meanStarRating": result[i].meanStarRating, "modeCostRating": result[i].modeCostRating, "primaryPhoto": result[i].primaryPhoto
                };
                list.push(json_result);
            }
        }
        done(200, "OK", list);
    });

};

exports.getSingleVenue = async function(venueId, done) {
    let sql = `SELECT Venue.venue_name, Venue.admin_id, User.username, Venue.category_id, VenueCategory.category_name, VenueCategory.category_description, Venue.city, Venue.short_description, Venue.long_description, Venue.date_added, Venue.address, Venue.latitude, Venue.longitude FROM Venue LEFT JOIN User ON (Venue.admin_id = User.user_id) LEFT JOIN VenueCategory ON (Venue.category_id = VenueCategory.category_id) WHERE venue_id = ${venueId}`;
    db.getPool().query(sql, function(err, result) {
        if (result.length == 0) {
            return done(404, "Not Found", "Not Found");
        } else {
            const sqlPhoto = `SELECT * FROM VenuePhoto WHERE VenuePhoto.venue_id = ${venueId} `
            db.getPool().query(sqlPhoto, function(err, res) {
                let photos = [];
                for (let i = 0; i < res.length; i++) {
                    let primary;
                    if (res[i].is_primary == "1") {
                        primary = true;
                    } else if (res[i].is_primary == "0") {
                        primary = false;
                    }
                    let photos_json = {"photoFilename": res[i].photo_filename, "photoDescription": res[i].photo_description, "isPrimary": primary}
                    photos.push(photos_json);
                }
                let json_result = {"venueName": result[0].venue_name, "admin": {"userId": result[0].admin_id, "username": result[0].username},
                    "category":{"categoryId": result[0].category_id, "categoryName": result[0].category_name.toString(), "categoryDescription": result[0].category_description.toString()},
                    "city": result[0].city.toString(), "shortDescription": result[0].short_description.toString(), "longDescription": result[0].long_description.toString(),
                    "dateAdded": result[0].date_added, "address": result[0].address.toString(), "latitude": result[0].latitude, "longitude": result[0].longitude, "photos": photos};
                return done(200, "OK", json_result);
            });
        }

    });
};

exports.createVenue = async function (token, venueValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                let dateAdded = new Date();
                let dd = dateAdded.getDate();
                let mm = dateAdded.getMonth()+1;
                let yyyy = dateAdded.getFullYear();
                if(mm<10) {
                    mm='0'+mm;
                }
                dateAdded = yyyy + '-' + mm + '-' + dd;
                if (typeof(venueValues.venueName) !== 'string' || typeof (venueValues.city) !== 'string' || typeof (venueValues.shortDescription) !== 'string' || typeof (venueValues.longDescription) !== 'string' || typeof (venueValues.address) !== 'string') {
                    return done(400, "Bad Request", "Bad Request");
                } else {
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
                }
            }
        });
    });
};

exports.updateVenue = function (token, venueId, venueValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            }
            else {
                // Check that the user that is logged owns the venue
                const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
                db.getPool().query(userSql, function(err, result) {
                    if (err) return done(500, "Internal server error");
                    if (result.length === 0) return done(404, "Not Found", "Not Found");
                    let venueAdmin = result[0].admin_id;
                    if (!(venueAdmin == currentUser)) {
                        return done(403, "Forbidden", "Forbidden");
                    } else {
                        let venueName = venueValues['venueName'];
                        let categoryId = venueValues['categoryId'];
                        let city = venueValues['city'];
                        let shortDescription = venueValues['shortDescription'];
                        let longDescription = venueValues['longDescription'];
                        let address = venueValues['address'];

                        let values = '';
                        let isEmpty = true;
                        if (venueName || (/^\s*$/.test(venueName))) {
                            if(typeof(venueName) !== 'string') {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `venue_name = "${venueName}"`;
                                isEmpty = false;
                            }

                        }
                        if (categoryId || (/^\s*$/.test(categoryId))) {
                            if(isNaN(categoryId)) {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `category_id = "${categoryId}"`;
                                isEmpty = false;
                            }

                        }
                        if (city || (/^\s*$/.test(city))) {
                            if(typeof(city) !== 'string') {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `city = "${city}"`;
                                isEmpty = false;
                            }
                        }
                        if (shortDescription || (/^\s*$/.test(shortDescription))) {
                            if(typeof(shortDescription) !== 'string') {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `short_description = "${shortDescription}"`;
                                isEmpty = false;
                            }
                        }
                        if (longDescription || (/^\s*$/.test(longDescription))) {
                            if(typeof(longDescription) !== 'string') {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `long_description = "${longDescription}"`;
                                isEmpty = false;
                            }
                        }
                        if (address || (/^\s*$/.test(address))) {
                            if(typeof(address) !== 'string') {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `address = "${address}"`;
                                isEmpty = false;
                            }
                        }
                        if ((venueValues['latitude']) || (venueValues['latitude'] == 0)) {
                            if(isNaN(venueValues['latitude'])) {
                                return done(400, "Bad Request", "Bad Request")
                            }
                            if((venueValues['latitude']) < -90 || (venueValues['latitude']) > 90) {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `latitude = "${venueValues.latitude}"`;
                                isEmpty = false;
                            }

                        }
                        if (venueValues['longitude'] || (venueValues['longitude'] == 0)) {
                            if(isNaN(venueValues['longitude'])) {
                                return done(400, "Bad Request", "Bad Request")
                            }
                            if (venueValues['longitude'] < -180 || venueValues['longitude'] > 180) {
                                return done(400, "Bad Request", "Bad Request")
                            } else {
                                if (!isEmpty) {
                                    values = values + ", ";
                                }
                                values = values + `longitude = "${venueValues.longitude}"`;
                            }

                        }
                        const sql = `UPDATE Venue SET ${values} WHERE venue_id = "${venueId}"`;
                        db.getPool().query(sql, function(err, result) {
                            if (err) return done(400, "Bad Request");
                            done(200, "OK", "OK");
                        });
                    }
                });
            }

        });
    });
};

exports.getCategories = async function () {
    try {
        return await db.getPool().query("SELECT * FROM VenueCategory");
    } catch (err) {
        console.log(err);
        return(err);
    }

};