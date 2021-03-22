/*
    users.js
    
    Description: Contains all routes that request user information from the server
*/

var express = require('express');
var router = express.Router();
const db = require("../config/database");
const bcrypt = require('bcrypt');
const errorPrint = require("../helpers/debug/debughelpers").errorPrint;
const successPrint = require("../helpers/debug/debughelpers").successPrint;
const UserError = require("../helpers/errors/UserError");

router.post("/register", (req,resp, next) => {
    let firstName = req.body.UserFirstName;
    let lastName = req.body.UserLastName;
    let email = req.body.email;
    let password1 = req.body.UserPassword1;
    let password2 = req.body.UserPassword2;

    //first validate passwords on server
    if(password1 !== password2){
        resp.redirect('/registration');//Have to send user a pop-up
    }
    else{
        //search for email if it already has an account
        db.execute("SELECT * FROM users WHERE email=?;", [email])
        .then(([results, fields]) => {
            if(results && results.length==0){
                return bcrypt.hash(password1, 10);
            }
            else{
                throw new UserError(
                    "Failed Registration, email already exists",
                    "/registration",
                    200
                );
            }
        })
        //insert the new user into mysql table
        .then((hashedPassword) =>{
            let baseSQL =
            "INSERT INTO users (firstname, lastname, email, password) VALUES (?,?,?,?);";
            return db.execute(baseSQL, [firstName,lastName,email,hashedPassword]);
        })
        .then(([results, fields]) => {
            if(results && results.affectedRows){
                successPrint("Registration was successful!");
                resp.redirect("/login");
                //resp.json = ({status: "OK", message: "Successful registration!", "redirect": "/"});
            }
            else{
                throw new UserError(
                    "Server Error, user could not be created",
                    "/registration",
                    500
                  );
            }
        })
        //catch errors
        .catch((err) => {
            if (err instanceof UserError) {
                errorPrint(err.message);
                resp.status(err.status);
                resp.redirect(err.redirectURL);
                //resp.json = ({status: err.status, message: err.message, "redirect": err.redirectURL});
            }else{
              next(err);
            }
        });
    }
});

router.post("/login", (req, resp, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let userId;

    //search if email is in database, is currently not included in sql statement
    db.execute("SELECT id, password FROM users WHERE email=?;", [email])
    .then(([results, fields]) => {
        if(results && results.length == 1){
            let hPassword = results[0].password;
            userId = results[0].id;
            return bcrypt.compare(password, hPassword);
        }
        else{
            throw new UserError('username or password is incorrect','/login', 200);
        }
    })
    .then((check) => {
        if(check){
            successPrint(`Successful Login by ${email}`);
            req.session.email = email;
            req.session.userId = userId;
            req.session.save();
            console.log(req.session);
            resp.redirect('/');
          }else{
            throw new UserError('username or password is incorrect','/login', 200);
          }
    })
    .catch((err) => {
        if(err instanceof UserError) {
          errorPrint(err.message);
          resp.status(err.status);
          resp.redirect(err.redirectURL);
        }else{
          next(err);
        }
      })
});

router.get('/getUserInfo', (req, resp, next) => {
    if (req.session && req.session.userId) {
        let userID = req.session.userId;
        let arguments = [];
        let _sql = 'SELECT u.id, u.firstname, u.lastname, u.email, u.profilepic FROM users u \
        WHERE u.id = ?';
        arguments.push(userID);
        db.query(_sql, arguments)
        .then(([results, fields]) => {
            resp.json(results[0]);
        })
        .catch((err) => next(err));
    } else {
        resp.redirect('/login');
    }
});

router.post("/logout", (req,resp, next) => {
    req.session.destroy((err) => {
        if(err){
            errorPrint('Failed to destroy');
            next(err);
        }
        else{
            successPrint('session was destoryed');
            resp.clearCookie('csid');
            resp.redirect('/');
        }
    })
});

router.get('/checkLogin', (req, resp, next) => {
    if (req.session && req.session.userId) {
        resp.json({loggedIn: true});
    } else {
        resp.json({loggedIn: false});
    }
});

module.exports = router;