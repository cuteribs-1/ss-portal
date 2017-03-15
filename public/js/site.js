

var dpToDisplay = function (date, format, language) {
	var d = new Date(date);
	d.setDate(d.getDate() - 7);
	return d.toISOString();
};

var dpToValue = function (date, format, language) {
	var d = new Date(date);
	d.setDate(d.getDate() + 7);
	return new Date(d);
};