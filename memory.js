/*jslint node:true */
/*global exports */

var simpledb = require('simpledb');

//var sdb = new simpledb.SimpleDB({keyid:'YOUR_AWS_KEY_ID',secret:'YOUR_AWS_SECRET_KEY'});
	
exports.newgame = function(gid, game) {
	//store the game into new place
	
	//put (gid, game)
};

exports.update = function (gid, game, newdata) {
	game.hand = newdata.hand;
	game.draws.push(newdata.draws);
	game.current = newdata.current;
	game.score = newdata.score;
	game.status = newdata.status;
	//store in db
};

//just a stub for now
exports.retrievegame = function (res, gid, games) {
	if (games.hasOwnProperty(gid)) {
		res.json(games[gid]);
	} else {
		res.send(gid+" can't be found.");
	}
};

exports.endgame = function (gid) {
	//change game status to end in backend
};