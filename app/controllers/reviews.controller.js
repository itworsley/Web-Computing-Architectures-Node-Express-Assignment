const Review = require('../models/reviews.model');

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
    const id = req.params.id;
    const token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        Review.getUserReviews(id, token,function(statusCode, statusMessage, result ) {
            res.statusMessage = statusMessage;
            res.status(statusCode).json(result);
        })
    }
};

exports.createReview = async function (req, res) {
    const token = req.header("X-Authorization");
    if (!req.header("X-Authorization")) {
        res.statusMessage = "Unauthorized";
        return res.status(401).send("Unauthorized");
    } else {
        const id = req.params.id;
        let length = Object.keys(req.body).length;

        if (length === 0) {
            res.statusMessage = "Bad Request";
            return res.status(400).send("Bad Request");
        }
        if (!((req.body.reviewBody) && (req.body.starRating) && (req.body.costRating))) {
            res.statusMessage = "Bad Request";
            return res.status(400).send("Bad Request");
        }

        const starDecimal = (req.body.starRating - Math.floor(req.body.starRating)) !== 0;
        const costDecimal = (req.body.costRating - Math.floor(req.body.costRating)) !== 0;

        if ((req.body.starRating > 5) || (req.body.starRating < 0) || starDecimal) {
            res.statusMessage = "Bad Request";
            return res.status(400).send("Bad Request");
        }
        if ((req.body.costRating > 5) || (req.body.costRating < 0) || costDecimal) {
            res.statusMessage = "Bad Request";
            return res.status(400).send("Bad Request");
        }

        Review.createReview(token, id, req.body,function(statusCode, statusMessage, result ) {
            res.statusMessage = statusMessage;
            res.status(statusCode).json(result);
        })
    }

};