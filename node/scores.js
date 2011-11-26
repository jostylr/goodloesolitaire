/*jslint node:true */
/*global exports */

//load high scores
var highscores =  [
{gid:"0", score:"400", name:"James", date:"11/25/11"},
{gid:"1", score:"800", name:"A", date:"11/25/11"},
{gid:"2", score:"1000", name:"B", date:"11/25/11"}
];

exports.highscores = highscores;

exports.viewscores = function (res) {
	res.json(highscores);
};

exports.update = function (score, gid, name) {
	if (highscores.length > 9) {highscores.shift();} 
	highscores.unshift({gid:gid, score:score, name:name, date:Date.now()});
	highscores.sort(function (a,b) {return a.score - b.score;});
};