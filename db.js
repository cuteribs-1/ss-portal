var utils = require('./utils');
var fs = require('fs');
var sqlite3 = require('sqlite3')
var fileName = 'db/portal.db';
var database;

var db = module.exports = {
	exists: false,
	checkDatabase: function() {
		if(!db.exists && !fs.existsSync(fileName)) {
			database = new sqlite3.Database(fileName);
			database.serialize(function() {
				database.run('CREATE TABLE IF NOT EXISTS [settings] ([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, [key] NVARCHAR2(100) NOT NULL UNIQUE, [value] NVARCHAR2(500));');
				database.run('CREATE TABLE IF NOT EXISTS [users] ([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, [port] INTEGER NOT NULL UNIQUE, [password] NVARCHAR2(64) NOT NULL, [traffic_limit] INTEGER NOT NULL DEFAULT 0, [traffic_left] INTEGER NOT NULL DEFAULT 0, [expiration_date] DATE NOT NULL, [created_date] DATE NOT NULL, [is_active] BOOLEAN NOT NULL DEFAULT 1);');
				database.run('CREATE TABLE IF NOT EXISTS [traffics] ([id] INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, [port] INTEGER NOT NULL, [log_date] DATETIME NOT NULL, [amount] INTEGER NOT NULL DEFAULT 0);');
				database.run('INSERT INTO settings (key, value) VALUES ("admin", "ef51306214d9a6361ee1d5b452e6d2bb70dc7ebb85bf9e02c3d4747fb57d6bec");');
				db.exists = true;
			});
		}
		
		database = new sqlite3.Database(fileName);
	},
	loginAsAdmin: function(password, callback) {
		db.checkDatabase();
		var hash = utils.sha256String(password);
		database.get('SELECT 1 val FROM settings WHERE key = "admin" AND value = $password', { '$password': hash }, function(err, row) {
			callback(!err && row && row.val == 1);
		});
	},
	login: function(port, password, callback) {
		db.checkDatabase();
		database.get('SELECT 1 val FROM users WHERE port = $port AND password = $password', { '$port': port, '$password': password }, function(err, row) {
			callback(!err && row && row.val == 1);
		});
	},
	getTraffics: function(port, type, callback) {
		db.checkDatabase();
		var sql;

		if(port > 0) {
			switch(type) {
				case 'months':
					sql = 'SELECT STRFTIME("%Y-%m", DATE(log_date, "LOCALTIME")) log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY port, STRFTIME("%Y-%m", DATE(log_date, "LOCALTIME")) HAVING port = $port AND log_date <= DATE("NOW") AND DATE(log_date) > DATE("NOW", "-1 YEARS");';
					break;
				case 'days':
					sql = 'SELECT DATE(log_date, "LOCALTIME") log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY port, DATE(log_date) HAVING port = $port AND log_date <= DATE("NOW") AND DATE(log_date) > DATE("NOW", "-7 DAYS");';
					break;
				case 'hours':
				default:
					sql = 'SELECT DATETIME(log_date, "LOCALTIME") log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY port, log_date HAVING port = $port AND  log_date <= DATETIME("NOW") AND log_date > DATETIME("NOW", "-1 DAYS");';
					break;
			}

			database.all(sql, { '$port': port }, function(err, rows) {
				callback(err, rows);
			});
		} else {
			switch(type) {
				case 'months':
					sql = 'SELECT STRFTIME("%Y-%m", DATE(log_date, "LOCALTIME")) log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY STRFTIME("%Y-%m", DATE(log_date, "LOCALTIME")) HAVING log_date <= DATE("NOW") AND DATE(log_date) > DATE("NOW", "-1 YEARS");';
					break;
				case 'days':
					sql = 'SELECT DATE(log_date, "LOCALTIME") log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY DATE(log_date) HAVING log_date <= DATE("NOW") AND DATE(log_date) > DATE("NOW", "-7 DAYS");';
					break;
				case 'hours':
				default:
					sql = 'SELECT DATETIME(log_date, "LOCALTIME") log_date, SUM (amount) / 1024 amount FROM traffics GROUP BY log_date HAVING log_date <= DATETIME("NOW") AND log_date > DATETIME("NOW", "-1 DAYS");';
					break;
			}

			database.all(sql, function(err, rows) {
				callback(err, rows);
			});
		}
	},
	getUsers: function(callback) {
		db.checkDatabase();
		var sql = 'SELECT * FROM users';

		database.all(sql, function(err, rows) {
			callback(err, rows);
		});
	},
	newUser: function(callback) {
		db.checkDatabase();
		var sql = 'SELECT MAX(port) + 1 port FROM users';
		database.get(sql, function(err, row) {
			callback(err, row);
		});
	},
	getUser: function(port, callback) {
		db.checkDatabase();
		var sql = 'SELECT id, port, password, traffic_limit, traffic_left, expiration_date, created_date, is_active FROM users WHERE port = $port';
		database.get(sql, { $port: port }, function(err, row) {
			callback(err, row);
		});
	},
	addUser: function(model, callback) {
		db.checkDatabase();
		var sql = "INSERT INTO users (port, password, traffic_limit, traffic_left, expiration_date, created_date, is_active) VALUES ($port, $password, $traffic_limit, $traffic_left, $expiration_date, $created_date, $is_active)";
		database.run(sql, {
			$port: model.port,
			$password: model.password,
			$traffic_limit: model.traffic_limit,
			$traffic_left: model.traffic_left,
			$expiration_date: model.expiration_date,
			$created_date: model.created_date,
			$is_active: model.is_active
		}, function(err){
			callback(err);
		});
	},
	updateUser: function(model, callback) {
		db.checkDatabase();
		var sql = "UPDATE users SET password = $password, traffic_limit = $traffic_limit, traffic_left = $traffic_left, expiration_date = $expiration_date, is_active = $is_active WHERE port = $port";
		database.run(sql, {
				$port: model.port,
				$password: model.password,
				$traffic_limit: model.traffic_limit,
				$traffic_left: model.traffic_left,
				$expiration_date: model.expiration_date,
				$is_active: model.is_active
			}, function(err) {
			callback(err);
		});
	}
};
