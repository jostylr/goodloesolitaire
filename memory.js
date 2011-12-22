/*jslint node:true */
/*global exports */

var mongodriver = require('mongodb'); 
var Db = mongodriver.Db;
var Server = mongodriver.Server;


//initialize: 
var client = new Db('gs', new Server("127.0.0.1", 27017, {auto_reconnect:true}));

var db;
var dbgames, dbhigh;
//for some highscore hijinx


//gives scores initializehs the data

//combining initializing hs with initializing database connection. REFACTOR
exports.initializehs = function (sciniths) {
	client.open(function(err, p_client) {
		db = p_client;
		//load games collection
	  db.collection('games', function (err, collection){
			dbgames = collection;
		});
		//load highscores collection
	  db.collection('highscores', function (err, collection){
			dbhigh = collection;
			dbhigh.find().sort({score: -1}).limit(10).toArray(function (err, docs) {
				if (err) {
					console.log(err);
					sciniths({});
				} else {
					//console.log(docs);
					sciniths(docs);
				}
			});	
		});
	});
	
};


exports.newgame = function(gid, game) {
	//store the game into new place
	game.gid = gid;
	dbgames.insert(game, {safe:true}, function (err, doc) {
		if (err) {console.log(err); return false;
			}
	});
	//put (gid, game)
};

//write a wrapper for updating objects with fields in same way as mongo

exports.update = function (gid, game, newdata) {
	game.hand = newdata.hand;
	game.draws.push(newdata.draws);
	game.current = newdata.current;
	game.score = newdata.score;
	game.status = newdata.status;
	//store in db
	dbgames.update({"gid":gid}, {$set: {"hand":newdata.hand, "current":newdata.current, "score": newdata.score, "status":newdata.status}, 
		$push : {"draws":newdata.draws}}, {safe:true}, function (err, doc) {
			if (err) {console.log(err); return false;}
		});
};

exports.loadgame = function (gid, callback) {
	dbgames.findOne({gid:gid}, callback);
};

exports.savehighscore = function (score, gid, name) {
	dbhigh.insert({"_id"	:gid, score:score, name:name, date:Date.now() },{safe:true}, function (err, doc) {
		if (err) {console.log(err); return false;}
		});
};

//just a stub for now
exports.retrievegame = function (res, gid, games) {
	if (games.hasOwnProperty(gid)) {
		res.json(games[gid]);
	} else {
		dbgames.findOne({"gid":gid}, function (err, doc) {
			console.log(err, doc);
			if (err) {
				res.send(gid+" can't be found.");
			} else {
				if (doc && doc.hasOwnProperty('status') && doc.status === 'end') {
					res.json(doc);				
				} else {
					res.send(gid+" is not accessible right now.");
				}
			}
			
		});
	}
};

exports.endgame = function (gid) {
	//change game status to end in backend
	dbgames.update({"gid":gid}, {$set: {status: "end"}});
};