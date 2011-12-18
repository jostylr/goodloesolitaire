/*globals $, module, console*/

//ui

//loading a hand

var a = {};

var fadelevel = 0.4;


var gcd, ui;

module.exports = function (gcde, uie) {
	gcd = gcde;
	uie = ui;
	
	ui.on("game started", a["install endgame"]);
	
	ui.on("gamed ended", a["install startgame"]);

	ui.on("end game", a["emit check score/name"]);
	
	ui.once("name registered", a["skip name"]);
	
	ui.on("ready", function () {
		$("#newgame").live('click', a["emit new game"]);
		$("#endgame").live('click', a["emit end game"]);
		$("#endgame").hide(); 
		$(".main").fadeTo(100, fadelevel);
		
	});
};


a = {
  "install endgame" : function () {
		$("#togglegame").html('<a id="endgame">End Game</a>');				
	},
	"install startgame": function () {
		$("#togglegame").html('<a id="endgame">End Game</a>');			
	},
	"emit new game" : function () {
		gcd.emit("new game");
	}, 
	"emit end game" : function () {
		ui.emit("end game");
		gcd.emit("end game");
	},
	"emit check score/name" : function () {
		gcd.emit("check score and name"); //removed after usage
	},
	"skip name" : function () {
		ui.removeListener("end game", a["emit check"]);
		ui.on("end game", function () {
			gcd.emit("send end game");
		}); 
	},
	"remove main fade" : function  () {
		$(".main").fadeTo(200, 1);
	},
	"fade main" : function  () {
		$(".main").fadeTo(600, fadelevel, function () {
			ui.emit("main is faded");
		});
		ui.emit("restore cards");
	},
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

	
	

	
	

