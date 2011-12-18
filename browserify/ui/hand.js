/*globals $, module, console, require*/

var file = 'ui/hand: ';

var gcd;

var a;

var querycards, handcall;

module.exports = function (gcde, data) {
	gcd = gcde;
		
	gcd.on("draw cards requested"		, a["assemble drawn cards"]);
	
	gcd.on("hand loaded"            , a["restore cards"]);

	$('#hand li').click(function (event) {
  		var this$ = $(this);
      this$.toggleClass('draw');
  });
  
};

a = {
	"assemble drawn cards" : function (data) {
    var nocards = querycards(data);
		if (nocards) {
			gcd.emit("no discarded cards", data);
			return false;
		}
		data.draws = draws;
		gcd.emit("cards discarded", data);
	}
	
	"restore cards" : function (data) {
	  $("#hand li").removeClass('draw').removeClass('backing');
	},
	
	"make full hand call" : function (data) {
	  $("#handtext").html(handcall(data.call));
	},
	
	"show deck" : function (data) {
	  $('#dc').fadeTo(400, 1);
	}
};

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}

querycards = function (data) {
  var draws = '';
  var nocards = true;
  var drawcount = 0; 
  $("#hand li").each(function (){
  	if ($(this).hasClass('draw')) {
  		draws += '1';
  		nocards = false;
  		drawcount += 1; 
  	} else {
  		draws += '0';
  	}
  });
  return nocards;
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




//!!!! numcards
var numcards = function (cardsleft) {
	$("#numcards").html(cardsleft);
	if (cardsleft === 0) {
		$('#dc').fadeTo(400, 0.5); 
	}
};

var runoutofcards = function () {
	commands.endgame(); 
	//setTimeout(function () {$('input[name=endgame]').click()}, 800);
};


//computes card image given card
var computeCard = function (card) {
	var i;
	for (i = 0; i<52; i+=1) {
		if (card === deck[i]) {
			return [(i % 8)*86, Math.floor(i/8)*120];
		}
	}
	console.log("card not found", card);
	return [0, 0];
};

var flipCards = function () {
	$(".draw").addClass('backing');	
};
	
var clearCards = function () {
	$('#hand li').
		removeClass('draw').
		removeClass('backing')
	;
};
	
var showHand = function () {
	$("#hand").css("visibility", "visible"); 
};
	
var hideHand = function () {
	$("#hand").css("visibility", "hidden"); 
};

//----  no hand view on startup
hideHand(); 


//cards get hand
var loadHand = function (hand) {
	$('#hand li').each(function () {
		var cardnum = this.id[4]-1;
		var pos = computeCard(hand[cardnum]);
		$(this).
			css("background-position", "-"+pos[0]+"px -"+pos[1]+"px").
			removeClass('draw').
			removeClass('backing')
		;
	});
};



	//hail call
var hailCall= function (count, type){  
	  var domid = '';
		if (count === 4) {
			domid =  (type === 'newhand') ? "#m4" : "#dr4";
		} else if (count === 5) {
			domid =  (type === 'newhand') ? "#m5" : "#dr5";
		} else {
			return false;
		}
   $(domid).fadeIn(600).fadeOut(600);
	};
	
	$('#hail >span').hide();
	
	
	
