/*globals $, module, console*/

//ui

//loading a hand

var a, b;

var gcd, ui;

module.exports = function (gcde, uie) {
	gcd = gcde;
	ui = uie;

	ui.on("")
		uie = ui; 
		gcde = gcd;
};

a = {
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
	function  () {
		
	}
};

//main is faded
 function () {$('#modal-highscores').modal({
	backdrop: true,
	keyboard: true,
	show: true
});


var scorepulse = function (scoreclass) {
	$('#score, #delta').removeClass("scoreminus scoreplus");
	setTimeout(function () {$('#score, #delta').addClass(scoreclass);}, 5);
};

var loadScore = function (data) {
	score = data.gamedata.score;
	$("#score").html(data.gamedata.score);
	var delta = data.delta;
  if (delta > 0) {
		 $("#delta").html("&#x25B2;"+delta);
		 gcd.emit("prep for add history", {
			score:data.gamedata.score, 
			deltalabel : "class='label success'>&#x25B2;"+delta, 
			hand: data.hand,
			call: data.call
		});
		 scorepulse('scoreplus');
		inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
  } else if (delta < 0) {
		 $("#delta").html("&#x25BC;"+(-1*delta));
		 gcd.emit("prep for add history", {
			score:data.gamedata.score, 
			deltalabel : "class='label important'>&#x25BC;"+(-1*delta),
			hand: data.hand,
			call: data.call
		});
		 scorepulse('scoreminus');
		inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
  } else {
		 $("#delta").html("▬");
		 gcd.emit("prep for add history", {
			score:data.gamedata.score, 
			deltalabel : "class='label' >▬",
			hand: data.hand,
			call: data.call
		});
		 scorepulse('');
		inarow(data.gamedata.streak, data.gamedata.level, 0);	
	}
};

var loadHighScores = function (serverscores) {
	var i, n, row, date, tempOldHighScores, rowClass; 
	highscores = serverscores; 
	n = serverscores.length;
	tempOldHighScores = {};
	var htmltablebody = '';
	for (i = 0; i<n; i += 1) {
		row = serverscores[n-1-i];
		date = new Date (row.date);
		date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
		if (gid === row._id) {
			rowClass = 'class = "newHighScore"';
		} else if (oldHighScores && !(oldHighScores.hasOwnProperty(row._id)) ) {
			//new high scores from others added
			rowClass = 'class = "otherNewHighScores"';
		} else {
			rowClass = "";
		}
		htmltablebody += '<tr '+rowClass+' id="'+row._id+'"><td>'+(i+1)+'.</td><td>'+row.name+'</td><td>'+row.score+'</td><td>'+date+'</td></tr>';
		tempOldHighScores[row._id] = true;
	}		
	oldHighScores = tempOldHighScores;
	$("#hs").html(htmltablebody);
};


//retrieving high score game
$("#hs").click(function (event) {
	var rowgid = $(event.target).parents("tr").attr("id");
	commands.retrievegame(rowgid);
});



	'viewscores' : function (callback) {
		get('viewscores', function (data) {
			console.log(JSON.stringify(data));
			console.log("viewscores", callback);
			loadHighScores(data);
			if (callback) {
				callback();
			} 
		});
	}
	
};



//preload high scores for highscore figuring
commands.viewscores(); 


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
