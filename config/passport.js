const JwtStrategy  = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./db');
const Account = db.account;
const Admin = db.admin;
const config = require('./config');


module.exports = passport => { // Passport for IPTV Tizen web app
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); 
    opts.secretOrKey = config.secret;
    passport.use('user',
    new JwtStrategy(opts, (jwt_payload, done) => {
        Account.findOne({
            where: {
                id:jwt_payload.id
            }
        })
        .then(account => {
            if(account){
                return done(null, account);
            }
            return done(null, false);
        })
        .catch(err => console.log(err));
    })
    );
    passport.use('admin',
    new JwtStrategy(opts, (jwt_payload2, done) => { // Passport for IPTV admin web
        Admin.findOne({
            where: {
                id:jwt_payload2.id
            }
        })
        .then(admin => {
            if(admin){
                return done(null, admin);
            }
            return done(null, false);
        })
        .catch(err => console.log(err));
    })
    );
};