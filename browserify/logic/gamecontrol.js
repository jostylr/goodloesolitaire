/*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var servercalls = require('../utilities/server');

var gcd;

var a;

module.exports = function (gcde, data) {
	gcd = gcde;
	
	gcd.on("ready"								, a["initial values"]);
	gcd.on('new game requested'		, a["send new game"]);
	gcd.on('draw cards requested'	, a["send draw cards"]);	
	gcd.on('end game requested'		, a["send end game"]);
	
	
	gcd.on(""											, a[""]);
	
};

a = {
	"initial values" : function (data) {
		data.uid = '0'; //set by server
		data.gid = '0'; //set by server
		data.type = 'basic'; //toggle options
		data.name = false;		
	},
	
	"send new game": function (data) {
		servercalls.get('shuffle/'+data.uid+'/'+data.type, function (server) {
			if (server.error) {
				gcd.emit("new game denied", data, server);
				return false;
			}
			data.gid = server.gid;
			gcd.emit("server started new game", data, server);

	s		loadScore(data);
//			
			numcards(data.cardsleft);
			showDeck(); 
		});
	},
	
	"send draw cards" : function () {
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
	
	
	"send end game" : function (data) {
		get('endgame/'+0+"/"+data.gid+"/"+data.name, function (server){
			if (server.error) {
				gcd.emit("end game denied", data, server);
				return false;
			}
			gcd.emit("server ended game", data, server);
		})
	},
	
	
	"send view scores" : function (data) {
		get('viewscores', function (server) {
			if (server.error) {
				gcd.emit("view scores denied", data, server);
				return false;
			}
			gcd.emit("server sent high scores", data, server);
		};
	},

	'send game review' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
			});			
		},

	'send game history' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
			});			
		},
		
	'send game replay' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
			});			
		},
	
};

var fname; 

for (fname in a) {
	a[fname].desc = file+fname;
}

	

		
