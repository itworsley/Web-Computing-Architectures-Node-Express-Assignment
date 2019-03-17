const db = require('../../config/db');

exports.checkAuthenticated = function(userId, done){
    if (userId) return done(true);
    return done(false);
};

exports.getUserIdFromToken = function(token, done) {
    const sql = `SELECT user_id FROM User WHERE auth_token = "${token}"`;
    db.getPool().query(sql, function(err, result){
        if (err) return done(null);
        if (result.length === 0) return done(null);
        return done(result[0].user_id);
    });
};

exports.checkLatLong = function(lat, long) {
    if ((lat < -90) || (lat > 90) || (long < -180) || (long > 180)) {
        return true
    } else {
        return false
    }
}