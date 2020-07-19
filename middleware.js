module.exports.redirectIfLoggedOut = function (req, res, next) {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        next();
    }
};

module.exports.redirectIfLoggedIn = function (req, res, next) {
    if (req.session.userId && req.session.signatureId) {
        res.redirect("/petition/signers");
    } else if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.redirectIfSigned = function (req, res, next) {
    if (req.session.signatureId) {
        res.redirect("/petition/signers");
    } else {
        next();
    }
};

module.exports.redirectIfNotSigned = function (req, res, next) {
    if (req.session.userId && !req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};
