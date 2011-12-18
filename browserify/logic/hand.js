/*globals $, module, console*/

var file = 'logic/hand: ';

var gcd;

var a;

module.exports = function (gcde, data) {
	gcd = gcde;
	
	gcd.on("new game requested"			, a["reset hand state"]);

	
	gcd.on("server started new game", a["load hand"]);
	gcd.on("server started new game", a["make call"]);

	gcd.on("draw cards requested"		, a["check draw state"]);


	gcd.on(""												, a[""]);
	
};

a = {
	'reset hand state' : function (data) {
		data.state = 'newhand';
	},
	'load hand' : function  (data) {
		
		gcd.emit("hand data processed", data);
	},
	'make call' : function  (data) {
		
	}
};

//server sent cards
			loadScore(data);
//			
			numcards(data.cardsleft);
			showDeck(); 

//server drew cards
loadHand(data.hand);
makeCall(data.call);
loadScore(data);
numcards(data.cardsleft);

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}

hailCall(drawcount, state);
state = 'oldhand';
flipCards();
