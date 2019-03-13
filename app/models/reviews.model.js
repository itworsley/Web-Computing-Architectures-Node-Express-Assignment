const db = require('../../config/db');

exports.getAllReviews = async function(venueId) {
    try {
        const sqlStatement = `SELECT User.user_id, User.username, Review.review_body, Review.star_rating, Review.cost_rating, Review.time_posted FROM Review LEFT JOIN User ON (Review.review_author_id = User.user_id) WHERE reviewed_venue_id = ${venueId}`
        return await db.getPool().query(sqlStatement);
    } catch (err) {
        console.log(err);
        return(err);
    }
};