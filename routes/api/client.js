const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport_user = require('passport');
const db = require('../../config/db');
const config = require('../../config/config');
const fs = require('fs');
const Account = db.account;
const Equipment = db.equipment;
const Cdn = db.cdn;
const sequelize = db.sequelize;
const Channel = db.channel;
const Channel_genre = db.channel_genre;
var data = [];
// Load input Validation
const ValidateLoginInput = require('../../validation/login');
// @route       POST api/client/login
// @desc        Login client / equipment Returning JWT Token
// @acces       Public
router.post('/login', (req,res) => {
    const { errors, isValid } = ValidateLoginInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const password = req.body.password;
    // Find user by login
    Account.findOne({
        where: {
            login:req.body.login
        }
        })
        .then(account => {
        // Check for account
        if(!account) {
            errors.login = 'Account not found';
            return res.status(404).json(errors);
        }
        var ident = account.id;
        // Check Password
        bcrypt.compare(password, account.password)
            .then(isMatch => {
                if(isMatch){
                    Equipment.findOne({
                        where: {
                            serial:req.body.serial,
                            account_id : ident
                        }
                    }).then(equipment =>{
                        if(!equipment){
                            Equipment.findOne({
                                where:{
                                    serial:null,
                                    account_id : ident
                                }
                            }).then(equipment =>{
                                if(!equipment){
                                    errors.login = 'No available equipment for this account found';
                                    return res.status(404).json(errors);
                                } else{
                                    var cdnid = equipment.cdn1_id;
                                    Equipment.update(
                                        { 
                                            serial: req.body.serial,
                                            login : req.body.login 
                                        },
                                        { where : { serial : null,
                                                    account_id : ident }
                                    }).then(() => {
                                        Cdn.findOne({
                                            where:{
                                                id:cdnid
                                            }
                                        }).then(cdn=> {
                                            var address = cdn.address
                                            const payload = { id: account.id, login: account.login}
        
                                        // Sign Token
                                        jwt.sign(payload, config.secret, { expiresIn: 3600 },
                                                (err, token) => {
                                                    res.json({
                                                        success: true,
                                                        token: 'Bearer ' + token,
                                                        address: address
                                                    });
                                                                 
                                                });
                                        });
                                    });                              
                                }
                            });
                        } else{
                            cdnid = equipment.cdn1_id;
                            Cdn.findOne({
                                where:{
                                    id:cdnid
                                }
                            }).then(cdn=> {
                                var address = cdn.address;
                                const payload = { id: account.id, login: account.login}
                                // Sign Token
                                jwt.sign(payload, config.secret, { expiresIn: 3600 },
                                (err, token) => {                                               
                                                res.json({
                                                    success: true,
                                                    token: 'Bearer ' + token,
                                                    address: address
                                                });  
                                });
                            });
                        }
                    });
                } else {
                    errors.password = 'Password incorrect';
                    return res.status(400).json(errors);
                }
            });
        });
});

// @route   GET api/client/channels
// @desc    Get all Channels
// @access  Private
router.get('/channels', passport_user.authenticate('user', { session: false}),
(req,res) => {
    var unixCurrent = Math.floor(Date.now() / 1000);
    sequelize.query('SELECT `channels`.`id`, `channels`.`name`, `channel_genre`.`name` AS `genre`, `channels`.`url_name`, `channels`.`url_file`, `channels`.`logo` FROM `channel_genre`,`account` LEFT OUTER JOIN ( `account_channel` AS `channels->account_channel` INNER JOIN `channel` AS `channels` ON `channels`.`id` = `channels->account_channel`.`channel_id`) ON `account`.`id` = `channels->account_channel`.`account_id` WHERE `channels`.`genre_id` = `channel_genre`.`id` AND `account`.`id` = :id ORDER BY `channels`.`id`' , { replacements: { id: req.user.id}, type: sequelize.QueryTypes.SELECT})
  .then(channel => {
    fs.readFile('epg/'+getDate(0)+'.json', 'utf8', (err, fileContents) => {
      if (err) {
        console.error(err);
        return;
      }
      try {
        data = JSON.parse(fileContents);
        data = data.filter(x => x.start <= unixCurrent && x.end >= unixCurrent);
          for(var x in data){
              for(var y in channel){
                if(data[x].channel_id == channel[y].id){
                    channel[y].title = data[x].title;
                  }
              }
          }
          res.status(200).json(channel);
        } catch(err) {
        console.error(err);
      }
    }); 
  });
});
/*router.get('/epg', passport_user.authenticate('user', { session: false}),
(req,res) => {

});*/
module.exports = router;