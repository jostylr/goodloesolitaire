/*globals $, module, console, require*/

var file = 'ui/history: ';

var gcd, ui;

var a;

module.exports = function (gcde, uie, data) {
	ui = uie; 
	gcd = gcde;
		
	ui.on("clear history", a['empty history body']);
	
	ui.on("add history", a['add row to history']);
	
	
};

a = {
	'empty history body' :  function () {
		$('#history table tbody').empty();
	},
	
	'add row to history' :  function (data) {
		$('#history table tbody').prepend(
			"<tr><td>" + data.num + ".</td><td>" +
			data.score + "</td><td><span " + data.deltalabel + "</span></td><td class='left'>" +
			a["assemble the hand's short call"](data.shorthand) +
			"</td><td>" + data.shortcall + "</td></tr>"
			);		
	}, 
	
	"assemble the hand's short call" :  function (hand) {
		var i, n, c, shc; 
		n = hand.length; 
		shc = '';
		for (i= 0; i <n; i += 1) {
			c = hand[i];
			if (c[0] === "new") {
				shc += " <strong>"+c[1] +c[2]+"</strong> ";					
			} else {
				shc += " " + c[1] + c[2] + " ";								
			}
		}
		return shc; 
	}
};

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}
