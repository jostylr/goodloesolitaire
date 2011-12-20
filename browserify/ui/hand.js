/*globals $, module, console, require*/

var file = 'ui/hand: ';

var deck = require('../utilities/cards').deck;

var gcd;

var a, install;

var querycards, handcall, hail, computecardposition;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
    
  gcd.on("draw cards requested"   , a["assemble drawn cards"]);
  gcd.on("cards discarded"        , a["use backing for discarded cards"]);
  
  gcd.on("server started new game", a["load hand"]);
  gcd.on("server started new game", a["update number of cards left"]);

  gcd.on("server drew cards"      , a["load hand"]);
  gcd.on("server drew cards"      , a["update number of cards left"]);

  
  gcd.on("hand loaded"            , a["restore cards"]);
  
  
  gcd.on("no cards left to draw"  , a["remove deck"]);


  gcd.on("miagan"                 , a["display miagan"]);
  gcd.on("hail mia"               , a["display hail mia"]);
  gcd.on("mulligan"               , a["display mulligan"]);
  gcd.on("hail mary"              , a["display hail mary"]);
  

  gcd.on("ready", a["initialize draw card click, hide hail, hand"]);
  
};

a = {
  "load hand" : function (data) {
    var hand = data.hand;
    $('#hand li').each(function () {
      var cardnum = this.id[4]-1;
      var pos = computecardposition(data, hand[cardnum]);
      $(this).css("background-position", "-"+pos[0]+"px -"+pos[1]+"px");
    });
    gcd.emit("hand loaded", data);
  },
  
  "assemble drawn cards" : function (data) {
    var carddata = querycards(data);
    if (carddata[1] === 0) {
      gcd.emit("no discarded cards", data);
      return false;
    }
    data.drawcount = carddata[1];
    data.draws = carddata[0];
    gcd.emit("cards discarded", data);
  },
  
  "restore cards" : function () {
    $("#hand li").removeClass('draw').removeClass('backing');
  },
  
  "make full hand call" : function (data) {
    $("#handtext").html(handcall(data.call));
  },
  
  "show deck" : function () {
    $('#dc').fadeTo(400, 1);
  },
  
  "update number of cards left" : function  (data) {
    $("#numcards").html(data.cardsleft);
  },
  
  "remove deck" : function () {
    $('#dc').fadeTo(400, 0.5); 
  },
  
  "toggle draw class" : function (data) {
    return function (event) {
      var drawcount;
      if (data.cardsleft < 5) {
        drawcount = querycards[1];
        if (drawcount >= data.cardsleft) {
          gcd.emit("not enough cards left", data);
          return false;
        } 
      }
      var this$ = $(this);
      this$.toggleClass('draw');
    };
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
    gcd.once("hand loaded", a["show hand"]);
  },
  
  "show hand" : function () {
    $("#hand").css("visibility", "visible"); 
  }
  
};


install = function (data) {
  a["initialize draw card click, hide hail, hand"] = function () {
   $('#hand li').bind("click"     , a["toggle draw class"](data)); 
   
   $('#hail >span').hide();
   
   a["hide hand"](); 
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
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

handcall = function (call, ranks) {
  switch (call) {
    case "5":  return "Five "+ranks[0]; 
    case "sf": return ranks[0]+" High Straight Flush"; 
    case "4":  return "Four "+ranks[0]+" and a "+ranks[1]+" kicker"; 
    case "fh": return "Full House: "+ranks[0]+" over "+ranks[1]; 
    case "f":  return ranks[0]+" Low Flush"; 
    case "s":  return ranks[0]+" High Straight"; 
    case "3":  return "Three "+ranks[0]+" and  "+ranks[1]+", "+ranks[2]+" kickers"; 
    case "2p": return "Two pair: "+ranks[0]+", "+ranks[1]+" and a "+ranks[2]+" kicker"; 
    case "2":  return "Pair of "+ranks[0]+" with "+ranks[1]+", "+ranks[2]+", "+ranks[3]+" kickers"; 
    case "1":  return  ranks[0]+" high  and "+ranks[1]+", "+ranks[2]+", "+ranks[3]+", "+ranks[4]+" kickers"; 
  }
};

hail = function (domid) {
  $(domid).fadeIn(600).fadeOut(600);  
};


computecardposition = function (data, card) {
  var i;
  for (i = 0; i<52; i+=1) {
    if (card === deck[i]) {
      return [(i % 8)*86, Math.floor(i/8)*120];
    }
  }
  gcd.emit("card not found", data, card);
  return [0, 0];
};




  
  
  
  
