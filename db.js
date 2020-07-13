var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:alessandra:postgres@localhost:5432/caper-petition");

module.exports.addSignature = function (newFirst, newLast, newSignature) {
    let q =
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id";
    let params = [newFirst, newLast, newSignature];
    return db.query(q, params);
};

module.exports.getSigners = function () {
    let q = "SELECT COUNT(*) FROM signatures";
    return db.query(q);
};

module.exports.getNames = function () {
    let q = "SELECT first, last FROM signatures";
    return db.query(q);
};

module.exports.getSignature = function (id) {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};
