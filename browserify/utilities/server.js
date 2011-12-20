/*globals $, exports, console*/

//server interaction. A thin wrapper around jquery server methods
	
var server = '';//'http://127.0.0.1:3000/';	
	
console.log("server")
	
exports.put = function (command, data, callback) {
	$.ajax(server + command, {
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: "json",
		success: callback || function (data, status) {console.log(command, data, status);},
		error  : function() { console.log("error response"); }
	});
};

exports.get = function (command, callback) {
	$.ajax(server + command, {
		type: 'GET',
		contentType: 'application/json',
		dataType: "json",
		success: callback || function (data, status) {console.log(command, data, status);},
		error  : function() { console.log("error response"); }
	});
};
