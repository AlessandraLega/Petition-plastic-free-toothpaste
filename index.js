const express = require("express");
const app = express();
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const db = require("./db.js");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    // console.log(req.body);
    db.addSignature(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            console.log("new sign added");
            res.render("thanks", {
                layout: "main",
                error: false,
            });
            res.cookie("signed", true);
        })
        .catch((err) => {
            res.render("petition", {
                layout: "main",
                error: true,
            });
            console.log("error in add to db");
        });
});

app.listen(8080, () => {
    console.log("express listening");
});
