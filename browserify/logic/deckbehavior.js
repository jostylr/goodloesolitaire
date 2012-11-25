/*globals $, module, console, require*/




var Deck = function (seed) {
  var deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
          "6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
          "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
          "Ac",  "Ad",  "Ah",  "As"
        ];
  var i,j, temp; 
  for (i = 0 ; i<52; i += 1) {
    j = Math.floor(Math.random() * (52 - i)) + i;
    temp = deck[j];
    deck[j] = deck[i];
    deck[i] = temp; 
  }
  var place = 0;
  seed = seed || (Math.random().toString()).slice(2);
  console.log(seed);
  Math.seedrandom(seed);
  this.drawcard = function () {
    var ret;
    if (place < 52) {
      ret = deck[place]; 
      place += 1;
    } else {
      ret = null;
    }
    console.log(place, ret);
    return ret;
  };
  this.hand = [];
  this.moves = [];
  this.seed = seed; 

  return this;
};


Deck.prototype.newhand = function () {
  return this.draw([1, 1, 1, 1, 1]);
};

Deck.prototype.draw = function (places) {
  var num = 0;
  var hand = this.hand;
  console.log("draw", places, hand);
  for (var i = 0; i < 5; i += 1) {
    if (places[i] == 1) {
      hand[i] = this.drawcard() || hand[i];
      num += Math.pow(2, i); 
    }
  }
  this.moves.push(num);
};  



module.exports = Deck;


