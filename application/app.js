var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sessions = require('express-session');
var mysqlSession = require('express-mysql-session')(sessions);

var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');
var postRouter = require('./routes/posts');
var catRouter = require('./routes/category');
var messageRouter = require('./routes/messages');

var errorPrint = require("./helpers/debug/debughelpers").errorPrint;
var requestPrint = require("./helpers/debug/debughelpers").successPrint;

var app = express();

app.use((req, res, next) => {
    console.info('\x1b[42m\x1b[30m Request URL : ' + req.url + '\x1b[0m');
    next();
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mysqlSessionStore = new mysqlSession({/* using default options */},require('./config/database'));
var sessionOptions = {
    key: "csid",
    secret: "this is a secret from CSC648",
    store:  mysqlSessionStore,
    cookie: {secure: false, httpOnly: false, maxAge:900000, SameSite: null},
    resave: false,
    saveUninitialized: false
};

app.use(sessions(sessionOptions));
app.use('/', indexRouter);
app.use('/users/', userRouter);
app.use('/posts/', postRouter);
app.use('/category/', catRouter);
app.use('/messages/', messageRouter);

app.use((err, req, res, next) => {
    res.status(500);
    console.log(err);
    res.sendFile('error.html', {root: "public/html" });
})

module.exports = app;
