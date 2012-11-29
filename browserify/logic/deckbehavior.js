/*globals $, module, console, require*/




var Deck = function (seed) {
  var deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
          "6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
          "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
          "Ac",  "Ad",  "Ah",  "As"
        ];
  seed = seed || (Math.random().toString()).slice(2);
  console.log(seed);
  Math.seedrandom(seed);
  var i,j, temp; 
  for (i = 0 ; i<52; i += 1) {
    j = Math.floor(Math.random() * (52 - i)) + i;
    temp = deck[j];
    deck[j] = deck[i];
    deck[i] = temp; 
  }
  this.place = 0;
  this.drawcard = function () {
    var ret;
    if (this.place < 52) {
      ret = deck[this.place]; 
      this.place += 1;
    } else {
      ret = null;
    }
    console.log(this.place, ret);
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


// A-Z  65-90,  a-z 97-122
Deck.prototype.encodedMoves = function () {
  var moves = this.moves;
  Math.seedrandom(this.seed);
  var i, n = moves.length, str = '', charcode;
  for (i = 0; i < n; i += 1) {
    charcode = 65 + Math.floor(Math.random() * 27)+moves[i];
    if (charcode > 90) {
      charcode += 7;  //shift it to the a-z range
    }
    if (charcode > 122) {
      charcode -= 58;
    } 
    console.log(charcode, moves[i]);
    str += String.fromCharCode(charcode);
  }
  return str;
};

Deck.prototype.decodeMoves = function (strMoves) {
  //moves is a string of letters--translate to numbers, then into array of moves
  var moves = [];
  Math.seedrandom(this.seed);
  var i, n= strMoves.length, charcode, ii, num, move, base;
  for (i = 0; i <n; i +=1 ) {
    charcode = strMoves.charCodeAt(i);
    base = Math.floor(Math.random() * 27) + 65;
    if (charcode < base)  {
      charcode = charcode - base +58 - 7;
    } else if (charcode > 97) {
      charcode = charcode -base -7;
    } else {
      charcode = charcode - base;
    }
    num = charcode; 
    move = [];
    moves.push(move);
    for (ii = 4; ii >= 0; ii -= 1) {
      console.log(num);
      if (num >= Math.pow(2, ii)) {
        move[ii] = 1;
        num = num - Math.pow(2, ii);
      } else {
        move[ii]= 0;      
      }
    }
  }
  this.urlMoves = moves;
};


module.exports = Deck;

