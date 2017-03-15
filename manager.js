var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var managerAddress = {
	ip: 'localhost',
	port: 180
};

var manager = module.exports = {
	interval: null,
	add: (port, password, callback) => {
		var command = 'add: { "server_port": ' + port + ', "password": "' + password + '" }';
		sendToSS(command, result => {
			callback(true);
		});
	},
	remove: (port, callback) => {
		var command = 'remove: { "server_port": ' + port + ' }';
		sendToSS(command, result => {
			callback(true);
		});
	},
	stat: callback => {
		var command = 'ping';
		sendToSS(command, result => {
			var data = JSON.parse(result.substr(6));
			callback(data);
		});
	},
	startMonitoring: callback => {
		manager.interval = setTimeout(() => { manager.stat(callback); }, 1000 * 3600 * 1);
	},
	stopMonitoring: () => {
		clearInterval(manager.interval);
	}
};

var sendToSS = (command, callback) => {
	client.send(Buffer.from(command), managerAddress.port, managerAddress.ip, err => {
		if (err) {
			console.log('error');
			console.log(err);
			return;
		} else {
			client.on('message', (msg, info) => {
				callback(String(msg));
				client.close();
			});
		}
	});
};

switch (process.argv[2]) {
	case 'add':
		manager.add(Number(process.argv[3]), process.argv[3], isOK => {
			console.log('add ' + (isOK ? 'ok' : 'failed'));
		});
		break;
	case 'remove':
		manager.remove(Number(process.argv[3]), isOK => {
			console.log('remove ' + (isOK ? 'ok' : 'failed'));
		});
		break;
	case 'ping':
		manager.stat(data => {
			for (var p in data) {
				console.log(p + ' ' + data[p]);
			}
		});
}