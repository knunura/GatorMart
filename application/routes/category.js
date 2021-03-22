/*
    category.js
    
    Description: Contains the route for the categories that go into nav bar
*/

var express = require('express');
var router = express.Router();
const db = require("../config/database");

router.get('/', (req,resp,next) => {
    let sql = 'SELECT * FROM category;';
    db.query(sql)
    .then(([results, fields]) => {
        resp.json(results);
    })
    .catch((err) => next(err));
});

module.exports = router;