/*globals $, module, console*/

var file = 'logic/hand: ';

var gcd;

var a;

module.exports = function (gcde, data) {
	gcd = gcde;
	
	gcd.on("new game requested"			, a["reset hand state"]);
	
	gcd.on("server returns new game", a["load hand"]);
	gcd.on("server returns new game", a["make call"]);

	gcd.on(""												, a[""]);
	
};

a = {
	'reset hand state' : function (data) {
		data.state = 'newhand';
	},
	'load hand' : function  (data, server) {
		
		gcd.emit("hand data processed", data);
	},
	'make call' : function  (data, server) {
		
	}
	
};

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}


