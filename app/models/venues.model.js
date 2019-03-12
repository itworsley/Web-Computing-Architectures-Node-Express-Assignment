const db = require('../../config/db');

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
        return await db.getPool().query("SELECT venue_name, (SELECT user_id, username FROM User WHERE user_id=admin_id)AS admin FROM Venue WHERE venue_id = ?", venueId);
    } catch (err) {
        console.log(err);
        return(err);
    }
};