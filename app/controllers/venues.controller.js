const Venue = require('../models/venues.model');

exports.getAllVenues = async function (req, res) {
    const sqlCommand = String(req.body);
    try {
        const results = await Venue.getAllVenues(sqlCommand);
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.getSingleVenue = async function (req, res) {
    const sqlCommand = String(req.body);
    const id = req.params.venueId;
    try {
        const results = await Venue.getSingleVenue(id, sqlCommand);
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};