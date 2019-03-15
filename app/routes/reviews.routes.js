const reviews = require('../controllers/reviews.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.getAllReviews)
        .post(reviews.createReview);

    app.route(app.rootUrl + '/users/:id/reviews')
        .get(reviews.getUserReviews)

}