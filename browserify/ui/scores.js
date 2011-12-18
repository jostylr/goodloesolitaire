/*globals $, module, console, require*/

var file = 'ui/scores: ';

var gcd;

var a;

module.exports = function (gcde, data) {
	gcd = gcde;
	
	gcd.on("draw cards"						, a["clear streak"]);	
	gcd.on("streak"								,	a["call streak"]);
	gcd.on(""											, a["add score entry"]);
	gcd.on(""											, a["display high scores"]);
	gcd.on(""											, a["pulse scores"]);
	gcd.on(""											, a[""]);

	gcd.on(""											, a[""]);

	gcd.on("ready", function () {
		gcd.emit("send view scores", data);
	})
	
};

//game ended?
gcd.emit("load high scores", data, server[2]);


a = {
	'clear streak' : function  (data) {
		$('#inarow').html("&nbsp;");
  }, 
	'call streak' : function  (data) {
		$('#inarow').html(data.streak+" in a row"+ (data.level ? " with a bonus of "+data.level+"!" : "!"));
	},
	'add score entry' : function () {
		$('#scoreentry').bind('hide', function self () {
			name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
			if (!name) {
				name = "___";
			}
			$('#scoreentry').unbind('hide', self); //self cleanup
			gcd.emit('send endgame');
		});
	},
	'display high scores' : function () {$('#modal-highscores').modal({
		backdrop: true,
		keyboard: true,
		show: true
	}), 
	"pulse scores" : function (data) {
		$('#score, #delta').removeClass("scoreminus scoreplus");
		setTimeout(function () {$('#score, #delta').addClass(data.scoreclass);}, 5);
	};
	
	
};

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}







//name entry
var	scoreentrysubmit = function  (evnt) {
	if (evnt.keyCode === 13) {
		$("input[name=submitname]").click(); 
		return false;
	} 
};


//remapping keys upon modal name change toggle
$('#scoreentry').
	bind('show', function () {
		$('html').unbind('keyup', akeys);
		$('html').bind('keyup', scoreentrysubmit);
	}).
	bind('hide', function () {
		$('html').unbind('keyup', scoreentrysubmit);
		$('html').bind('keyup', akeys);
	});


	$('#highscores').click(function () {
		commands.viewscores(function(){
			$('#modal-highscores').modal({
				backdrop: true,
				keyboard: true,
				show: true
			});
		});
	});
