/*globals $, module, console, require, window*/

var file = 'logic/gamecontrol: ';

var Deck = require('../logic/deckbehavior');

var gcd;

var a;

var process, newdeck, types, translate, checktypes;

module.exports = function (gcde) {
  gcd = gcde;
  gcd.install(file, a);  
};

a = {
  "initialize values" : function () {
    gcd.ret({$set : {
      type : 'basic', //toggle options
      wilds : 'yes'
    }});
  },
  
  "check if old game"  : function me () {
    var parts = window.location.hash.slice(1).split("&");
    parts = parts.concat(window.location.search.slice(1).split("&"));
    var i, n = parts.length, temp;
    var ret = {};
    for (i = 0; i < n; i += 1) {
      temp = parts[i].split("=");
      ret[temp[0]] = temp[1];
    }
    //check data sanity
    var deck;
    if (ret.hasOwnProperty("seed")) {
      deck = new Deck(ret.seed);
    } else {
      deck = new Deck();
    }
    deck.newhand();

    if (ret.hasOwnProperty("moves")) {
      deck.urlMoves = ret.moves;
    } 
    ret.moves = [];
    $("#targethand").addClass("hide");
    if (ret.hasOwnProperty("type")) {
      ret.type = checktypes(ret.type);
    } else {
      ret.type = "basic";
    }
    // update newgame link
    $("#newgame").attr("href", window.location.href.split("#")[0]).text("New "+$("#"+ret.type).text()+"");
    if (ret.hasOwnProperty("wilds")) {
      if (!((ret.wilds === "yes") || (ret.wilds === "no") )) {
        ret.wilds = "yes";
      }
    } else {
      ret.wilds = "yes";
    }
    gcd.ret({$set : {old : ret}, $$emit : "old game data successfully processed"}, me.desc);
    gcd.ret({$set:{deck:deck, hand:deck.hand.slice(0), type: ret.type, wilds : ret.wilds, seed: ret.seed, cardsleft : (52-deck.place)}, $$emit: "game started"}, me.desc); 

  },

  "update hash" : [["deck", "type", "wilds"], 
    function me (deck, type, wilds) {
      var hash =
          "seed="+deck.seed +
          "&moves="+deck.encodedMoves(); //deck.movesList()

      window.location.hash = hash;
    }
  ],

  
  
  "start new game": [[ "type" ],
    function me (type) {
      var deck = new Deck();
      deck.newhand();
      gcd.ret({$set:{deck:deck, hand:deck.hand.slice(0), cardsleft : (52-deck.place)}, $$emit: "game started"}, me.desc); 
    }
  ],
  
  "draw cards" : [["deck", "draws"],
    function me (deck, draws, type) {
      deck.draw(draws.split('')); 
      gcd.ret({$$emit : "cards drawn", $set : {hand:deck.hand.slice(0), cardsleft : (52-deck.place)} }, me.desc); 
    }
  ],
  
  "replay old game" : [["deck", "replay", "drawfun"],
    function me (deck, replay, drawfun) {
      if (replay) {
        window.clearInterval(replay);
      }
      if (drawfun) {
        window.clearTimeout(drawfun);
      }
      var moves = deck.decodeMoves(deck.urlMoves);
      var urlMoves = deck.urlMoves;
      // clear and initialize game
      deck = new Deck(deck.seed);
      deck.newhand();
      deck.urlMoves = urlMoves;
      gcd.ret({$set:{deck:deck, hand:deck.hand.slice(0), cardsleft : (52-deck.place)}, $$emit: "game started"}, me.desc);
      // 1/2 second cycle, 1/4 sec to click cards, 1/4 sec to draw card
      var time = 1500;
      var moveplace = 1;
      //set time out to click cards
      var timeout = window.setInterval(function () {
        if (moveplace >= moves.length) {
          window.clearInterval(timeout);
          return;
        }
        var move = moves[moveplace];
        moveplace += 1;
        //click cards
        var i, n = move.length;
        for (i = 0; i < n; i += 1) {
          if (move[i] == 1) {
            console.log("card"+(i+1));
            $("#card"+(i+1)).click();
          }
        }
        var win = window.setTimeout(function () {
          //draw card
          $("#drawcards").click();
        }, time/2);
        gcd.ret({$set: {drawfun:win}});
      }, time);
      // it waits 
      gcd.ret({$set :{replay: timeout}});
    }
  ]

  
};

types = {
  "basic" : 1,
  "mount" : 1,
  "target" : 1,
  "measured" : 1,
  "alive" : 1,
  "rent" : 1,
  "powerlevel" : 1,
  "streakpower" : 1
};


checktypes = function (type) {

  if (types.hasOwnProperty(type)) {
    return type;
  } else {
    gcd.ret({$$emit : "bad type "+type});
    return "basic";
  }
};
  
