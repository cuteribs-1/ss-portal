var crypto = require('crypto');

var utils = module.exports = {
	sha256String: function (plain) {
		var hash = crypto.createHash('sha256').update(plain).digest('hex');
		return hash;
	},
	randomPassword: function (length) {
		var dict = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz';
		var dictLength = dict.length;
		var password = '';

		for (var i = 0; i < length; i++) {
			password += dict[Math.floor(Math.random() * dictLength)];
		}

		return password;
	},
	toISODateString: function (date) {
		if (date instanceof Date) {
			return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padLeft(2, '0') + '-' + date.getDay().toString().padLeft(2, '0');
		}

		throw new Error('not a Date object.');
	},
	toISODateTimeString: function (date) {
		if (date instanceof Date) {
			return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padLeft(2, '0') + '-' + date.getDay().toString().padLeft(2, '0') + ' ' + date.getHours().toString().padLeft(2, '0') + ':' + date.getMinutes().toString().padLeft(2, '0') + ':' + date.getSeconds().toString().padLeft(2, '0');
		}

		throw new Error('not a Date object.');
	}
};

String.prototype.in = function () {
	for (var i = 0; i < arguments.length; i++) {
		if (this == arguments[i]) {
			return true;
		}
	}

	return false;
};

String.prototype.padLeft = function (totalWidth, paddingChar) {
	if (this.length >= totalWidth || totalWidth < 0) {
		return this.toString();
	}

	return Array(totalWidth - this.length + 1).join(paddingChar).concat(this);
};

String.prototype.padRight = function (totalWidth, paddingChar) {
	if (this.length >= totalWidth || totalWidth < 0) {
		return this.toString();
	}

	return this.concat(Array(totalWidth - this.length + 1).join(paddingChar));
};