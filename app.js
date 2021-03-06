// import module
var bodyParser = require('body-parser');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var express = require('express');
var querystring = require('querystring');
var http = require('http');



var filesock = require('./models/filesock');
var uploadDB = require('./models/uploadDB');
var util=require('./models/Utility');
var pfcctr=require('./models/PFCCTR');
var Serverdownload = require('./models/ServerDownload');
var db = require('./models/db');
var geth = require('./models/geth');
var loginObj;
var ServerState = "UNSTABLE";

var io = require('socket.io');
var logger = require('morgan');
var path = require('path');
var session = require('express-session')( {
    secret:'XASDASDA',
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// express app create
var app = express();

// environment setup
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8081);

// router setup
var indexRouter = require('./controllers/index');
var creatorsRouter = require('./controllers/creators');
var usersRouter = require('./controllers/users');
var loginRouter = require('./controllers/login');
app.use('/', indexRouter);
app.use('/creators', creatorsRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

// settting header
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

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

// server port and io
var server = app.listen(8081, function () {
	// let host = server.address().address
	// let port = server.address().port
    // console.log("Server start http://%s:%s", host, port)
    console.log("start login cloudDB.........");
	uploadDB.loadcard()
	.then(function(result){
		//	console.log(result);
		loginObj={
			profile:result,
			userID:result.IDc,
			userKey:util.UTILS_HexStringToIntArray(result.Kp),
			keywordKey:null,
			proxySk:null,
			serverSk:null,
		};
		return uploadDB._makaWithProxy(loginObj);
	}).then(function(isSuccess){
		console.log(isSuccess);
		return uploadDB._makaWithServer(loginObj);
	}).then(function(isSuccess){
		console.log(isSuccess);
		return uploadDB._login(loginObj);
	}).then(function(isSuccess){
		console.log(isSuccess);
		return uploadDB.generateCard(loginObj.profile);
	}).then(function(isSuccess){
		console.log(isSuccess);
		console.log("finish login cloudDB.........");
		ServerState = "STABLE";
		let host = server.address().address
		let port = server.address().port
		console.log("Server start http://%s:%s", host, port);
	}).catch(function (error) {
		console.log(error);
		process.exit();
	}).done();

	// geth.unlockAdminAccount();
});

var serv_io = io.listen(server);

serv_io.use(sharedsession(session, { autoSave:true }));

serv_io.sockets.on('connection', function(socket) {
	if(ServerState=="STABLE"){
		filesock.sock_recv(socket,loginObj,uploadDB, db);
	}
});

function getServerState(){
    return ServerState;
}

function getLoginObject() {
    return loginObj;
}

module.exports.getServerState = getServerState;
module.exports.getLoginObject = getLoginObject;
module.exports = app;
