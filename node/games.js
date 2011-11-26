/*jslint node:true */
/*global exports */


//games {gid: {userid: userid, deck:[52 cards], hand: [5 cards], draws: [[2,3], [1], ...], current: #, score: #, typeGame: 'str', status: time|'end' ]}
var cardutil = require('./cardutil');
var memory = require('./memory');

var i;
var games = {};
var letters = [];
for (i = 0; i<10; i += 1) {
	letters.push(String(i));
}
for (i = 0; i<26; i += 1) {
	letters.push(String.fromCharCode(i+65), String.fromCharCode(i+97));
}


		//implement a cleanup routine 

//new game and shuffles deck
exports.shuffle = function (res, id) {
	var deck, i, j, temp, gid, hand, calldelta;
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
	calldelta = cardutil.call(hand);
	//create game id
	gid = '';
	for (i = 0; i<8; i+=1) {
		gid += letters[Math.floor(Math.random()*(63))];
	}
	games[gid] = {deck:deck, userid:id, hand: hand, draws: ["11111"], current:5, score:calldelta[1], typeGame : 'basic', status: Date.now()};
	memory.newgame(gid, games[gid]);
	res.json({gid:gid, hand: hand, call: calldelta[0], cardsleft: 47, score: calldelta[1]});
};

exports.drawcards = function (res, draws, id, gid) {
	var game, hand, i, score, cur, deck, calldelta; 
	//is gid available--check!, call memory in async fashion if needed passing this function and others for callback.
	game = games[gid]; 
	deck = game.deck;
	//check id matches gid's userid
	
	//main logic
	hand = game.hand;
	cur = game.current;
  for (i = 0; i < 5; i += 1) {
		try {
			if (draws[i] === "1") {
				if (cur >= 52) {break;}
				hand[i] = deck[cur];
				cur += 1;
			}
		} catch (e) {
			console.log(e);
		}
	}
	calldelta = cardutil.call(hand);
	score = game.score+calldelta[1];
	memory.update(gid, game, {hand:hand, draws:draws, current: cur, score:score, status:Date.now()});
	res.json({hand:hand, call:calldelta[0], score:score, delta:calldelta[1], cardsleft: 52-cur});
};

exports.endgame = function (res, id, gid, scores, users) {
	var game;
	game = games[gid];
	memory.endgame(gid);
	game.status = 'end';
	if (game.score >= scores.highscores[0].score) {
		//new highscore logic
		scores.update(game.score, gid, users.id(id).name);
		res.json(["highscore", game]);
	} else {
		//no new highscore logic
		res.json(["not a new highscore", game]);
	}
};


//retrieves game with gid for replay
exports.retrievegame = function (res, gid) {
	memory.retrievegame(res, gid, games);
};


