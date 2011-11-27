/*jslint node:true */
/*global exports */

exports.newgame = function(gid, game) {
	//store the game into new place
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