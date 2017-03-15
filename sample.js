var fs = require('fs');
var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database('db/portal.db');

function createSample() {
	console.log('createSample');
	db.serialize(function() {
		db.exec('BEGIN');	
		console.log('drop tables...');
		db.run('DROP TABLE IF EXISTS settings;');
		db.run('DROP TABLE IF EXISTS users;');
		db.run('DROP TABLE IF EXISTS traffics;');
		
		console.log('create tables...');
		db.run('CREATE TABLE IF NOT EXISTS [settings] ([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, [key] NVARCHAR2(100) NOT NULL UNIQUE, [value] NVARCHAR2(500));');
		db.run('INSERT INTO settings (key, value) VALUES ("admin", "ef51306214d9a6361ee1d5b452e6d2bb70dc7ebb85bf9e02c3d4747fb57d6bec");');
		db.run('CREATE TABLE IF NOT EXISTS [users] ([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, [port] INTEGER NOT NULL UNIQUE, [password] NVARCHAR2(64) NOT NULL, [traffic_limit] INTEGER NOT NULL DEFAULT 0, [traffic_left] INTEGER NOT NULL DEFAULT 0, [expiration_date] DATETIME NOT NULL, [created_date] DATETIME NOT NULL);');
		db.run('CREATE TABLE IF NOT EXISTS [traffics] ([id] INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, [port] INTEGER NOT NULL, [log_date] DATETIME NOT NULL, [amount] INTEGER NOT NULL DEFAULT 0);');
		
		console.log('prepare users...');
		var statement = db.prepare('INSERT INTO users (port, password, expiration_date, created_date) VALUES ($port, "pwd", DATE("2077-01-01"),  DATETIME("NOW", "LOCALTIME"))');

		for(var i = 0; i < 10; i++) {
			statement.run({ '$port': 8000 + i });
		}

		statement.finalize();

		console.log('prepare traffics...');
		statement = db.prepare('INSERT INTO traffics (port, log_date, amount) VALUES ($port, DATETIME($logDate), $amount)');
		var logDate, now = new Date().valueOf();
		console.log(new Date().toISOString());

		for(var i = 0; i < 10; i++) {
			for(var d = 60; d > -15; d--) {
				for(var h = 24; h > 0; h--) {
					logDate = new Date(now);
					logDate.setDate(logDate.getDate() - d);
					logDate.setTime(logDate.getTime() - h * 3600 * 1000);
					logDate.setMinutes(0, 0, 0);

					statement.run({ 
						'$port': 8000 + i,
						'$logDate': logDate.toISOString(),
						'$amount': Math.ceil(Math.random() * Math.pow(2, 20))
					});
				}
			}
		}

		console.log(logDate);
		statement.finalize();
		console.log('finalized.');
		db.exec('COMMIT');
	});
	
	db.close(function() {
		console.log('createSample done');
		process.exit();
	});
}

function exportData() {
	console.log('exportData');
	var ws = fs.createWriteStream('./data.csv');
	db.each('SELECT log_date, SUM(amount) amount FROM traffics GROUP BY log_date', function(err, row) {
		ws.write('"' + row['log_date'] + '",' +row['amount'] + '\n');
	}, function() {
		ws.end();
	});
}

createSample();