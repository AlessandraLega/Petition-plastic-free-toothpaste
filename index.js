const express = require("express");
const app = express();
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const db = require("./db.js");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bc = require("./bc.js");
const mw = require("./middleware.js");

module.exports.app = app;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

//app.use(cookieParser());
app.use(
    cookieSession({
        secret: "I am always happy",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(function redirect(req, res, next) {
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
});

app.get("/register", mw.redirectIfLoggedIn, (req, res) => {
    res.render("register", {
        layout: "main",
        unlogged: true,
    });
});

app.post("/register", mw.redirectIfLoggedIn, (req, res) => {
    bc.hash(req.body.password)
        .then((hashedPw) => {
            db.addUser(req.body.first, req.body.last, req.body.eMail, hashedPw)
                .then((id) => {
                    console.log("id added: ", id.rows[0].id);
                    req.session.userId = id.rows[0].id;
                    console.log(req.session);
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("error in addUser: ", err);
                    res.render("register", {
                        layout: "main",
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("error in hash: ", err);
            res.render("/register", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/login", mw.redirectIfLoggedIn, (req, res) => {
    res.render("login", {
        layout: "main",
        unlogged: true,
    });
});

app.post("/login", mw.redirectIfLoggedIn, (req, res) => {
    // console.log(req.body);
    db.getPwIdSigId(req.body.eMail)
        .then((result) => {
            let userId = result.rows[0].userid;
            let signatureId = result.rows[0].signatureid;
            let pw = result.rows[0].password;
            req.session.userId = userId;
            req.session.signatureId = signatureId;
            console.log("req.session: ", req.session);
            if (!pw) {
                res.render("login", {
                    layout: "main",
                    error: true,
                });
            } else {
                bc.compare(req.body.password, pw)
                    .then((matchingValue) => {
                        if (matchingValue) {
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                error: true,
                            });
                        }
                    })
                    .catch((err) => console.log("error in compare: ", err));
            }
        })
        .catch((err) => console.log("error in getPw: ", err));
});

app.get("/petition", mw.redirectIfSigned, (req, res) => {
    // console.log(req.session);
    // if (req.session.signatureId) {
    //     res.redirect("/petition/signers");
    // } else {
    res.render("home", {
        layout: "main",
    });
    // }
});

app.post("/petition", mw.redirectIfSigned, (req, res) => {
    // console.log(req.body);
    let userId = req.session.userId;
    db.addSignature(req.body.signature, userId)
        .then((id) => {
            // console.log("id: ", id.rows[0].id);
            console.log("new sign added");
            //res.cookie("signed", true);
            req.session.signatureId = id.rows[0].id;
            res.redirect("/petition/signed");
        })
        .catch((err) => {
            console.log("error in addSignature: ", err);
            res.render("home", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/petition/signed", (req, res) => {
    let numSigners;
    db.getSigners()
        .then((result) => {
            numSigners = result.rows[0].count;
            // console.log(numSigners);
            // console.log("sign count: ", numSigners);
            // console.log("req.session.id: ", req.session.id);
            db.getSignature(req.session.signatureId).then((signature) => {
                // console.log("signature: ", signature);
                signature = signature.rows[0].signature;
                res.render("thanks", {
                    layout: "main",
                    numSigners,
                    signature,
                });
            });
        })
        .catch((err) => {
            console.log("error in getSigners: ", err);
        });
});

app.post("/petition/signed", (req, res) => {
    db.deleteSignature(req.session.signatureId)
        .then(() => {
            req.session.signatureId = "";
            res.redirect("/petition");
        })
        .catch((err) => console.log("error in deleteSignature: ", err));
});

app.get("/petition/signers", (req, res) => {
    // let names = [];
    db.getNames()
        .then((results) => {
            results = results.rows;
            // console.log(results);
            /*             for (let i = 0; i < results.length; i++) {
                names.push(`${results[i].first} ${results[i].last}`);
            } */
            res.render("signers", {
                layout: "main",
                results,
            });
        })
        .catch((err) => {
            console.log("error in signers: ", err);
        });
});

app.get("/petition/signers/:city", (req, res) => {
    let city = req.params.city;
    db.getNamesInCity(city)
        .then((results) => {
            results = results.rows;
            res.render("signers", {
                layout: "main",
                results,
                cityView: true,
                city: city,
            });
        })
        .catch((err) => {
            console.log("error in signers: ", err);
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    if (!req.body.age && !req.body.city && !req.body.url) {
        res.redirect("/petition");
    }
    if (req.body.url) {
        if (
            req.body.url.indexOf("http") !== 0 ||
            req.body.url.indexOf("//") !== 0
        ) {
            req.body.url = "http://" + req.body.url;
        }
    }
    db.addProfile(req.body.age, req.body.city, req.body.url, req.session.userId)
        .then(() => {
            console.log("profile added");
            res.redirect("/petition");
        })
        .catch((err) => {
            if (err.code === "22P02") {
                res.render("profile", {
                    layout: "main",
                    notANum: true,
                });
            } else if (err.code === "23505") {
                res.render("profile", {
                    layout: "main",
                    duplicate: true,
                });
            }
            console.log("error in addProfile: ", err);
        });
});

app.get("/edit-profile", (req, res) => {
    db.getProfile(req.session.userId)
        .then((results) => {
            let profile = results.rows[0];
            // console.log("profile: ", profile);
            res.render("editProfile", {
                layout: "main",
                profile,
            });
        })
        .catch((err) => console.log("error in getProfile: ", err));
});

app.post("/edit-profile", (req, res) => {
    if (req.body.password) {
        bc.hash(req.body.password)
            .then((hashPw) => {
                db.updatePassword(req.session.userId, hashPw).then(() => {
                    console.log(" psw updated");
                });
            })
            .catch((err) => {
                console.log("error in update password: ", err);
            });
    }
    Promise.all([
        db.upsertProfile(
            req.session.userId,
            req.body.age,
            req.body.city,
            req.body.url
        ),
        db.updateUser(
            req.session.userId,
            req.body.first,
            req.body.last,
            req.body.eMail
        ),
    ])
        .then(() => {
            res.redirect("/petition/signers");
        })
        .catch((err) => {
            console.log("error in upsert: ", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("express listening");
    });
}
