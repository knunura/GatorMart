const routeProtectors = {};
const errorPrint = require ("../helpers/debug/debughelpers").errorPrint;
const successPrint = require("../helpers/debug/debughelpers").successPrint;

routeProtectors.userIsLoggedIn = function(req, resp, next){
    if(req.session && req.session.userId){
        successPrint('User is logged in');
        next();
    }else{
        errorPrint('User is not logged in, sending to /login');
        resp.redirect('/login');
    }
}

module.exports = routeProtectors;