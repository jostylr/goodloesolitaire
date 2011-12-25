/*globals $, module, console, require*/

var file = 'ui/hand: ';

var cardutil = require('../utilities/cards');
var deck = cardutil.deck;

var a, b, ret, store, retrieve;

var querycards, handcall, hail, computecardposition;

module.exports = function (gcd) {
  ret = gcd.ret;
  store = gcd.store;
  retrieve = gcd.retrieve; 
  
  gcd.install(file, a);
    
  
};

b = {
  "translate card click" : function (event) {
    store.clickedcard = $(this);
    ret({ $$emitnow: 'card clicked', $$store : "clickedcard" }, file+"translate card click" );
  }
  
};

handcall = function (call) {
  var ranks = cardutil.handcall(call)[1];
  switch (call[0]) {
    case "5":  return "Five "+ranks[0]; 
    case "sf": return ranks[0]+" High Straight Flush"; 
    case "4":  return "Four "+ranks[0]+" and a "+ranks[1]+" kicker"; 
    case "fh": return "Full House: "+ranks[0]+" over "+ranks[1]; 
    case "f":  return ranks[0]+" Low Flush"; 
    case "s":  return ranks[0]+" High Straight"; 
    case "3":  return "Three "+ranks[0]+" and  "+ranks[1]+", "+ranks[2]+" kickers"; 
    case "2p": return "Two pair: "+ranks[0]+", "+ranks[1]+" and a "+ranks[2]+" kicker"; 
    case "2":  return "Pair of "+ranks[0]+" with "+ranks[1]+", "+ranks[2]+", "+ranks[3]+" kickers"; 
    case "1":  return  ranks[0]+" high and "+ranks[1]+", "+ranks[2]+", "+ranks[3]+", "+ranks[4]+" kickers"; 
    default :  return "";
  }
};


a = {
  "load hand" : [ [ "hand" ],
    function (hand) {
      $('#hand li').each(function () {
        var cardnum = this.id[4]-1;
        var pos = computecardposition(hand[cardnum]);
        $(this).css("background-position", "-"+pos[0]+"px -"+pos[1]+"px");
      });
      return { $$emit : "hand loaded" };
    }
  ],
  
  "assemble drawn cards" : function () {
    var carddata = querycards();
    if (carddata[1] === 0) {
      return { $$emit : "no discarded cards" };
    }
    return { $set : { 
        drawcount : carddata[1],
        draws : carddata[0]
      },
      $$emit : "cards discarded"
    };
  },
  
  "restore cards" : function () {
    $("#hand li").removeClass('draw').removeClass('backing');
  },
  
  "make full hand call" : [ [{ $$transform : [ handcall,  "call" ] }],
    function (call) {
      $("#handtext span").html("&nbsp;").text(call);
    }
  ],
  
  "show deck" : function () {
    $('#dc').fadeTo(400, 1);
  },
  
  "update number of cards left" : [ [ "cardsleft" ], 
    function  (cardsleft) {
      $("#numcards").html(cardsleft);
    }
  ],
  
  "remove deck" : function () {
    $('#dc').fadeTo(400, 0.5); 
  },
  
  "use backing for discarded cards": function () {
   $(".draw").addClass('backing');   
  },
  
  //hail calls
  "display miagan" : function    () {
    hail("#m4");
  },
  "display hail mia" : function  () {
    hail("#dr4");
  },
  "display mulligan" : function  () {
    hail("#m5");
  },
  "display hail mary" : function () {
    hail("#dr5");
  },
  
  //initial hand display
  "hide hand" : function () {
    $("#hand").css("visibility", "hidden");
    ret({$$on : {"hand loaded" : "show hand" } }, file+"hide hand");
  },
  
  "show hand" : function () {
    $("#hand").css("visibility", "visible"); 
  },

  "toggle draw cards" : [ [ "cardsleft", {$$retrieve : "clickedcard"}],
    function (cardsleft, card$) {
      card$ = retrieve(card$.slice(9)); // uses gcd.retrieve to get object, but wanted above for doc
      var drawcount;
      if (card$.hasClass('draw')) {
        card$.removeClass('draw');
      } else if (cardsleft < 5) {
        drawcount = querycards()[1];
        if (drawcount >= cardsleft) {
          return {$$emit : "not enough cards left"};
        } else {
          card$.addClass('draw');
        }
      } else {
        card$.addClass('draw');      
      }      
    }
  ],
  
  
  "initialize draw card click, hide hail, hand" : function () {
   $('#hand li').bind("click"     , b["translate card click"]); 
   
   $('#hail >span').hide();
   
   a["hide hand"](); 
  }

  
};

querycards = function () {
  var draws = '';
  var drawcount = 0;
  $("#hand li").each(function (){
    if ($(this).hasClass('draw')) {
      draws += '1';
      drawcount += 1;
    } else {
      draws += '0';
    }
  });
  return [draws, drawcount];
};


hail = function (domid) {
  $(domid).fadeIn(600).fadeOut(600);  
};


computecardposition = function (card) {
  var i;
  for (i = 0; i<52; i+=1) {
    if (card === deck[i]) {
      return [(i % 8)*86, Math.floor(i/8)*120];
    }
  }
  ret( { $$emit : "card not found" } );
  return [0, 0];
};




  
  
  
  
