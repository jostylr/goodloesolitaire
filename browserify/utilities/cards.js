/*globals exports */
	
var ranks = {
		"A": ["Aces", "Ace"], 
		"K": ["Kings","King"],
		"Q": ["Queens","Queen"] ,
		"J": ["Jacks","Jack"],
		"T": ["Tens","Ten"],
		"9": ["Nines","Nine"],
		"8": ["Eights","Eight"],
		"7": ["Sevens","Seven"],
		"6": ["Sixes","Six"],
		"5": ["Fives","Five"],
		"4": ["Fours","Four"],
		"3": ["Threes","Three"],
		"2": ["Twos", "Two"]
};
      

exports.deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
					"6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
				  "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
				  "Ac",  "Ad",  "Ah",  "As"
];   

exports.handcall = function (call) {
	switch (call[0]) {
		case "5":  return ["5" , [ranks[call[1]][0] ]]; 
		case "sf": return ["sf", [ranks[call[1]][1] ]];
		case "4":  return ["4" , [ranks[call[1]][0], ranks[call[2]][1] ]]; 
		case "fh": return ["fh", [ranks[call[1]][0], ranks[call[2]][0] ]]; 
		case "f":  return ["f" , [ranks[call[1]][1] ]]; 
		case "s":  return ["s" , [ranks[call[1]][1] ]]; 
		case "3":  return ["3" , [ranks[call[1]][0], ranks[call[2]][1], ranks[call[3]][1] ]]; 
		case "2p": return ["2p", [ranks[call[1]][0], ranks[call[2]][0], ranks[call[3]][1] ]];
		case "2":  return ["2" , [ranks[call[1]][0], ranks[call[2]][1], ranks[call[3]][1], ranks[call[4]][1] ]]; 
		case "1":  return ["1" , [ranks[call[1]][1], ranks[call[2]][1], ranks[call[3]][1], ranks[call[4]][1], ranks[call[5]][1] ]]; 
	}
};

	
var suitHtml = {
	c: "&#x2663;",
	d: "&#x2666;", 
	h: "&#x2665;",
	s: "&#x2660;"
};

var oldHand = false;

exports["generate short hand string"] = function (hand) {
	var i; 
	if (!oldHand) {
		oldHand = hand;
	}
	var ret = [];
	for (i = 0; i < 5; i+=1) {
		if (hand[i] === oldHand[i]) {
		  ret.push('old', [hand[i][0], suitHtml[hand[i][1]]]);	
		} else {
			ret.push('new', [hand[i][0], suitHtml[hand[i][1]]]);
		}
	}
	oldHand = hand; 
	return ret;
};

exports["generate short version of call"] = function (call){
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
