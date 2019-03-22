const venue = require('../controllers/venues.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venue.getAllVenues)
        .post(venue.createVenue);

    app.route(app.rootUrl + '/venues/:id')
        .get(venue.getSingleVenue)
        .patch(venue.updateVenue);

    app.route(app.rootUrl + '/categories')
        .get(venue.getCategories);
}

