/*globals $, module, console*/

//logic

//loading a hand


var gcd, ui;

var a;

module.exports = function (gcde, uie) {
	ui = uie; 
	gcd = gcde;
	
	gcd.on('send endgame', );
	
	
};

a = {
	"send endgame" : function (data) {
		get('endgame/'+0+"/"+data.gid+"/"+data.name, function (server){
			if (server.error) {
				console.log(data.error); 
				gcd.emit("clear cards"); 
				return false;
			}
			gcd.emit("game ended", data, server);
			gcd.emit("load high scores", data, server[2]);
		})
	},
	{
		
	}
	
	
};

var fname; 

for (fname in a) {
	a[fname].desc = fname;
}


		var uid = '0'; //set by server
		var gid = '0'; //set by server
		var type = 'basic'; //toggle options
		var name = false;



		}
		
		

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
		
		'retrievegame' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
			});			
		},


		
