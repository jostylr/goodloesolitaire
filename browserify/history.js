/*globals module, console*/

var historyCount, zeroCount, incCount, assembleTableRow, oldHand, suitHtml, shortHand, shortHandCall; 

var gcde, uie;

module.exports = function (gcd, ui) {
	gcd.on("clear history", zeroCount);

	gcd.on("prep for add history", incCount);
	gcd.on("prep for add history", assembleTableRow);
	gcd.on("prep for add history", function () {console.log("add history")});
	
	
	
	uie = ui; 
	gcde = gcd;
	
};

historyCount = 0;

zeroCount = function () {
	historyCount = 0;
};

incCount = function () {
		historyCount +=1;
};


assembleTableRow = function (info) {
	 uie.emit("add history", {
		num: historyCount,
		score: info.score, 
		deltalablel: info.deltalabel,
		hand: shortHand(info.hand), 
		call: shortHandCall(info.call)
		});
};


oldHand = false;

suitHtml = {
	c: "&#x2663;",
	d: "&#x2666;", 
	h: "&#x2665;",
	s: "&#x2660;"
};

shortHand = function (hand) {
	var i; 
	if (!oldHand) {
		oldHand = hand;
	}
	var ret = '';
	for (i = 0; i < 5; i+=1) {
		if (hand[i] === oldHand[i]) {
		  ret += " "+hand[i][0] +suitHtml[hand[i][1]]+" ";	
		} else {
		  ret += " <strong>"+hand[i][0] +suitHtml[hand[i][1]]+"</strong> ";					
		}
	}
	oldHand = hand; 
	return ret;
};

shortHandCall = function (call){
	switch (call[0]) {
		case "5":  return "5K";
		case "sf": return "SF";
		case "4":  return "4K";
		case "fh": return "FH";
		case "f":  return "Fl";
		case "s":  return "St";
		case "3":  return "3K";
		case "2p": return "2P";
		case "2":  return "1P";
		case "1":  return "▬" ;
	}
};



