/*
    posts.js
    
    Description: Contains all routes that request post information from the server
*/

const e = require('express');
var express = require('express');
var router = express.Router();
const errorPrint = require("../helpers/debug/debughelpers").errorPrint;
const successPrint = require("../helpers/debug/debughelpers").successPrint;
const db = require("../config/database");
const UserError = require("../helpers/errors/UserError");

// TODO(Lothar): Ensure the user is logged in as the correct user
router.post('/createMessage', (req, resp, next) => {
    if (req.session && req.session.userId) {
        let arguments = [];
        //probably do validation before sending to sql
        arguments.push(req.session.userId);
        arguments.push(req.body.userID);
        arguments.push(req.body.message);
        arguments.push(req.body.postID);

        let baseSQL = `INSERT INTO messages(fk_sender, fk_receiver, message, fk_post)`; //currently missing session data
        let sqlValues = ` VALUES(?,?,?,?)`;
        
        let combine = baseSQL+sqlValues;
        console.log(combine);
        for (let i = 0; i < arguments.length; i++){
            console.log(arguments[i]);
        }
        
        db.execute(combine, arguments)
        .then(([results, fields]) => {
            if(results && results.affectedRows){
                successPrint('Message sent');
                // resp.redirect("/");
                resp.redirect("/posts/" + req.body.postID);
            }
            else{
                throw new UserError("Failed to send message", 
                "/",
                500);
            }
        })
        .catch((err) => {
            if(err instanceof UserError){
                errorPrint(err.message);
                resp.status(err.status);
                resp.redirect(err.redirectURL);
            }
            else{
                next(err);
            }
        })
    } else {
        resp.redirect('/login');
    }
});

// TODO(Lothar): Ensure the user is logged in as the correct user
router.get('/getMessagesForUser', (req, resp, next) => {
    if (req.session && req.session.userId) {
        let id = req.session.userId;
        
        let arguments = [];
        let _sql = 'SELECT m.id, m.created, m.message, m.fk_post AS postID, \
        p.title AS postTitle, u.email \
        FROM messages m \
        JOIN posts p ON m.fk_post = p.id \
        JOIN users u ON m.fk_sender = u.id WHERE m.fk_receiver = ?';
        arguments.push(id);
        db.query(_sql, arguments)
        .then(([results, fields]) => {
            resp.json(results);
        })
        .catch((err) => next(err));
    } else {
        resp.redirect('/login');
    }
});

module.exports = router;