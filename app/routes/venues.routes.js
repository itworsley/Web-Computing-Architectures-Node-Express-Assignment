const venue = require('../controllers/venues.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venue.getAllVenues)
        //.post(venue.createVenue);

    app.route(app.rootUrl + '/venues/:venueId')
        .get(venue.getSingleVenue)
    //.patch(users.updateUser);
    //.delete(users.delete);
}

