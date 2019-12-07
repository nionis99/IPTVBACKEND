const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const client = require("./routes/api/client");
const admin = require("./routes/api/admin");
const db = require("./config/db.js");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
global.path = __dirname;
// Passport
app.use(passport.initialize());
// Epg Function
require("./config/func.js")();
// Passport Config
require("./config/passport")(passport);
updateEpgs();
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});
app.use("/client", client);
app.use("/admin", admin);
app.use(function(err, req, res, next) {
  res.status(405).send();
});
app.all("*", (req, res) => {
  res.status(400).end();
});
const port = process.env.PORT || 5000;

app.listen(port);
