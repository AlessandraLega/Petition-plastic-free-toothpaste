const express = require("express");
const app = express();
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const db = require("./db.js");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

//app.use(cookieParser());
app.use(
    cookieSession({
        secret: "I am always happy",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/petition", (req, res) => {
    if (req.session.signed) {
        res.redirect("petition/signers");
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log(req.body);
    db.addSignature(req.body.first, req.body.last, req.body.signature)
        .then((id) => {
            // console.log("id: ", id.rows[0].id);
            console.log("new sign added");
            //res.cookie("signed", true);
            req.session.signed = true;
            req.session.id = id.rows[0].id;
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
            // console.log("sign count: ", numSigners);
            // console.log("req.session.id: ", req.session.id);
            db.getSignature(req.session.id).then((signature) => {
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

app.get("/petition/signers", (req, res) => {
    let names = [];
    db.getNames()
        .then((results) => {
            results = results.rows;
            for (let i = 0; i < results.length; i++) {
                names.push(`${results[i].first} ${results[i].last}`);
            }
            res.render("signers", {
                layout: "main",
                names,
            });
        })
        .catch((err) => {
            console.log("error in signers: ", err);
        });
});

app.listen(8080, () => {
    console.log("express listening");
});
