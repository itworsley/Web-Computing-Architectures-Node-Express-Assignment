const Venue = require('../models/venues.model');
const db = require('../../config/db');

/**
 * Gets details of all venues, unused method
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getAllVenues = async function (req, res) {
    const sqlCommand = String(req.body);
    try {
        const results = await Venue.getAllVenues(sqlCommand);
        res.statusMessage = 'OK';
        res.status(200)
            .json(results);
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

/**
 * Get all details of a single venue, has joined values from other tables in query.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getSingleVenue = async function (req, res) {
    const sqlCommand = String(req.body);
    const id = req.params.venueId;
    const results = await Venue.getSingleVenue(id, sqlCommand);
    if (results.length > 0) {
        const venue = results[0].venue_name;
        const admin_id = results[0].admin_id;
        const username = results[0].username;

        const json_result = {"venueName": venue.toString(), "admin": {"userId": admin_id.toString(), "username": username.toString()},
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
    const sqlCommand = String(req.body);
    //console.log(req.body.venueName);
    //for (const item in req.body) {
    //    console.log(item);
    //}
    if (req.body.venueName && req.body.categoryId /*&& req.body.city && req.body.shortDescription && req.body.longDescription && req.body.address && req.body.latitude && req.body.longitude*/) {
        const venue_data = {
            "venue_name": req.body.venueName, "category_id": req.body.categoryId, "city": req.body.city,
            "short_description": req.body.shortDescription, "long_description": req.body.longDescription,
            "address": req.body.address, "latitude": req.body.latitude, "longitude": req.body.longitude
        };
        const venue_name = venue_data["venue_name"].toString();
        const category_id = venue_data["category_id"].toString();
        const city = venue_data["city"].toString();
        const short_description = venue_data["short_description"].toString();
        const long_description = venue_data["long_description"].toString();
        const address = venue_data["address"].toString();
        const latitude = venue_data["latitude"].toString();
        const longitude = venue_data["longitude"].toString();

        const values = [[venue_name, category_id, city, short_description, long_description,address,latitude,longitude]];

        /* Will be used to check if user is valid*/
        if (true == false) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            // Check if duplicate venue
            const check = await db.getPool().query('SELECT * FROM Venue WHERE venue_name = ?', req.body.venueName);
            console.log(check);
            if (check.length != 0) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();
            } else {
                const results = await Venue.createVenue(values, sqlCommand);
                res.statusMessage = 'Created';
                const json_result = {"venueId": results.insertId.toString()};
                res.status(201)
                    .json(json_result);
            }

        }
    } else {
        console.log("HERE!");
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
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