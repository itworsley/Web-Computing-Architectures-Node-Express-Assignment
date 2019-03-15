const Photo = require('../models/photos.model');
const fs = require("fs");


exports.addPhotoToVenue = async function(req, res) {
    // Check if all fields are supplied
    if(req.body.length != 3) {
        res.statusMessage = "Bad Request";
        return res.status(400).json();
    }
    let token = req.header("X-Authorization");
    let venueId =  req.params.id;
    Photo.addPhotoToVenue(token, venueId, req, function(statusCode, statusMessage, result) {
        res.statusMessage = statusMessage;
        res.status(statusCode).send(result);
    });
};

exports.addPhotoToUser = async function(req, res) {
    let token = req.header("X-Authorization");
    let userId =  req.params.id;
    Photo.addPhotoToUser(token, userId, req, function(statusCode, statusMessage, result) {
        res.statusMessage = statusMessage;
        res.status(statusCode).send(result);
    });
}