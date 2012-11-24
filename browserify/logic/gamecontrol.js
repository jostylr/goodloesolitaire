/*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var Deck = require('../logic/deckbehavior');

var gcd;

var a;

var process, newdeck, types;

module.exports = function (gcde) {
  gcd = gcde;
  gcd.install(file, a);  
};

a = {
  "initialize values" : function () {
    return {$set : {
      uid : 0, //set by server
      gid : 0, //set by server
      type : 'basic' //toggle options
    }};
  },
  
  
  "watch name to send end game" : function () {
    return { $$once: { "name submitted" : "send end game" } };
  },
  
  "attach end to request" : function () {
    return { $$removeListener : { "no highscore at end of game" : "send end game" }, 
             $$on : { "end game requested" : "send end game" }
    };
  },
  
  //server calls
  
  "start new game": [[ "type" ],
    function me (type) {
      var deck = new Deck();
      deck.newhand();
      gcd.ret({$set:{deck:deck, hand:deck.hand.slice(0)}, $$emit: "game started"}, me.desc); 
    }
  ],
  
  "draw cards" : [["deck", "draws"],
    function me (deck, draws, type) {
      deck.draw(draws.split('')); 
      gcd.ret({$$emit : "cards drawn", $set : {hand:deck.hand.slice(0)} }, me.desc); 
  }],
  
  
  "make tweet" : [ ["deck", "score", "type", "wilds"],
    function me (deck, score, type, wilds) {
        var url = "http://goodloesolitaire.com/?"+
          "seed="+deck.seed+
          "&moves="+deck.moves.join("")+ //deck.movesList()
          "&type="+type+
          "&wilds="+wilds;
        gcd.ret({$set : { tweeturl: url}  ,
            $$emit : "tweet ready"
        }, me.desc);
    }
  ],
  

  
  "send view scores" : function me () {
    servercalls.get('viewscores', function (server) {
      if (server.error) {
        gcd.ret({$$emit: [["view scores denied", server]]}, me.desc);
        return false;
      }
    gcd.ret({$set : {highscores: server.highscores},
          $$emit : "server sent high scores"
        }, me.desc);
    });
  }




/*
  'send game review' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },

  'send game history' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },
    
  'send game replay' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    }
  */
  
};

process = function (type, server) {
  var build = {$set : {}};
  var data = build.$set;
  if (server.hasOwnProperty("gid")) {
     data.gid = server.gid;
  }
  data.hand = server.hand;
  data.call = server.call;
  data.cardsleft  = server.cardsleft;
  switch (type) {
    case "basic" :
      data.streak = server.gamedata.streak;
      data.score = server.gamedata.score;
      data.delta = server.delta;
      data.level = server.gamedata.level;
    break;
    default : 
    break;
  }
  return build;
};

    

