const photos = require('../controllers/photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/photos')
        .post(photos.addPhotoToVenue);
    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename')
        .get(photos.getVenuePhoto)
        .delete(photos.deleteVenuePhoto);
    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename/:setPrimary')
        .post(photos.setPrimary);
    app.route(app.rootUrl + '/users/:id/photo')
        .put(photos.addPhotoToUser)
        .get(photos.getUserPhoto)
        .delete(photos.deleteUserPhoto);
};