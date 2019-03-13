const Review = require('../models/reviews.model');
const db = require('../../config/db');

exports.getAllReviews = async function (req, res) {
    const sqlCommand = String(req.body);
    const id = req.params.id;
    const results = await Review.getAllReviews(id, sqlCommand);

    if (results.length > 0) {
        let i;
        const list = [];
        for (i=0; i < results.length; i++) {
            const json_result = {
                "reviewAuthor": {"userId": results[i].user_id.toString(), "username": results[i].username},
                "reviewBody": results[i].review_body,
                "starRating": results[i].star_rating,
                "costRating": results[i].cost_rating,
                "timePosted": results[i].time_posted
            };
            list.push(json_result);
        }
        res.statusMessage = 'OK';
        res.status(200)
            .json(list);
    } else if (results.length == 0) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
    }
};

exports.getUserReviews = async function (req, res) {
    const sqlCommand = String(req.body);
    const id = req.params.userId;
    const token = req.header("X-Authorization");
    //const results = await Review.getUserReviews(id, sqlCommand);
    Review.getUserReviews(id, token,function(statusCode, statusMessage, result ) {
            res.statusMessage = statusMessage;
            res.status(statusCode).json(result);
            //res.statusMessage = 'OK';
            //res.status(200)
                //.json(list);
    })

}