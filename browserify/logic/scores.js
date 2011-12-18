/*globals $, module, console*/

//logic

//loading a hand

var handcall; 

var gcde, uie;

module.exports = function (gcd, ui) {
	ui.on("")
		uie = ui; 
		gcde = gcd;
};

a = {
	
	'check score/name' : function () {
		if (!name && score >= highscores[0].score) {
			submitScore();  //shows modal
		} else {
			gcde.emit("send endgame");		
	},

	
	var inarow = function (streak, level, typechange) {
		var streaktext;
		if (typechange > 2) {
			streaktext = streak+" in a row"+ (level ? " with a bonus of "+level+"!" : "!");			
		} else {
			streaktext = "&nbsp;";			
		} 
	  $('#inarow').html(streaktext);
	}; 

}




b = {
	score : 0,
	highscores : [],
	var scoredata = [];
	var oldHighScores = false;
	
}
