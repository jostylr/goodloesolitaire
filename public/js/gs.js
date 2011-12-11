/*global $, console, submitScore */

$(function() {
	
	//!!!! initial values
	var server = '';//'http://127.0.0.1:3000/';	
	var uid = '0'; //set by server
	var gid = '0'; //set by server
	var type = 'basic'; //toggle options
	var scoredata = [];
	var name = false;
	var oldHighScores = false;
	
  var commands;
	
	var akeys; 
	
	//initial hiding
	$("#endgame").hide(); 
	
	//!!!! fading
	var fadelevel = 0.4;

	//initial screen faded
	$(".faded").fadeTo(100, fadelevel);
	
	
	//remove fade
	var removeFade =  function  () {
		$(".main").fadeTo(200, 1);
	};
	
	
	
	//!!!! hand calling
	
	var shorthandcall = function (call){
		switch (call[0]) {
			case "5":  return "5K";
			case "sf": return "SF";
			case "4":  return "4K";
			case "fh": return "FH";
			case "f":  return "Fl";
			case "s":  return "St";
			case "3":  return "3K";
			case "2p": return "2P";
			case "2":  return "1P";
			case "1":  return "▬" ;
		}
	};
	
	var oldhand = false;
	
	var suitHtml = {
		c: "&#x2663;",
		d: "&#x2666;", 
		h: "&#x2665;",
		s: "&#x2660;"
	};
	
	var shorthand = function (hand) {
		var i; 
		if (!oldhand) {
			oldhand = hand;
		}
		var ret = '';
		for (i = 0; i < 5; i+=1) {
			if (hand[i] === oldhand[i]) {
			  ret += " "+hand[i][0] +suitHtml[hand[i][1]]+" ";	
			} else {
			  ret += " <strong>"+hand[i][0] +suitHtml[hand[i][1]]+"</strong> ";					
			}
		}
		oldhand = hand; 
		return ret;
	};
	
	var ranks = {
		"A": ["Aces", "Ace"], 
		"K": ["Kings","King"],
		"Q": ["Queens","Queen"] ,
		"J": ["Jacks","Jack"],
		"T": ["Tens","Ten"],
		"9": ["Nines","Nine"],
		"8": ["Eights","Eight"],
		"7": ["Sevens","Seven"],
		"6": ["Sixes","Six"],
		"5": ["Fives","Five"],
		"4": ["Fours","Four"],
		"3": ["Threes","Three"],
		"2": ["Twos", "Two"]
		};
         
	
	var handcall = function (call) {
		switch (call[0]) {
			case "5":  return "Five "+ranks[call[1]][0]; 
			case "sf": return ranks[call[1]][1]+" High Straight Flush"; 
			case "4":  return "Four "+ranks[call[1]][0]+" and a "+ranks[call[2]][1]+" kicker"; 
			case "fh": return "Full House: "+ranks[call[1]][0]+" over "+ranks[call[2]][0]; 
			case "f":  return ranks[call[1]][1]+" Low Flush"; 
			case "s":  return ranks[call[1]][1]+" High Straight"; 
			case "3":  return "Three "+ranks[call[1]][0]+" and  "+ranks[call[2]][1]+", "+ranks[call[3]][1]+" kickers"; 
			case "2p": return "Two pair: "+ranks[call[1]][0]+", "+ranks[call[2]][0]+" and a "+ranks[call[3]][1]+" kicker"; 
			case "2":  return "Pair of "+ranks[call[1]][0]+" with "+ranks[call[2]][1]+", "+ranks[call[3]][1]+", "+ranks[call[4]][1]+" kickers"; 
			case "1":  return  ranks[call[1]][1]+" high  and "+ranks[call[2]][1]+", "+ranks[call[3]][1]+", "+ranks[call[4]][1]+", "+ranks[call[5]][1]+" kickers"; 
		}
	};
	
	var makeCall = function (call) {
		$("#handtext").html(handcall(call));
	};
	
	//!!!! history
	var historyCount = 0;
	
	var clearHistory = function () {
		$('#history table tbody').empty();
		historyCount = 0;
	};
  

	var addHistory = function (data, deltalabel) {
		historyCount += 1;
		$('#history table tbody').prepend("<tr><td>"+historyCount+".</td><td>"+
		   data.gamedata.score+"</td><td><span "+deltalabel+"</span></td><td class='left'>"+
		   shorthand(data.hand)+"</td><td>"+shorthandcall(data.call)+"</td></tr>"
		);		
	};
	
	//!!!! numcards
	var numcards = function (cardsleft) {
		$("#numcards").html(cardsleft);
		if (cardsleft === 0) {
			$('#drawdeck').fadeTo(400, 0.01); 
		}
	};

	var showDeck = function () {
		$('#drawdeck').fadeTo(400, 1);
	};
	
	
	var runoutofcards = function () {
		commands.endgame(); 
		//setTimeout(function () {$('input[name=endgame]').click()}, 800);
	};

  
	
	//!!!! card management
	//clicking cards
  $('#hand li').click(function (event) {
			var this$ = $(this);
      this$.toggleClass('draw');
  });
	
	
	var deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
					"6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
				  "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
				  "Ac",  "Ad",  "Ah",  "As"
	];
	
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
	
	//!!!! scoreManagement	
	var score;
	var highscores = [];
	
	var inarow = function (streak, level, typechange) {
		var streaktext;
		if (typechange > 2) {
			streaktext = streak+" in a row"+ (level ? " with a bonus of "+level+"!" : "!");			
		} else {
			streaktext = "&nbsp;";			
		} 
	  $('#inarow').html(streaktext);
	}; 

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
			 addHistory(data, "class='label success'>&#x25B2;"+delta);
			 scorepulse('scoreplus');
			inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
    } else if (delta < 0) {
			 $("#delta").html("&#x25BC;"+(-1*delta));
			 addHistory(data, "class='label important'>&#x25BC;"+(-1*delta));
			 scorepulse('scoreminus');
			inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
    } else {
			 $("#delta").html("▬");
			 addHistory(data, "class='label'>▬");
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
	
	
	
	//!!!! server
		
	var put = function (command, data, callback) {
		$.ajax(server + command, {
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			dataType: "json",
			success: callback || function (data, status) {console.log(command, data, status);},
			error  : function() { console.log("error response"); }
		});
	};
	
	var get = function (command, callback) {
		$.ajax(server + command, {
			type: 'GET',
			contentType: 'application/json',
			dataType: "json",
			success: callback || function (data, status) {console.log(command, data, status);},
			error  : function() { console.log("error response"); }
		});
	};

	
	var state; //for hail call
	
	commands = {
		'shuffle' : function () {
			 clearHistory(); 
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
		'drawcards' : function () {
			//get draws
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
			if (nocards) {
				console.log("no cards selected."); 
				clearCards(); 
				return false;
			}
			hailCall(drawcount, state);
			state = 'oldhand';
			flipCards(); 
			get('drawcards/'+uid+'/'+gid+'/'+draws, function (data){
				if (data.error) {
					console.log(data.error); 
					clearCards(); 
					return false;
				}
				console.log(JSON.stringify(data));
				loadHand(data.hand);
				makeCall(data.call);
				loadScore(data);
				numcards(data.cardsleft);	  
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



$("#newgame").live('click', commands.shuffle);
//$("#highscores").click(function() {$('input[name=viewscores]').click(); });
$("#drawcards").click(commands.drawcards);
$("#endgame").live('click', commands.endgame );
//attaching high score behavior

$('#highscores').click(function () {
	commands.viewscores(function(){
		$('#modal-highscores').modal({
			backdrop: true,
			keyboard: true,
			show: true
		});
	});
});

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


}); //end ready function 
