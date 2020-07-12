var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:alessandra:postgres@localhost:5432/caper-petition");

module.exports.addSignature = function (newFirst, newLast, newSignature) {
    let q =
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)";
    let params = [newFirst, newLast, newSignature];
    return db.query(q, params);
};
