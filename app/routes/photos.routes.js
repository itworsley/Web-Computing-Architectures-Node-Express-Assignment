const photos = require('../controllers/photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/photos')
        //.get(photos.getVenuePhoto)
        .post(photos.addPhotoToVenue)
        //.delete(photos.deletePhoto);
    app.route(app.rootUrl + '/users/:id/photo')
        .put(photos.addPhotoToUser)
        .get(photos.getUserPhoto)
        .delete(photos.deleteUserPhoto);
};