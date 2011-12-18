/*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var gcd;

var a;

var fadelevel = 0.4;


module.exports = function (gcde, data) {
	gcd = gcde;
	
	gcd.on("new game requested", a["remove main fade"]);
	
	gcd.on("game started", a["install endgame"]);
	
	gcd.on("game ended", a["install startgame"]);

	gcd.on("end game requested", a["emit check score/name"]);
	
	gcd.once("name registered", a["skip name"]);
	
	gcd.on("ready", function () {
		$("#newgame").live('click', a["emit new game"](data));
		$("#drawcards").click(a["emit draw cards"](data));
		$("#endgame").live('click', a["emit end game"](data));
		$("#endgame").hide(); 
		$(".main").fadeTo(100, fadelevel);
		$("#hs").click(a["emit retrieve game"](data));
			
		
	});
};


a = {
  "install endgame" : function () {
		$("#togglegame").html('<a id="endgame">End Game</a>');				
	},
	"install startgame": function () {
		$("#togglegame").html('<a id="endgame">End Game</a>');			
	},
	"skip name" : function (data) {
		gcd.removeListener("end game", a["emit check"]);
		gcd.on("end game", function (data) {
			gcd.emit("send end game", data);
		}); 
	},
	"remove main fade" : function  (data) {
		$(".main").fadeTo(200, 1);
	},
	"fade main" : function  () {
		$(".main").fadeTo(600, fadelevel, function () {
			gcd.emit("main is faded");
		});
		gcd.emit("restore cards");
	},
	
	//click responses
	"emit new game" : function (data) {
		return function () {
			gcd.emit("new game requested", data);
		};
	}, 
	"emit draw cards" : function  (data) {
		return function () {
			gcd.emit("draw cards requested", data);
		};
	},
	"emit end game" : function (data) {
		return function  () {
			gcd.emit("end game requested", data);			
		};
	},
	"emit retrieve game" : function (data) {
		return function (event) {
			data.requestedgid = $(event.target).parents("tr").attr("id");
			gcd.emit('old game requested', data);
		};
	},
	"emit check score/name" : function (data) {
		gcd.emit("check score and name", data); //removed after usage
	},
	
	//key controls
	"hand key bindings": function (evnt) {
	       var key = evnt.keyCode; 
	       switch (key) {
	        case 49: $('#hand li:nth-child(1)').click(); break;//1 card as visible
	        case 50: $('#hand li:nth-child(2)').click(); break;
	        case 51: $('#hand li:nth-child(3)').click(); break;
	        case 52: $('#hand li:nth-child(4)').click(); break;
	        case 53: $('#hand li:nth-child(5)').click(); break;
	        case 13: $('#drawcards').click(); return false; //enter drawcards
	       }
	},
	"bind hand keys" : function () {
		$('html').bind('keyup', a["hand key bindings"]);
	},
	"unbind hand keys" : function () {
		$('html').unbind('keyup', a["hand key bindings"]);
	}
};

	
	
var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}



	
	

