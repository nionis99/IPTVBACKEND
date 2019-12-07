const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const config = require('../../config/config');
const passport_admin = require('passport');
const ValidateLoginInput = require('../../validation/login');
const sequelize = db.sequelize;
const Equipment = db.equipment;
const Admin = db.admin;
const Account = db.account;
const Account_channel = db.account_channel;
const Channel = db.channel;
const Note = db.note;

// @route   POST api/admin/registerAdmin
// @desc    Register admin
// @access  Public
router.post('/registerAdmin', (req, res) => {
    Admin.findOne({ 
        where:{
            login: req.body.login
        }
     }).then(admin => {
        if (admin) {
            res.status(400).json({
                "login" : "Login already exists"
            });
        } else {
            const newAdmin = new Admin({
                login: req.body.login,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                    if (err) throw err;
                    newAdmin.password = hash;
                    sequelize.query('INSERT INTO admin(login,password) VALUES (:login, :password)' , { replacements: { login: newAdmin.login, password : newAdmin.password}, type: sequelize.QueryTypes.INSERT})
                    .then(newAdmin => {
                        res.status(200).json({
                            success: true,
                            message: 'new admin account was created',
                        });
                    });
                });
            });
        }
    });
});

// @route       POST api/admin/login
// @desc        Login admin account / Returning JWT Token
// @acces       Public
router.post('/login', (req,res) => {
    const { errors, isValid } = ValidateLoginInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).end();
    }

    const password = req.body.password;
    // Find admin by login
    Admin.findOne({
        where: {
            login:req.body.login
        }
        }).then(admin => {
            // Check for admin account
            if(!admin) {
                errors.login = 'User not found';
                return res.status(404).json(errors);
            } else {
                bcrypt.compare(password, admin.password).then(isMatch => {
                    if(isMatch){
                        const payload = { id: admin.id, login: admin.login}
                        jwt.sign(payload, config.secret, { expiresIn: 3600 },
                            (err, token) => {
                                res.status(200).json({
                                    success: true,
                                    token: 'Bearer ' + token,
                                });
                                            
                            });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
            }
        
        });
});
// @route   GET api/admin/channel
// @desc    GET all channels list
// @access  Private
router.get('/channel', passport_admin.authenticate('admin', { session: false}),
(req, res) => {   
    sequelize.query('SELECT channel.id,channel.title, channel_genre.name AS genre, channel.url_name, channel.url_file, CONCAT(\'http://84.32.134.181/images/\',channel.logo) AS logo_url, channel.create_time, channel.update_time FROM channel, channel_genre WHERE channel_genre.id = channel.genre_id ORDER BY channel.id' , {type: sequelize.QueryTypes.SELECT})
    .then(channel => {
        res.status(200).json(channel);
    });
});
// @route   PUT api/admin/channel/:id
// @desc    Update selected channel from channel list
// @access  Private
router.put('/channel/:id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {
        Channel.findOne({
            where: {
                id : req.params.id
            }
        }).then(ch =>{
            if(!ch){
                res.status(404).json({
                    "Channel" : "Channel not found"
                });
            } else{
                sequelize.query('UPDATE channel SET title = :title, genre_id = :genre_id, url_name = :url_name, url_file = :url_file, logo = :logo where id = :id' , {replacements: { id: req.params.id, title: req.body.title, genre_id: req.body.genre_id, url_name: req.body.url_name, url_file: req.body.url_file, logo: req.body.logo,  }, type: sequelize.QueryTypes.UPDATE})
                .then(channels => {
                    res.status(202).end();
                });
            }
        });
});
// @route   POST api/admin/channel
// @desc    Add channel
// @access  Private
router.post('/channel', passport_admin.authenticate('admin', { session: false}),
(req, res) => {     
    Channel.findOne({
        where: {
            id:req.body.id
    }}).then(channel => {
        if(channel) {
            res.status(409).json({
                "Channel" : "Channel ID already exists"
            });
        } else {
            sequelize.query('INSERT INTO channel(id,name,title,genre_id,url_name,url_file,logo) VALUES(:id, :name, :title, :genre_id, :url_name, :url_file, :logo)' , { replacements: { id: req.body.id, name : req.body.name, title : req.body.title, genre_id : req.body.genre_id, url_name : req.body.url_name, url_file : req.body.url_file, logo : req.body.logo }, type: sequelize.QueryTypes.INSERT})
            .then(channels => {
                res.status(201);
            });
        }
    });
});
// @route   DELETE api/admin/channel/:id
// @desc    Delete Channel from channel list
// @access  Private
router.delete('/channel/:id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {
    Channel.findOne({ 
            where : { id : req.params.id}
    }).then(channel => {
        if(!channel){
            res.status(404).json({
                "Channel" : "Channel not found"
            });
        } else {
            sequelize.query('DELETE FROM channel where id = :id' , {replacements: { id: req.params.id }, type: sequelize.QueryTypes.DELETE})
            .then(channels => {
                res.status(200);
            });
        }
    });
});
// @route   POST api/admin/client
// @desc    Register Client
// @access  Private
router.post('/client', passport_admin.authenticate('admin', { session: false}),
(req, res) => {
        const { errors, isValid } = ValidateLoginInput(req.body);
        // Check Validation
        if(!isValid) {
            return res.status(400).end();
        }
        Account.findOne({ 
            where:{
                login: req.body.login
            }
        }).then(account => {
            if (account) {
                res.status(409).json({
                    "login" : "Login already exists"
                });
            } else {
                const newClient = new Account({
                    login: req.body.login,
                    password: req.body.password
                });
                if(newClient.password){
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newClient.password, salt, (err, hash) => {
                            if (err) throw err;
                            newClient.password = hash;
                            sequelize.query('INSERT INTO account(login,password) VALUES (:login, :password)' , { replacements: { login: newClient.login, password : newClient.password}, type: sequelize.QueryTypes.INSERT})
                            .then(newClient => {
                                res.status(201).end();
                            });
                        });
                    });
                } else {
                    res.status(400).end();
                }
            }
        });

})
// @route   DELETE api/admin/client/:id
// @desc    Delete Client from client list
// @access  Private
router.delete('/client/:id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {
    Account.findOne({
        where : { id : req.params.id}
    }).then(account => {
        if(!account){
            res.status(404).json({
                "Client" : "Client account not found"
            });
        } else {
            sequelize.query('DELETE FROM account where id = :id' , {replacements: { id: req.params.id }, type: sequelize.QueryTypes.DELETE})
            .then(clients => {
                res.status(200).end();
            });
        }
    });
})
// @route   GET api/admin/client/:id
// @desc    Get selected client account
// @access  Private
router.get('/client/:id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {
    Account.findOne({
        where: {
            id : req.params.id
        },
        hierarchy: true
    }).then(acc => {
        if(!acc){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            sequelize.query('SELECT id,login,date_start,date_end,create_time,update_time FROM account where id=:id' , { replacements: { id: req.params.id }, type: sequelize.QueryTypes.SELECT})
            .then(client =>{
                res.status(200).json({client});
            })
              
        }
    });
});
// @route   GET api/admin/client
// @desc    Get all Clients list
// @access  Private
router.get('/client', passport_admin.authenticate('admin', { session: false}),
(req,res) => {
    sequelize.query('SELECT id,login,date_start,date_end,create_time,update_time FROM account' , { type: sequelize.QueryTypes.SELECT})
    .then(clients => {
        res.status(200).json({clients});       
    });
});
// @route   PUT api/admin/client/:id
// @desc    Update selected client
// @access  Private
router.put('/client/:id', passport_admin.authenticate('admin', { session: false}),
(req,res) => { 
    Account.findOne({
        where: {
            id : req.params.id
        }
    }).then(acc => {
        if(!acc){
            res.status(404).json({
                message : "Client not found"
            })
        } else{
            sequelize.query('UPDATE account SET login = :login where id=:id' , { replacements: { id: req.params.id, login : req.body.login }, type: sequelize.QueryTypes.UPDATE})
            .then(clients => {
                  res.status(202).end();
            });
        }
    })    

});
// @route   GET api/admin/client/:id/equipment/:eq_id/note
// @desc    GET info from specific account equipment
// @access  Private
router.get('/client/:client_id/equipment/:equipment_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment => {
                if(!equipment){
                    res.status(404).end(); 
                } else{
                    sequelize.query('SELECT * FROM equipment where account_id=:client_id and id=:equipment_id' , { replacements: { client_id: acc_id, equipment_id : id }, type: sequelize.QueryTypes.SELECT})
                    .then(equipment => {
                        res.status(200).json({equipment});
                    })
                }
            });
        }
    })   
});
// @route   DELETE api/admin/client/:id/equipment/:eq_id
// @desc    DELETE specific equipment from account 
// @access  Private
router.delete('/client/:client_id/equipment/:equipment_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment => {
                if(!equipment){
                    res.status(404).end(); 
                } else{
                    sequelize.query('DELETE FROM equipment where account_id=:client_id and id=:equipment_id' , { replacements: { client_id: acc_id, equipment_id : id }, type: sequelize.QueryTypes.DELETE})
                    .then(eq => {
                        res.status(200).end();
                    })
                }
            });
        }
    })   
});
// @route   ADD api/admin/client/:id/equipment/:eq_id
// @desc    ADD equipment to account 
// @access  Private
router.post('/client/:client_id/equipment', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    if(!req.body.cdn){
        res.status(400).end();
    }
    let acc_id = req.params.client_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            let account_login = client.login;
            sequelize.query('INSERT INTO equipment(account_id,login,cdn1_id, note) VALUES(:client_id,:login,:cdn, :note)' , { replacements: { client_id: acc_id, login: account_login, cdn:req.body.cdn1_id, note:req.body.note}, type: sequelize.QueryTypes.INSERT})
            .then(eq => {
                res.status(200).end();
            })
        }
    }); 
});
// @route   GET api/admin/client/:id/equipment/:eq_id
// @desc    GET all equipments from account 
// @access  Private
router.get('/client/:client_id/equipment', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            sequelize.query('SELECT * FROM equipment where account_id=:client_id' , { replacements: { client_id: acc_id}, type: sequelize.QueryTypes.SELECT})
            .then(equipments => {
                res.status(200).json({equipments});
            })
        }
    }); 
});
// @route   UPDATE api/admin/client/:id/equipment/:eq_id
// @desc    UPDATE specific equipment from account 
// @access  Private
router.put('/client/:client_id/equipment/:equipment_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            sequelize.query('UPDATE equipment SET serial=:serial, description=:description,cdn1_id=:cdn1_id where account_id=:client_id and id=:equipment_id' , { replacements: { client_id: acc_id, serial:req.body.serial, description:req.body.description, cdn1_id:req.body.cdn1_id, equipment_id:id}, type: sequelize.QueryTypes.UPDATE})
            .then(eq => {
                res.status(202).end();
            })
        }
    }); 
});
// @route   GET api/admin/client/:id/equipment/:eq_id/note
// @desc    GET list of notes from account for specific equipment 
// @access  Private
router.get('/client/:client_id/equipment/:equipment_id/note', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment =>{
                if(!equipment){
                    res.status(404).json({
                        message : "Client don't have equipment(s)"
                    })
                } else {
                    sequelize.query('SELECT * FROM note where equipment_id = :id' , { replacements: { id: id}, type: sequelize.QueryTypes.SELECT})
                    .then(notes => {
                        res.status(200).json({notes});
                    })
                }
            })
        }
    }); 
});
// @route   UPDATE api/admin/client/:id/equipment/:eq_id/note/:note_id
// @desc    UPDATE specific equipment note from account 
// @access  Private
router.put('/client/:client_id/equipment/:equipment_id/note/:note_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    let note_id = req.params.note_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment =>{
                if(!equipment){
                    res.status(404).json({
                        message : "Client don't have equipment(s)"
                    })
                } else {
                    Note.findOne({
                        where:{
                            id:note_id
                        }
                    }).then(note =>{
                        if(!note){
                            res.status(404).end();
                        } else {
                            sequelize.query('UPDATE note SET note=:note where id=:id and equipment_id=:equipment_id' , { replacements: { id: note_id, note:req.body.note, equipment_id:id}, type: sequelize.QueryTypes.UPDATE})
                            .then(eq => {
                                res.status(202).end();
                            });
                        }
                    })
                }
            })
        }
    }); 
});
// @route   GET api/admin/client/:id/equipment/:eq_id/note
// @desc    GET note from account for specific equipment 
// @access  Private
router.get('/client/:client_id/equipment/:equipment_id/note/:note_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    let note_id = req.params.note_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment =>{
                if(!equipment){
                    res.status(404).json({
                        message : "Client don't have equipment(s)"
                    })
                } else {
                    Note.findOne({
                        where: {
                            id : note_id
                        }
                    }).then(note =>{
                        if(!note){
                            res.status(404).end();
                        }else {
                            sequelize.query('SELECT * FROM note where equipment_id = :id and id=:note_id' , { replacements: { id: id, note_id:note_id}, type: sequelize.QueryTypes.SELECT})
                            .then(note => {
                                res.status(200).json({note});
                            })
                        }
                    })
                }
            })
        }
    }); 
});
// @route   POST api/admin/client/:id/equipment/:eq_id/note
// @desc    POST note from account for specific equipment 
// @access  Private
router.post('/client/:client_id/equipment/:equipment_id/note', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    if(!req.body.note){
        res.status(400).end();
    }
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment =>{
                if(!equipment){
                    res.status(404).json({
                        message : "Client don't have equipment(s)"
                    })
                } else {
                    sequelize.query('INSERT INTO note(equipment_id,note) VALUES(:eq_id,:note)' , { replacements: { eq_id: id,note:req.body.note}, type: sequelize.QueryTypes.INSERT})
                    .then(notes => {
                        res.status(200).end();
                    })
                }
            })
        }
    }); 
});
// @route   UPDATE api/admin/client/:id/equipment/:eq_id/note/:note_id
// @desc    UPDATE specific equipment note from account 
// @access  Private
router.delete('/client/:client_id/equipment/:equipment_id/note/:note_id', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    let acc_id = req.params.client_id;
    let id = req.params.equipment_id;
    let note_id = req.params.note_id;
    Account.findOne({
        where : {
            id : acc_id
        }
    }).then(client => {
        if(!client){
            res.status(404).json({
                message : "Client not found"
            })
        } else {
            Equipment.findOne({
                where: {
                    account_id : acc_id
                }
            }).then(equipment =>{
                if(!equipment){
                    res.status(404).json({
                        message : "Client don't have equipment(s)"
                    })
                } else {
                    Note.findOne({
                        where:{
                            id:note_id
                        }
                    }).then(note =>{
                        if(!note){
                            res.status(404).end();
                        } else {
                            sequelize.query('DELETE FROM note WHERE id=:note_id and equipment_id=:equipment_id' , { replacements: { note_id: note_id, equipment_id:id}, type: sequelize.QueryTypes.UPDATE})
                            .then(eq => {
                                res.status(200).end();
                            });
                        }
                    })
                }
            })
        }
    }); 
});
router.all('/client', (res,req) =>{
    res.status(405).end();
});
router.all('/client/:client_id', (res,req) =>{
    res.status(405).end();
});
router.all('/client/:client_id/equipment', (res,req) =>{
    res.status(405).end();
});
router.all('/client/:client_id/equipment/:equipment_id', (res,req) =>{
    res.status(405).end();
});
router.all('/client/:client_id/equipment/:equipment_id/note', (res,req) =>{
    res.status(405).end();
});
router.all('/client/:client_id/equipment/:equipment_id/note/:note_id', (res,req) =>{
    res.status(405).end();
});
// @route   GET api/admin/cdn
// @desc    GET all CDN list 
// @access  Private
router.get('/cdn', passport_admin.authenticate('admin', { session: false}),
(req,res) => {  
    sequelize.query('SELECT * FROM cdn' , {type: sequelize.QueryTypes.SELECT})
    .then(cdn => {
        res.status(200).json({cdn});
    })
})
router.all('*', (req,res) => {
    res.status(404).end();
})
module.exports = router;