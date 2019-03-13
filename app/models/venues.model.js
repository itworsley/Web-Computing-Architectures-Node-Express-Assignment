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
        return await db.getPool().query("SELECT Venue.venue_name, Venue.admin_id, User.username, Venue.category_id, VenueCategory.category_name, VenueCategory.category_description, Venue.city, Venue.short_description, Venue.long_description, Venue.date_added, Venue.address, Venue.latitude, Venue.longitude FROM Venue LEFT JOIN User ON (Venue.admin_id = User.user_id) LEFT JOIN VenueCategory ON (Venue.category_id = VenueCategory.category_id) WHERE venue_id = ?", venueId);
    } catch (err) {
        console.log(err);
        return(err);
    }
};

exports.createVenue = async function (venue) {
    let values = [venue];
    try {
        return await db.getPool().query('INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude) VALUES ?', values)
    } catch (err) {
        console.log(err);
        return (err);
    }
};

/**
 SELECT Venue.venue_name, Venue.admin_id, User.username, Venue.category_id, VenueCategory.category_name, VenueCategory.category_description, Venue.city, Venue.short_description, Venue.long_description, Venue.date_added, Venue.address, Venue.latitude, Venue.longitude FROM Venue LEFT JOIN User ON (Venue.admin_id = User.user_id) LEFT JOIN VenueCategory ON (Venue.category_id = VenueCategory.category_id)
 */

exports.getCategories = async function () {
    try {
        return await db.getPool().query("SELECT * FROM VenueCategory");
    } catch (err) {
        console.log(err);
        return(err);
    }

};