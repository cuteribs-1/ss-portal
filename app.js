var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var admin = require('./routes/admin');
var user = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('vash').__express);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
// app.use(logger('dev'));
app.use(session({
	secret: 'ssportal-session',
	proxy: true,
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/font-awesome/css')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/datatables.net-bs/css')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap-datepicker/dist/css')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/highcharts/css')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/bootstrap/fonts')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));
app.use('/images', express.static(path.join(__dirname, 'node_modules/datatables/media/images')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/datatables.net/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/datatables.net-bs/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap-datepicker/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/highcharts/js')));

app.use('/', index);
app.use('/user', user);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	console.error(err.stack)
	next(err);
})

app.use(function (err, req, res, next) {
	if(req.xhr) {		
		res.status(500).send(err.message);
	}
	next(err);
})

app.listen(80, function() {
	console.log('listening port 80...');
});

module.exports = app;
