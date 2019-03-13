const reviews = require('../controllers/reviews.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.getAllReviews);
        //.post(users.createUser);
}