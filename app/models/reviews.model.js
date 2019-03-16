const db = require('../../config/db');
const help = require('../lib/helpers');

exports.getAllReviews = async function(venueId) {
    try {
        const sqlStatement = `SELECT User.user_id, User.username, Review.review_body, Review.star_rating, Review.cost_rating, Review.time_posted FROM Review LEFT JOIN User ON (Review.review_author_id = User.user_id) WHERE reviewed_venue_id = ${venueId}`
        return await db.getPool().query(sqlStatement);
    } catch (err) {
        console.log(err);
        return(err);
    }
};
exports.getUserReviews = async function (userId, token, done) {
    help.getUserIdFromToken(token, function (currentUser) {
        //Checks if user is logged in
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            }
            const sqlStatement = `SELECT User.user_id, User.username, Review.review_body, Review.star_rating, Review.cost_rating, Review.time_posted, Venue.venue_id, Venue.venue_name, VenueCategory.category_name, Venue.city, Venue.short_description FROM Review LEFT JOIN User ON (Review.review_author_id = User.user_id) LEFT JOIN Venue ON (Review.reviewed_venue_id = Venue.venue_id) LEFT JOIN VenueCategory ON (Venue.category_id = VenueCategory.category_id) WHERE User.user_id = ${userId}`;
            db.getPool().query(sqlStatement, function (err, result) {
                if (err) return done(500, "Internal server error", "Internal server error");
                if (result.length === 0) done(404, "Not Found", "Not Found");
                if (result.length > 0) {
                    let i;
                    const list = [];
                    for (i=0; i < result.length; i++) {
                        const json_result = {
                            "reviewAuthor": {"userId": result[i].user_id, "username": result[i].username},
                            "reviewBody": result[i].review_body,
                            "starRating": result[i].star_rating,
                            "costRating": result[i].cost_rating,
                            "timePosted": result[i].time_posted,
                            "venue": {"venueId": result[i].venue_id, "venueName": result[i].venue_name,
                                "categoryName": result[i].category_name, "city": result[i].city, "shortDescription": result[i].short_description}
                        };
                        list.push(json_result);
                        return done(200, "OK", list);
                    }
                }
            });
        })
    })
};

exports.createReview = async function (token, venueId, reviewValues, done) {
    help.getUserIdFromToken(token, function(currentUser) {
        help.checkAuthenticated(currentUser, function (isAuthorised) {
            if (!isAuthorised) {
                return done(401, "Unauthorized", "Unauthorized");
            } else {
                const checkVenueAdmin = `SELECT admin_id FROM Venue WHERE venue_id = ${venueId}`
                db.getPool().query(checkVenueAdmin, function(err, result) {
                    if((currentUser == result[0].admin_id)) {
                        //console.log("THIS ONE");
                        return done(403, "Forbidden", "Forbidden");
                    } else {
                        const checkIfReviewed = `SELECT Review.reviewed_venue_id, Review.review_author_id From Review WHERE review_author_id = ${currentUser} AND reviewed_venue_id = ${venueId}`
                        db.getPool().query(checkIfReviewed, function(err, result) {
                            if(result.length == 0) {
                                let timePosted = new Date();
                                let dd = timePosted.getDate();
                                let mm = timePosted.getMonth()+1;
                                let yyyy = timePosted.getFullYear();
                                let hh = timePosted.getHours();
                                let min = timePosted.getMinutes();
                                let ss = timePosted.getSeconds();
                                if(mm<10) {
                                    mm='0'+mm;
                                }
                                if(dd<10) {
                                    dd='0'+dd;
                                }
                                if(hh<10) {
                                    hh='0'+hh;
                                }
                                if(min<10) {
                                    min='0'+min;
                                }
                                if(ss<10) {
                                    ss='0'+ss;
                                }
                                timePosted = yyyy + '-' + mm + '-' + dd + " " + hh + ":" + min + ":" + ss;

                                let fields = 'reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted';
                                let values = `"${venueId}", "${currentUser}", "${reviewValues.reviewBody}", "${reviewValues.starRating}", "${reviewValues.costRating}", "${timePosted}"`
                                const sql = `INSERT INTO Review (${fields}) VALUES (${values})`;
                                db.getPool().query(sql, function(err, result) {
                                    return done(201, "Created", "Created");
                                });
                            }
                            else {
                                return done(403, "Forbidden", "Forbidden");
                            }
                        });
                    }
                });
            }
        });
    });
};