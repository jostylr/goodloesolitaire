/*jslint node:true */
/*global exports */

//load high scores
var highscores =  [
{gid:"3", score:"400", name:"James", date:Date.UTC(2011, 11, 25)},
{gid:"1", score:"800", name:"A", date:Date.UTC(2011, 10, 25)},
{gid:"2", score:"1000", name:"B", date:Date.UTC(2011, 11, 23)}
];

exports.highscores = highscores;

exports.viewscores = function (res) {
	res.json(highscores);
};

exports.update = function (score, gid, name) {
	if (highscores.length > 9) {highscores.shift();} 
	highscores.unshift({gid:gid, score:score, name:name, date:Date.now()});
	highscores.sort(function (a,b) {return a.score - b.score;});
	console.log(highscores);
};

//scoring functions take in a diff and a game. mainly diff
//diff is of the form [type of diff, level change]
exports.scoring = {
	"basic" : function (diff, game) {
		var streak = game.data.streak;
		var delta = 0;
		var lvl = 0;
		//no change, streak grows, not score
		if (diff[0] === 0) {
			if (streak > 0 ) {
				streak += 1; 
				delta = 0;
			} else {
				streak -= 1;
				delta = 0;
			}
	  } else if (diff[0] > 0) { 
			if (streak >0) {
				//streak continues
				streak += 1;
			} else {
				streak = 1;
			}
			delta = 100*streak*streak;
			if (diff[0] === 1) { //major change
				delta *= diff[1];
				lvl = diff[1];
			}
		} else {
			if (streak < 0) {
				//losing streak continues
				streak -= 1;
			} else {
				streak = -1;
			}
			delta = -100*streak*streak;
			if (diff[0] === 1) { //major change
				delta *= diff[1];
				lvl = diff[1];
			}
		}
		game.data.streak = streak;
		game.data.score += delta;
		game.data.level += lvl;
		return delta; 
	}
};