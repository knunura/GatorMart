/*
    index.js
    
    Description: Contains the route fetching the index page from the server
*/

var express = require('express');
var router = express.Router();
var isLoggedIn = require("../middleware/routeprotectors").userIsLoggedIn;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', {root:'public/HTML'});
});

router.get('/registration', function(req, res, next) {
  res.sendFile('registration.html', {root:'public/HTML'});
});

router.use('/account', isLoggedIn);
router.get('/account', function(req, res, next) {
  res.sendFile('dashboard.html', {root:'public/HTML'});
});

router.use('/post', isLoggedIn);
router.get('/post', function(req, res, next) {
  res.sendFile('postsubmission.html', {root:'public/HTML'});
});

router.get('/login', function(req,res,next) {
  res.sendFile('login.html', {root:'public/HTML'});
});

router.get('/aboutus', function(req, res, next) {
  res.sendFile('aboutus.html', {root:'public/HTML'});
});

router.get('/privacy', function(req, res, next) {
  res.sendFile('privacy_policy.html', {root:'public/HTML'});
});

router.get('/terms', function(req, res, next) {
  res.sendFile('terms_and_conditions.html', {root:'public/HTML'});
});


module.exports = router;
