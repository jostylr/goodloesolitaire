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
    gcd.ret({$set:{deck:deck, hand:deck.hand.slice(0), cardsleft : (52-deck.place)}, $$emit: "game started"}, me.desc); 

    if (ret.hasOwnProperty("moves")) {
      deck.decodeMoves(ret.moves);
    } 
    ret.moves = [];
    
    if (ret.hasOwnProperty("type")) {
      ret.type = checktypes(ret.type);
    } else {
      ret.type = "basic";
    }
    if (ret.hasOwnProperty("wilds")) {
      if (!((ret.wilds === "yes") || (ret.wilds === "no") )) {
        ret.wilds = "yes";
      }
    } else {
      ret.wilds = "yes";
    }
    gcd.ret({$set : {old : ret}, $$emit : "old game data successfully processed"}, me.desc);
  },

  "update hash" : [["deck", "type", "wilds"], 
    function me (deck, type, wilds) {
      var hash =
          "seed="+deck.seed+
          "&type="+type+
          "&wilds="+wilds+
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
  }]
  
  
};

types = {
  "basic" : {streak: 0, score: 0, level : 0, delta:0}

};


checktypes = function (type) {

  if (types.hasOwnProperty(type)) {
    return type;
  } else {
    gcd.ret({$$emit : "bad type "+type});
    return "basic";
  }
};
  
