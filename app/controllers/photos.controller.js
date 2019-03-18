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
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        Photo.addPhotoToVenue(token, venueId, req, function (statusCode, statusMessage, result) {
            res.statusMessage = statusMessage;
            res.status(statusCode).send(result);
        });
    }
};

exports.addPhotoToUser = async function(req, res) {
    let token = req.header("X-Authorization");
    let userId =  req.params.id;
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        Photo.addPhotoToUser(token, userId, req, function (statusCode, statusMessage, result) {
            res.statusMessage = statusMessage;
            res.status(statusCode).send(result);
        });
    }
};

exports.getUserPhoto = async function(req, res) {
    let userId =  req.params.id;
    Photo.getUserPhoto(userId, req, function(statusCode, statusMessage, result, fileType) {
        res.statusMessage = statusMessage;
        res.setHeader('Content-Type', 'image/'+fileType);
        res.status(statusCode).end(result);
    });
};

exports.deleteUserPhoto = async function(req, res) {
    let token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        let userId = req.params.id;
        Photo.deleteUserPhoto(token, userId, function (statusCode, statusMessage) {
            res.statusMessage = statusMessage;
            res.status(statusCode).send(statusMessage);
        });
    }
};