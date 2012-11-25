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
      type : 'basic', //toggle options
      wilds : 'yes'
    }};
  },
  
  
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
  }]
  
  
};
  
