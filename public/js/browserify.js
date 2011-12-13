var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports, __dirname, __filename) {
    function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/shc.js", function (require, module, exports, __dirname, __filename) {
    /*globals exports, console*/

var hello = "geeze";

exports.shorthandcall = function (call){
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


//test
console.log(exports.shorthandcall(['fh']));
console.log("hithi");
});

require.define("/entry.js", function (require, module, exports, __dirname, __filename) {
    /*global $, console, submitScore, require */

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
	$(".main").fadeTo(100, fadelevel);
	
	
	//remove fade
	var removeFade =  function  () {
		$(".main").fadeTo(200, 1);
	};
	
	var shorthandcall = require("./shc.js").shc;
	
	//!!!! hand calling
	
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
			$('#dc').fadeTo(400, 0.5); 
		}
	};

	var showDeck = function () {
		$('#dc').fadeTo(400, 1);
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

});
require("/entry.js");
