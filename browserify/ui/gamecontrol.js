/*globals $, module, console*/

//loading a hand

var handcall; 

var gcde, uie;

module.exports = function (gcd, ui) {
	ui.on("")
		uie = ui; 
		gcde = gcd;
};


	//toggling
	
	var toggleGameControl = function (type) {
		if (type === "shuffling") {
			$("#togglegame").html('<a id="endgame">End Game</a>');
//			$("#newgame").hide();
//			$("#endgame").show();
		} else if (type === "ending") {
			$("#togglegame").html('<a id="newgame">Start Game</a>');
//			$("#endgame").hide();
//			$("#newgame").show();			
		}
	};
	
	var endGameDisplay = function () {
			$(".main").fadeTo(600, fadelevel, function () {$('#modal-highscores').modal({
				backdrop: true,
				keyboard: true,
				show: true
			});});
			$("#hand li").removeClass('draw').removeClass('backing');
	};
	
	'shuffle' : function () {
		 gcd.emit("clear history", {});
		 removeFade();
		 state = 'newhand';
		//presend
		get('shuffle/'+uid+'/'+type, function (data) {
			//postsend
			console.log(JSON.stringify(data));
			gid = data.gid;
			loadHand(data.hand);
			showHand(); 
			makeCall(data.call);
			loadScore(data);
			numcards(data.cardsleft);
			showDeck(); 
			toggleGameControl('shuffling');
		});
	},
	
	'endgame' : function () {
		console.log('endgame', name, score, highscores);
		if (!name && score >= highscores[0].score) {
			submitScore();  //shows modal
			$('#scoreentry').bind('hide', function self () {
				name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
				console.log(name);
				if (!name) {
					name = "___";
				}
				commands.endgame();
				$('#scoreentry').unbind('hide', self); //self cleanup
			});
		} else {
			get('endgame/'+uid+"/"+gid+"/"+name, function (data){
				console.log(JSON.stringify(data));
				if (data.error) {
					console.log(data.error); 
					clearCards(); 
					return false;
				}
				loadHighScores(data[2]);
				endGameDisplay();
				toggleGameControl("ending");
			});
		}
	},
	'retrievegame' : function (gid) {
		get('retrievegame/'+gid,  function (data){				
			console.log(JSON.stringify(data));
		});			
	},
	
	
	
	//remove fade
	var removeFade =  function  () {
		$(".main").fadeTo(200, 1);
	};
	
	
	
	akeys = function (evnt) {
	        var key = evnt.keyCode; 
	       switch (key) {
	        case 49: $('#hand li:nth-child(1)').click(); break;//1 card as visible
	        case 50: $('#hand li:nth-child(2)').click(); break;
	        case 51: $('#hand li:nth-child(3)').click(); break;
	        case 52: $('#hand li:nth-child(4)').click(); break;
	        case 53: $('#hand li:nth-child(5)').click(); break;
	        case 13: $('#drawcards').click(); return false; //enter drawcards
	       }

	};

	$('html').bind('keyup', akeys);


	$("#newgame").live('click', commands.shuffle);
	//$("#highscores").click(function() {$('input[name=viewscores]').click(); });
	$("#endgame").live('click', commands.endgame );
	//attaching high score behavior
