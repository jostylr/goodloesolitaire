/*globals exports, console*/

var hello = "geeze";

exports.shorthandcall = function (call){
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


//test
console.log(exports.shorthandcall(['fh']));
console.log("hithi");