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
var sharp = require('sharp');
var multer = require('multer');
var crypto = require('crypto');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/Images/uploads");
    },
    filename: function(req, file, cb) {
        let fileExt = file.mimetype.split("/")[1];
        let randomName = crypto.randomBytes(22).toString("hex");
        cb(null, `${randomName}.${fileExt}`);
    }
});

var uploader = multer({storage: storage});

router.get('/getPostsByUser', (req, resp, next) => {
    if (req.session && req.session.userId) {
        let userID = req.session.userId;
        let arguments = [];
        let _sql = 'SELECT p.id, p.title, p.created, p.approved FROM posts p \
        WHERE p.fk_userid = ?';
        arguments.push(userID);
        db.query(_sql, arguments)
        .then(([results, fields]) => {
            resp.json(results);
        })
        .catch((err) => next(err));
    } else {
        resp.redirect('/login');
    }
});

router.post('/createPost', uploader.single('upload'), (req, resp, next) => {    
    let fileUploaded = req.file.path;
    let fileASThumbnail = `thumbnail-${req.file.filename}`;
    let destofThumbnail = req.file.destination+"/"+fileASThumbnail;
    let arguments = [];
    //probably do validation before sending to sql
    arguments.push(req.body.title);
    arguments.push(req.body.description);
    arguments.push(req.body.cat);
    arguments.push(req.session.userId);
    var forPOST = fileUploaded.replace("public", "..");
    var forPOST2 = destofThumbnail.replace("public", "..");
    arguments.push(forPOST);
    arguments.push(forPOST2);
    let price = req.body.price;
    let classID = req.body.classID;

    let baseSQL = `INSERT INTO posts(title, description, category, fk_userid, photopath, thumbnail`; //currently missing session data
    let sqlValues = ` VALUES(?,?,?,?,?,?`;

    if(price !== ''){
        baseSQL += `, price`;
        sqlValues += `,?`;
        arguments.push(price);
    }
    if(classID !== ''){
        baseSQL += `, class`;
        sqlValues += `,?`;
        arguments.push(classID);
    }
    baseSQL += `)`;
    sqlValues += `)`;
    var combine = baseSQL+sqlValues;
    console.log(combine);
    for (var i =0; i<arguments.length;i++){
        console.log(arguments[i]);
    }

    sharp(fileUploaded)
    .resize(200, 200, {
        fit: "fill"
    })
    .toFile(destofThumbnail)
    .then(() => {
        return db.execute(combine, arguments);
    })
    .then(([results, fields]) => {
        if(results && results.affectedRows){
            successPrint('New Post created');
            resp.redirect("/");
        }
        else{
            throw new UserError("Failed to create new post", 
            "../HTML/postsubmission.html",
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
});

router.get('/search/:searchTerm/:searchCategory/:searchOrder', (req, resp, next) => {
    let searchTerm = req.params.searchTerm;
    let searchCategory = req.params.searchCategory;
    let searchOrder = req.params.searchOrder;
    
    let arguments = [];
    let _sql = 'SELECT p.id, p.title, p.category, p.price, p.thumbnail, p.created \
    FROM posts p WHERE ';
    if (searchTerm !== '__NO_VALUE__') {
        _sql += '(title LIKE ? OR class LIKE ?) AND ';
        arguments.push('%' + searchTerm + '%');
        arguments.push('%' + searchTerm + '%');
    }
    if(searchCategory !== 'All'){
        _sql += 'category = ? AND ';
        arguments.push(searchCategory);
    }
    _sql +='approved = 1 ORDER BY p.price';
    if(searchOrder === 'PriceHiToLow') {
        _sql += ' DESC';
    }
    db.query(_sql, arguments)
    .then(([results, fields]) => {
        resp.json(results);
    })
    .catch((err) => next(err));
});

router.get("/:id", (req, resp, next) => {
    resp.sendFile("item.html", {root: "public/html"});
});

router.get('/getPostById/:id', (req, resp, next) => {
    let _id = req.params.id;
    let _sql = 'SELECT p.id, p.title, p.description, p.price, p.class, p.created, p.photopath, p.category, \
    u.id AS userID, u.firstname, u.lastname, u.profilepic \
    FROM posts p \
    JOIN users u on p.fk_userid=u.id \
    WHERE p.id=?;';
    db.query(_sql,_id)
    .then(([results, fields]) => {
        resp.json(results[0]);
    })
    .catch((err) => next(err));
});

router.get('/getRecentPosts/:count', (req, resp, next) => {
    let count = req.params.count;
    let _sql = 'SELECT p.id, p.title, p.category, p.price, p.created, p.thumbnail FROM posts p \
    WHERE approved = 1 ORDER BY p.created DESC LIMIT ';
    _sql += count;          //For some reason, this wont work unless I add onto this string
    db.query(_sql)          //Might have to do with function ending too quickly without it
    .then(([results, fields]) => {
        resp.json(results);
    })
    .catch((err) => next(err));
});

router.delete('/delete/:postid', (req, resp, next) => {
    let arguments = [req.params.postid];
    let _sql = 'DELETE FROM posts \
    WHERE id = ?;';
    db.execute(_sql, arguments)
    .then(([results, fields]) => {
        resp.json({success: true});
    })
    .catch((err) => {
        resp.json({success: false});
        next(err);
    });
});

module.exports = router;