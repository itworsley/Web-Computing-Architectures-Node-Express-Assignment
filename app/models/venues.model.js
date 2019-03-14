const db = require('../../config/db');
const help = require('../lib/helpers');

exports.getAllVenues = async function () {
    try {
        return await db.getPool().query("SELECT * FROM Venue");
    } catch (err) {
        console.log(err);
        return(err);
    }

};

exports.getSingleVenue = async function(venueId) {
    try {
        return await db.getPool().query("SELECT Venue.venue_name, Venue.admin_id, User.username, Venue.category_id, VenueCategory.category_name, VenueCategory.category_description, Venue.city, Venue.short_description, Venue.long_description, Venue.date_added, Venue.address, Venue.latitude, Venue.longitude FROM Venue LEFT JOIN User ON (Venue.admin_id = User.user_id) LEFT JOIN VenueCategory ON (Venue.category_id = VenueCategory.category_id) WHERE venue_id = ?", venueId);
    } catch (err) {
        console.log(err);
        return(err);
    }
};

exports.createVenue = async function (token, venueValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            }
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

exports.updateVenue = function (token, venueId, venueValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized");
            }
            // Check that the user that is logged owns the venue
            const userSql = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`;
            db.getPool().query(userSql, function(err, result) {
                if (err) return done(500, "Internal server error");
                if (result.length === 0) return done(404, "Not Found");
                let venueAdmin = result[0].admin_id;
                if (!(venueAdmin == currentUser)) {
                    return done(403, "Forbidden");
                }
                let values = '';
                let isEmpty = true;
                if (venueValues['venueName']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `venue_name = "${venueValues.venueName}"`;
                    isEmpty = false;
                }
                if (venueValues['categoryId']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `category_id = "${venueValues.categoryId}"`;
                    isEmpty = false;
                }
                if (venueValues['city']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `city = "${venueValues.city}"`;
                    isEmpty = false;
                }
                if (venueValues['shortDescription']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `short_description = "${venueValues.shortDescription}"`;
                    isEmpty = false;
                }
                if (venueValues['longDescription']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `long_description = "${venueValues.longDescription}"`;
                    isEmpty = false;
                }
                if (venueValues['address']) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `address = "${venueValues.address}"`;
                    isEmpty = false;
                }
                if ((venueValues['latitude']) || (venueValues['latitude'] == 0)) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `latitude = "${venueValues.latitude}"`;
                    isEmpty = false;
                }
                if (venueValues['longitude'] || (venueValues['longitude'] == 0)) {
                    if (!isEmpty) {
                        values = values + ", ";
                    }
                    values = values + `longitude = "${venueValues.longitude}"`;
                }
                const sql = `UPDATE Venue SET ${values} WHERE venue_id = "${venueId}"`;
                db.getPool().query(sql, function(err, result) {
                    if (err) return done(500, "Internal server error");
                    done(200, "OK");
                });
            });
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