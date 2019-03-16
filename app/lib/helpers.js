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

/**
 * Function to calculate the distance between two sets of latitude and longitude values.
 * Retrieved from - https://www.barattalo.it/coding/decimal-degrees-conversion-and-distance-of-two-points-on-google-map/
 * Credit to Giulio Pons
 * @param lat1
 * @param lon1
 * @param lat2
 * @param lon2
 * @returns {*}
 */
exports.calculateDistance = function(lat1,lon1,lat2,lon2) {
    let R = 6371; // km (change this constant to get miles)
    let dLat = (lat2-lat1) * Math.PI / 180;
    let dLon = (lon2-lon1) * Math.PI / 180;
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c;
    //if (d>1) return Math.round(d)+"km";
    //else if (d<=1) return Math.round(d*1000)+"m";
    return d;
};

exports.checkLatLong = function(lat, long) {
    if ((lat < -90) || (lat > 90) || (long < -180) || (long > 180)) {
        return true
    } else {
        return false
    }
}