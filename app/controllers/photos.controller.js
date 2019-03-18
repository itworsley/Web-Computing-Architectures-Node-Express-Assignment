const Photo = require('../models/photos.model');
const fs = require("fs");
const formidable = require('formidable');


exports.addPhotoToVenue = async function(req, res) {
    // Check if all fields are supplied
    //console.log(req);
    // let form = new formidable.IncomingForm();
    // form.parse(req, function(err, fields, files) {
    //     if (Object.keys(fields).length != 2) {
    //         res.statusMessage = "Bad Request";
    //         res.status(400).send("Bad Request");
    //     } else {
    //         form.on('end', function(fields, files) {
    //             const temp_path = this.openedFiles[0].path;
    //             const file_name = this.openedFiles[0].name;
    //             console.log(file_name);
    //         })
    //     }
    // });
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
    // new formidable.IncomingForm().parse(req, (err, fields, files) => {
    //     if (Object.keys(fields).length != 2) {
    //         res.statusMessage = "Bad Request";
    //         res.status(400).send("Bad Request");
    //     } else {
    //         let description = Object.values(fields)[0];
    //         let makePrimary = Object.values(fields)[1];
    //         let token = req.header("X-Authorization");
    //         let venueId =  req.params.id;
    //         if (!req.header("X-Authorization")) {
    //             res.statusMessage = "Unauthorized";
    //             return res.status(401).send("Unauthorized");
    //         } else {
    //             Photo.addPhotoToVenue(token, venueId, req, function (statusCode, statusMessage, result) {
    //                 res.statusMessage = statusMessage;
    //                 res.status(statusCode).send(result);
    //             });
    //         }
    //     }
    // });
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