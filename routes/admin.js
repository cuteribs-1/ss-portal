var express = require('express');
var router = express.Router();
var db = require('../db');
var utils = require('../utils');

router.use(function (req, res, next) {
	req.session.isAdmin = true;
	if (!req.session.isAdmin) {
		return res.redirect('../');
	}

	next();
});

// index
router.get('/', function (req, res, next) {
	return res.render('admin', {
		title: '管理界面'
	});
});

router.get('/chart', function (req, res, next) {
	var port = req.query.port;
	var type = req.query.type; // months, days, hours
	var sql;

	if (port < 0 || !type || !type.in('months', 'days', 'hours')) {
		throw new Error('参数错误');
	} else {
		db.getTraffics(port, type, function (err, rows) {
			if (err) {
				throw new Error('数据访问出错 ' + err.message);
			}

			return res.send({
				port: port,
				type: type,
				rows: rows
			});
		});
	}
});


// settings
router.get('/settings', function (req, res, next) {
	return res.render('admin/settings', {
		title: '管理界面'
	});
});


// users
router.get('/users', function (req, res, next) {
	return res.render('admin/users', {
		title: '管理界面'
	});
});

router.post('/userList', function (req, res, next) {
	db.getUsers((err, rows) => {
		if (err) {
			return res.sendStatus(500).send('数据访问错误 ' + err.message);
		}

		service.getStatus(() => {
			return res.send({
				data: rows,
				recordsTotal: rows.length
			});
		});
	})
});

router.get('/user', function (req, res, next) {
	var port = req.query['port'];

	if (port) {
		if (port > 0) {
			db.getUser(port, function (err, row) {
				return res.render('admin/_user', row);
			});
		} else {
			db.newUser(function (err, row) {
				var now = new Date();
				now.setFullYear(now.getFullYear() + 1);

				var user = {
					port: row.port,
					password: utils.randomPassword(8),
					traffic_limit: 0,
					traffic_left: 0,
					expiration_date: utils.toISODateString(now)
				};
				return res.render('admin/_new', user);
			});
		}
	} else {
		throw new Error('参数错误');
	}
});

router.post('/newUser', function (req, res, next) {
	var model = req.body;
	model.created_date = utils.toISODateTimeString(new Date());
	db.addUser(model, function (err) {
		if (err) {
			throw new Error('数据访问出错 ' + err.message);
		}

		return res.send('用户添加完成');
	});
});

router.post('/editUser', function (req, res, next) {
	var model = req.body;
	db.updateUser(model, function (err) {
		if (err) {
			throw new Error('数据访问出错 ' + err.message);
		}

		return res.send('用户修改完成');
	});
});

module.exports = router;