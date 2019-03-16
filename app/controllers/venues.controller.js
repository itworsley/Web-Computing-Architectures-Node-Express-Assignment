const Venue = require('../models/venues.model');
const db = require('../../config/db');
const help = require('../lib/helpers');

/**
 * Gets details of all venues, unused method
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
// exports.getAllVenues = async function (req, res) {
//     const sqlCommand = String(req.body);
//     try {
//         const results = await Venue.getAllVenues(sqlCommand);
//         res.statusMessage = 'OK';
//         res.status(200)
//             .json(results);
//     } catch (err) {
//         if (!err.hasBeenLogged) console.error(err);
//         res.statusMessage = 'Internal Server Error';
//         res.status(500)
//             .send();
//     }
// };

exports.getAllVenues = function (req, res) {
    let searchParams = req.query;
    Venue.getAllVenues(searchParams, function(statusCode, statusMessage, result)  {
        res.statusMessage = statusMessage;
        res.status(statusCode).json(result);
    });
};

/**
 * Get all details of a single venue, has joined values from other tables in query.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getSingleVenue = async function (req, res) {
    const sqlCommand = String(req.body);
    const id = req.params.id;
    const results = await Venue.getSingleVenue(id, sqlCommand);
    if (results.length > 0) {
        const venue = results[0].venue_name;
        const admin_id = results[0].admin_id;
        const username = results[0].username;

        const json_result = {"venueName": venue.toString(), "admin": {"userId": admin_id, "username": username.toString()},
        "category":{"categoryId": results[0].category_id, "categoryName": results[0].category_name.toString(), "categoryDescription": results[0].category_description.toString()},
        "city": results[0].city.toString(), "shortDescription": results[0].short_description.toString(), "longDescription": results[0].long_description.toString(),
        "dateAdded": results[0].date_added, "address": results[0].address.toString(), "latitude": results[0].latitude, "longitude": results[0].longitude};

        res.statusMessage = 'OK';
        res.status(200)
            .json(json_result);
    } else if (results.length == 0) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    }
};

exports.createVenue = async function (req, res) {
    let token = req.header("X-Authorization");
    let length = Object.keys(req.body).length;
    if (length === 0) {
        res.statusMessage = "Bad Request";
        return res.status(400).send("Bad Request");
    }
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        //Check all the valid parameters are in the body.
        if (((req.body.venueName) && (req.body.categoryId) && (req.body.city) && (req.body.shortDescription) && (req.body.longDescription) && (req.body.address) && ((req.body.latitude) || (req.body.latitude == 0)) && ((req.body.longitude) || (req.body.longitude == 0)))) {
            //Check latitude and longitude values are valid
            if (help.checkLatLong(req.body.latitude, req.body.longitude)) {
                res.statusMessage = "Bad Request"
                return res.status(400).send("Bad Request");
            }
            const check = await db.getPool().query('SELECT * FROM Venue WHERE venue_name = ?', req.body.venueName);
            if (!check.length == 0) {
                res.statusMessage = "Bad Request";
                return res.status(400).send("Bad Request");
            }
            Venue.createVenue(token, req.body, function (statusCode, statusMessage, userId) {
                res.statusMessage = statusMessage;
                res.status(statusCode).json(userId);
            });
        } else {
            res.statusMessage = "Bad Request";
            return res.status(400).send("Bad Request");
        }
    }
};

exports.updateVenue = function(req, res) {
    let venueId = req.params.id;
    let token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        // Check the request body is not empty
        let length = Object.keys(req.body).length;
        if (length === 0) {
            res.statusMessage = "Bad request";
            return res.status(400).send();
        }
        if ((req.body.latitude < -90) || (req.body.latitude > 90) || (req.body.longitude < -180) || (req.body.longitude > 180)) {
            res.statusMessage = "Bad Request"
            return res.status(400).send("Bad Request");
        }
        Venue.updateVenue(token, venueId, req.body, function (statusCode, statusMessage) {
            res.statusMessage = statusMessage;
            res.status(statusCode).send(statusMessage);
        });
    }
};

exports.getCategories = async function (req, res) {
    const sqlCommand = String(req.body);
    const results = await Venue.getCategories(sqlCommand);
    if (results.length > 0) {

        let i;
        const list = [];
        for (i=0; i < results.length; i++) {
            const category_data = {
                "categoryId": results[i].category_id,
                "categoryName": results[i].category_name,
                "categoryDescription": results[i].category_description
            };
            list.push(category_data);
        }
        res.statusMessage = 'OK';
        res.status(200)
            .json(list);
    } else {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    }
}