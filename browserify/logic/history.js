/*globals module, console, require*/

var historyCount, zeroCount, incCount, assembleTableRow, oldHand, suitHtml, shortHand, shortHandCall; 

var gcde, uie;

var cardutil = require('../utilities/cards');

var shorthand = cardutil.shorthand, 
		shorthandcall = cardutil.shorthandcall; 

module.exports = function (gcd, ui) {
	gcd.on("clear history", zeroCount);

	gcd.on("prep for add history", incCount);
	gcd.on("prep for add history", assembleTableRow);
	gcd.on("prep for add history", function () {console.log("add history");});
	
	ui.on('add history', function () {console.log("atr expo");});
	
	
	uie = ui; 
	gcde = gcd;
	
};

historyCount = 0;

zeroCount = function () {
	historyCount = 0;
};

incCount = function () {
		historyCount += 1;
};


assembleTableRow = function (info) {
	 uie.emit("add history", {
		num: historyCount,
		score: info.score, 
		deltalablel: info.deltalabel,
		hand: shorthand(info.hand), 
		call: shorthandcall(info.call)
		});
};






