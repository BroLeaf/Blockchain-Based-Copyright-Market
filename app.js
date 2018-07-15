var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// author: lary
var fs = require("fs");
var bodyParser = require('body-parser');
var querystring = require('querystring');
var http = require('http');
var util=require('./models//Utility');
var crypt = require('./models/usage');
var filesock = require('./models/filesock');
var session = require('express-session')( {
    secret:'XASDASDA',
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var io = require('socket.io'); 
var ssn;

var server = app.listen(8081, function () { // change port from 8081 to 3000
	var host = server.address().address
	var port = server.address().port
	console.log("Server start http://%s:%s", host, port)
});
var serv_io = io.listen(server);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session);
serv_io.use(sharedsession(session, {
    autoSave:true
}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

serv_io.sockets.on('connection', function(socket) {
	filesock.sock_recv(socket);
});	

var indexRouter = require('./controllers/index');
var creatorsRouter = require('./controllers/creators');
var usersRouter = require('./controllers/users');
var loginRouter = require('./controllers/login');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/creators', creatorsRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
