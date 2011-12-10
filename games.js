/*jslint node:true */
/*global exports */


//games {gid: {userid: userid, deck:[52 cards], hand: [5 cards], draws: [[2,3], [1], ...], current: #, score: #, typeGame: 'str', status: time|'end' ]}
var cardutil = require('./cardutil');
var memory = require('./memory');

//for initializing high scores
exports.initializehs = function (scores) {
	memory.initializehs(scores.initializehs);
};

var i;
var games = {};
var letters = [];
for (i = 0; i<10; i += 1) {
	letters.push(String(i));
}
for (i = 0; i<26; i += 1) {
	letters.push(String.fromCharCode(i+65), String.fromCharCode(i+97));
}

var gametypes =  {
	'basic' : function (game) {
		game.type = 'basic';
		game.data = {streak:0, score:0};
		game.wilds = 'yes';
	}
};



		//implement a cleanup routine 

//new game and shuffles deck
exports.shuffle = function (res, id, type, scores) {
	var deck, i, j, temp, gid, hand, calldelta, game;
	//work out type
	type = type || 'basic';
	if (!(gametypes.hasOwnProperty(type))) { 
		type = "basic";
	}
	//create and shuffle deck
	deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
					"6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
				  "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
				  "Ac",  "Ad",  "Ah",  "As"
				];
	for (i = 0 ; i<52; i += 1) {
		j = Math.floor(Math.random() * (52 - i)) + i;
		temp = deck[j];
		deck[j] = deck[i];
		deck[i] = temp; 
	}
	//hand
	hand = deck.slice(0,5);	
	//create game id
	gid = '';
	for (i = 0; i<8; i+=1) {
		gid += letters[Math.floor(Math.random()*(62))];
	}
	//initial game creation
	game = {deck:deck, userid:id, hand: hand, draws: ["11111"], current:5, status: Date.now()};
	games[gid] = game; 
	//put in stuff for game type
	gametypes[type](game);
	//make initial call using lowest possible hand for oldhand
	calldelta = cardutil.call(hand, ["3c", "4d", "5h", "6s", "8c"], scores.scoring[type], game);
	memory.newgame(gid, game);
	res.json({gid:gid, hand: hand, call: calldelta[0], cardsleft: 47, gamedata: game.data, delta : calldelta[1]});
};


var drawcb = function (res, draws, id, gid, scores) {
	return function (err, game) {
		var hand, oldhand, i, score, cur, deck, calldelta; 
		if (game.status === 'end') {
			res.json({'error': "Game already ended"});
			return false; 
		}
		deck = game.deck;
		oldhand = game.hand.slice(); 
		var nocards = true;

		//check id matches gid's userid

		//main logic
		hand = game.hand;
		cur = game.current;
	  for (i = 0; i < 5; i += 1) {
			try {
				if (draws[i] === "1") {
					if (cur >= 52) {break;}
					nocards = false;
					hand[i] = deck[cur];
					cur += 1;
				}
			} catch (e) {
				console.log(e);
			}
		}
		if (nocards) {res.json({error:"no cards drawn."}); return false;}
		calldelta = cardutil.call(hand, oldhand, scores.scoring[game.type], game);	
		memory.update(gid, game, {hand:hand, draws:draws, data:game.data, current: cur, score:game.data.score, status:Date.now()});
		res.json({hand:hand, call:calldelta[0], gamedata:game.data, delta:calldelta[1], cardsleft: 52-cur});
	};
};

exports.drawcards = function (res, draws, id, gid, scores) {
	var callback = drawcb(res, draws, id, gid, scores);
	if (games.hasOwnProperty(gid) ) {
		callback(null, games[gid]); 
	} else {
		memory.loadgame(gid, callback);
	}
};

exports.endgame = function (res, id, gid, scores, name) {
	var game;
	game = games[gid];
  if (game.status === 'end') {
		res.json({'error': "Game already ended"});
		return false; 
	}
	memory.endgame(gid);
	game.status = 'end';
	console.log(scores);
	if (game.data.score >= scores.highscores[0].score) {
		//new highscore logic
		scores.update(game.data.score, gid, name.replace(/[^ a-zA-Z0-9_]/g, ''), memory.savehighscore);
		res.json(["highscore", game, scores.highscores]);
	} else {
		//no new highscore logic
		res.json(["not a new highscore", game, scores.highscores]);
	}
};


//retrieves game with gid for replay
exports.retrievegame = function (res, gid) {
	memory.retrievegame(res, gid, games);
};


