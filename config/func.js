const fs = require("fs");
const db = require("./db.js");
const shell = require("shelljs");
const querystring = require("querystring");
const request = require("request");
const md5 = require("md5");
var lgn = "???????";
var pass = "???????";
var mw = "???????";
var token;

const sequelize = db.sequelize;
module.exports = function() {
  this.getDate = function(nr) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + nr);
    var strDate =
      date.getFullYear() +
      "" +
      checkTime(date.getMonth() + 1) +
      "" +
      checkTime(date.getDate());
    return strDate;
  };
  this.getUnixStart = function(nr) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    var start = date.setDate(date.getDate() + nr);
    return Math.floor(start / 1000);
  };
  this.getUnixEnd = function(nr) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    var end = date.setDate(date.getDate() + nr + 1);
    return Math.floor(end / 1000);
  };
  this.checkTime = function(i) {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  };
  this.getToken = function() { // IPTV second Middleware
    var pp = md5(pass);
    var logObj = { login: lgn, password: pp, eq_type: 1 };
    console.log(JSON.stringify(logObj));
    request(
      {
        url: "???????",
        method: "POST",
        body: JSON.stringify(logObj)
      },
      function(error, response, body) {
        token = JSON.parse(body).token;
      }
    );
  };
  this.getEpgData = function(i) {
    var channels = [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      422,
      425,
      500,
      503,
      506,
      509,
      515
    ];
    var fr = getUnixStart(i);
    var t = getUnixEnd(i);
    var chObj = { channel_id: channels, from: fr, to: t };
    var chData = JSON.stringify(chObj);
    request(
      {
        headers: {
          Authorization: token
        },
        url: "???????",
        method: "POST",
        body: chData
      },
      function(error, response, body) {
        fs.writeFile(path + "/epg/" + getDate(i) + ".json", body, function( //Epg json files
          err
        ) {
          if (err) throw err;
        });
      }
    );
  };
  this.getEpgJson = function() {
    getToken();
    setTimeout(function() {
      for (var i = 0; i < 7; i++) {
        getEpgData(i);
      }
    }, 10000);
  };
  this.updateEpgs = function() {
    setInterval(getEpgJson, 8 * 3600 * 1000);
  };
};
