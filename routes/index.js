var express = require('express');
var router = express.Router();
var db = require('../db');

// router.use('/', function(req, res, next) {
// 	next();
// 	console.log(1);
// });

router.get('/', function(req, res, next) {
	var model = {
		title: 'SS Portal',
		isAdmin: req.session.isAdmin,
		isUser: req.session.isUser,
		isLoggedIn: req.session.isAdmin | req.session.isUser
	};
	model.isAdmin = true;
	res.render('index', model);
});

router.post('/login', function(req, res, next) {
	var port = req.body['login-port'];
	var password = req.body['login-password'];

	if (port == 0) {
		db.loginAsAdmin(password, function(isValid) {
			if(isValid) {				
				req.session.isAdmin = true;
				return res.send({ message: '登录为管理员', url: '/admin' });
			}					
			
			return next();
		});
	}
	else if (port > 0 && port < 65535) {
		db.login(port, password, function(isValid) {
			if(isValid) {
				req.session.port = port;
				return res.send({ message: '登录成功', url: '/user' });
			}
			
			return next();
		});
	}
	else {		
		return next();
	}
}, function(req, res, next) {
	throw new Error('登录失败');
});

module.exports = router;
