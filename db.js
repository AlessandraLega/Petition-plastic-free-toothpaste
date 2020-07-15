var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:alessandra:postgres@localhost:5432/caper-petition");

module.exports.addSignature = function (newSignature, userId) {
    let q =
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id";
    let params = [newSignature, userId];
    return db.query(q, params);
};

module.exports.getSigners = function () {
    let q = "SELECT COUNT(*) FROM signatures";
    return db.query(q);
};

module.exports.getNames = function () {
    let q =
        "SELECT first, last, age, city, url FROM users RIGHT JOIN signatures ON users.id=signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id";
    return db.query(q);
};

module.exports.getNamesInCity = function (city) {
    let q =
        "SELECT first, last, age, city, url FROM users RIGHT JOIN signatures ON users.id=signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1";
    let params = [city];
    return db.query(q, params);
};

module.exports.getSignature = function (id) {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.addUser = function (newFirst, newLast, newEMail, hashedPw) {
    let q =
        "INSERT INTO users (first, last, e_mail, password) VALUES ($1, $2, $3, $4) RETURNING id";
    let params = [newFirst, newLast, newEMail, hashedPw];
    return db.query(q, params);
};

module.exports.getPwIdSigId = function (eMail) {
    let q =
        "SELECT users.password, users.id AS userId, signatures.id as signatureId FROM users LEFT JOIN signatures ON users.id=signatures.user_id WHERE users.e_mail = $1";
    let params = [eMail];
    return db.query(q, params);
};

module.exports.addProfile = function (newAge, newCity, newUrl, userId) {
    let q =
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)";
    let params = [newAge, newCity, newUrl, userId];
    return db.query(q, params);
};
