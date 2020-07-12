const express = require("express");
const app = express();
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const db = require("./db.js");
const cookieParser = require("cookie-parser");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.get("/petition", (req, res) => {
    if (req.cookies.signed) {
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
        .then(() => {
            console.log("new sign added");
            res.cookie("signed", true);
            res.redirect("petition/signed");
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
            console.log(numSigners);
            res.render("thanks", {
                layout: "main",
                numSigners,
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
