const photos = require('../controllers/photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/photos')
        //.get(photos.getPhoto)
        .post(photos.addPhotoToVenue)
        //.delete(photos.deletePhoto);
    app.route(app.rootUrl + '/users/:id/photo')
        .put(photos.addPhotoToUser);
};