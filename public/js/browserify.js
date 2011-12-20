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

require.define("events", function (require, module, exports, __dirname, __filename) {
    if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.toString.call(xs) === '[object Array]'
    }
;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/logic/gamecontrol.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var servercalls = require('../utilities/server');

var gcd;

var a, install;

var process;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
  
  gcd.on('new game requested'   , a["send new game"]);
  gcd.on('cards discarded'      , a["send draw cards"]);  
  gcd.on('end game requested'   , a["send end game"]);
  gcd.on('high scores requested', a["send view scores"]);

  gcd.on("ready"                , a["initialize values"]);  
  
};

a = {
  
  
  //server calls
  
  "send new game": function (data) {
    servercalls.get('shuffle/'+data.uid+'/'+data.type, function (server) {
      if (server.error) {
        gcd.emit("new game denied", data, server);
        return false;
      }
      process(data, server);
      gcd.emit("server started new game", data);
    });
  },
  
  "send draw cards" : function (data) {
    servercalls.get('drawcards/'+data.uid+'/'+data.gid+'/'+data.draws, function (server){
      if (server.error) {
        gcd.emit("failed to draw cards", data, server);
        return false;
      }
      process(data, server);
      gcd.emit("server drew cards", data);
      if (data.cardsleft <= 0) {
        gcd.emit("no cards left to draw", data);
      }
      
    });  
  },
  
  
  "send end game" : function (data) {
    servercalls.get('endgame/'+data.uid+"/"+data.gid+"/"+data.name, function (server){
      if (server.error) {
        gcd.emit("end game denied", data, server);
        return false;
      }
      gcd.emit("server ended game", data, server);
    });
  },
  
  
  "send view scores" : function (data) {
    servercalls.get('viewscores', function (server) {
      if (server.error) {
        gcd.emit("view scores denied", data, server);
        return false;
      }
      data.highscores = server.highscores; 
      gcd.emit("server sent high scores", data);
    });
  },

  'send game review' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },

  'send game history' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },
    
  'send game replay' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    }
  
};

install = function (data) {
  a["initialize values"] = function (data) {
    data.uid = '0'; //set by server
    data.gid = '0'; //set by server
    data.type = 'basic'; //toggle options
    data.name = false;    
  };
  
  var fname; 

  for (fname in a) {
    a[fname].desc = file+fname;
  }  
};


process = function (data, server) {
  if (server.hasOwnProperty("gid")) {
    data.gid  = server.gid;
  }
  data.hand = server.hand;
  data.call = server.call;
  data.cardsleft  = server.cardsleft;
  switch (data.type) {
    case "basic" :
      data.streak = server.gamedata.streak;
      data.score = server.gamedata.score;
      data.delta = server.delta;
      data.level = server.gamedata.level;
    break;
    default : 
    break;
  }
};

    

});

require.define("/utilities/server.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, exports, console*/

//server interaction. A thin wrapper around jquery server methods
	
var server = '';//'http://127.0.0.1:3000/';	
	
console.log("server")
	
exports.put = function (command, data, callback) {
	$.ajax(server + command, {
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: "json",
		success: callback || function (data, status) {console.log(command, data, status);},
		error  : function() { console.log("error response"); }
	});
};

exports.get = function (command, callback) {
	$.ajax(server + command, {
		type: 'GET',
		contentType: 'application/json',
		dataType: "json",
		success: callback || function (data, status) {console.log(command, data, status);},
		error  : function() { console.log("error response"); }
	});
};

});

require.define("/logic/history.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'logic/history: ';

var gcd;

var a;

var cardutil = require('../utilities/cards');


module.exports = function (gcde, data) {
  gcd = gcde;
  gcd.on("new game requested"    , a["zero history count"]);
  gcd.on("draw cards requested"  , a["increment history count"]);
  gcd.on("score loaded"          , a["process row data"]);
};

a = {
  "zero history count" : function (data) {
    data.historyCount = 0;
  }, 
  "increment history count" : function (data) {
    data.historyCount += 1;
  },
  "process row data" : function (data) {
    data.shorthand = cardutil["generate short hand string"](data.hand);
    data.shortcall = cardutil["generate short version of call"](data.call);
    gcd.emit("add history", data); 
  } 
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}
});

require.define("/utilities/cards.js", function (require, module, exports, __dirname, __filename) {
    /*globals exports */
  
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
      

exports.deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
          "6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
          "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
          "Ac",  "Ad",  "Ah",  "As"
];   

exports.handcall = function (call) {
  switch (call[0]) {
    case "5":  return ["5" , [ranks[call[1]][0] ]]; 
    case "sf": return ["sf", [ranks[call[1]][1] ]];
    case "4":  return ["4" , [ranks[call[1]][0], ranks[call[2]][1] ]]; 
    case "fh": return ["fh", [ranks[call[1]][0], ranks[call[2]][0] ]]; 
    case "f":  return ["f" , [ranks[call[1]][1] ]]; 
    case "s":  return ["s" , [ranks[call[1]][1] ]]; 
    case "3":  return ["3" , [ranks[call[1]][0], ranks[call[2]][1], ranks[call[3]][1] ]]; 
    case "2p": return ["2p", [ranks[call[1]][0], ranks[call[2]][0], ranks[call[3]][1] ]];
    case "2":  return ["2" , [ranks[call[1]][0], ranks[call[2]][1], ranks[call[3]][1], ranks[call[4]][1] ]]; 
    case "1":  return ["1" , [ranks[call[1]][1], ranks[call[2]][1], ranks[call[3]][1], ranks[call[4]][1], ranks[call[5]][1] ]]; 
  }
};

  
var suitHtml = {
  c: "&#x2663;",
  d: "&#x2666;", 
  h: "&#x2665;",
  s: "&#x2660;"
};

var oldHand = false;

exports["generate short hand string"] = function (hand) {
  var i; 
  if (!oldHand) {
    oldHand = hand;
  }
  var ret = [];
  for (i = 0; i < 5; i+=1) {
    if (hand[i] === oldHand[i]) {
      ret.push('old', [hand[i][0], suitHtml[hand[i][1]]]);  
    } else {
      ret.push('new', [hand[i][0], suitHtml[hand[i][1]]]);
    }
  }
  oldHand = hand; 
  return ret;
};

exports["generate short version of call"] = function (call){
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

});

require.define("/logic/hand.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console*/

var file = 'logic/hand: ';

var gcd;

var a;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  gcd.on("new game requested"      , a["reset hand state"]);

  gcd.on("server started new game", a["make call"]);
  gcd.on("server started new game", a["note new hand"]);

  gcd.on("hail call checked"      , a["note old hand"]);

  gcd.on("cards discarded"        , a["check for a hail call"]);
  
  gcd.on("no cards left to draw" , a["end the game"]);
};

a = {
  'reset hand state' : function (data) {
    data.state = 'newhand';
  },
  'make call' : function  (data) {
    
  },
  "end the game" : function (data) {
    gcd.emit("end game requested", data);
  },
  "note new hand" : function (data) {
    data.newhand = true;
  },
  "note old hand" : function (data) {
    data.newhand = false;
  },
  "check for a hail call" : function  (data) {
    var newhand = data.newhand;
    var count = data.drawcount;
    if (count === 4) {
      if (newhand) {
        gcd.emit("miagan", data);
      } else {
        gcd.emit('hail mia', data);
      }
    } else if (count === 5) {
      if (newhand) {
        gcd.emit("mulligan", data);
      } else {
        gcd.emit('hail mary', data);
      }      
    }
    gcd.emit("hail call checked", data);
  }
  
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}



});

require.define("/logic/scores.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'logic/score: ';

var gcd;

var a, install;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);

  gcd.on("server drew cards"        , a["check delta"]);  // (negative OR positive OR no) change in score
  gcd.on("server drew cards"        , a["check for streak"]); // streak OR nothing
  
  gcd.on("server sent high scores"  , a["look for new high scores"]);  // high scores checked
  
  gcd.on("ready"                    , a["initialize score data"]);
    
  
};

a = {
  
  'check score/name' : function (data) {
    if (!data.name && data.score >= data.highscores[0].score) {
      gcd.emit("name requested for high score", data);
      // submitScore();  //shows modal
    } else {
      gcd.emit("send endgame");    
    }
  },
  
  
  "check delta" : function  (data) {
    var delta = data.delta;
    if (delta < 0) {
      gcd.emit("negative change in score", data);
    } else if (delta > 0) {
      gcd.emit("positive change in score", data);
    } else {
      gcd.emit("no change in score", data);
    }
  },
  "check for streak" : function  (data) {
    if ((data.streak >2) && (data.delta >0)) {
      gcd.emit("streak", data);
    }
  },
  
  "look for new high scores" : function  (data) {
    var i, n, row, date, tempOldHighScores, rowClass, highscores;
    highscores = data.highscores; 
    n = highscores.length;
    tempOldHighScores = {};
    for (i = 0; i<n; i += 1) {
      row = highscores[n-1-i];
      if (data.gid === row._id) {
        row.ownscore = true;
      } else if (data.oldHighScores && !(data.oldHighScores.hasOwnProperty(row._id)) ) {
        //new high scores from others added
        row.externalnewscore = true;
      }
      tempOldHighScores[row._id] = true;
    }    
    data.oldHighScores = tempOldHighScores;
    gcd.emit("high scores checked", data);
  }
  
};

install = function (data) {
   a["initialize score data"] = function (data) {
    data.score = 0;
    data.highscores = [];
    data["old high scores"] = false;
  };
  
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }
  
};
});

require.define("/ui/gamecontrol.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var gcd;

var a, install;

var fadelevel = 0.4;


module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
  
  gcd.on("new game requested" , a["remove main fade"]);
  
  gcd.on("game started"       , a["install endgame"]);
  gcd.on("game started"       , a["bind hand keys"]);
  gcd.on("game started"       , a["listen for name entry"]);
  
  gcd.on("game ended"         , a["install startgame"]);
  gcd.on("game ended"         , a["unbind hand keys"]);
  gcd.on("game ended"         , a["remove listen for name entry"]);

  gcd.on("end game requested" , a["emit check score/name"]);
  
  gcd.once("name registered"  , a["skip name"]);
  
  
  gcd.on("ready"              , a["initialize game clicks, hide stuff"]);
  

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
  

  "emit check score/name" : function (data) {
    gcd.emit("check score and name", data); //removed after usage
  },
  "show about" : function () {
    $('#modal-about').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  },

  //key clicks
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
  },
  "listen for name entry" : function () {
    gcd.on("name entry shown"      , a["bind hand keys"]);
    gcd.on("name submitted"       , a["unbind hand keys"]);
  },
  "remove listen for name entry" : function () {
    gcd.removeListener("name entry shown", a["bind hand keys"]);
    gcd.removeListener("name submitted"  , a["unbind hand keys"]);
  }
  
};

install = function (data) {
   a["initialize game clicks, hide stuff"] = function () {
    $("#newgame").live('click', a["emit new game"]);
    $("#drawcards").click(a["emit draw cards"]);
    $("#endgame").live('click', a["emit end game"]);
    $("#endgame").hide(); 
    $(".main").fadeTo(100, fadelevel);
    $("#hs").click(a["emit retrieve game"]);
    $("#about").click(a["show about"]);
  
    
  };
  
  a["emit new game"] = function () {
    gcd.emit("new game requested", data);
  };
   
  a["emit draw cards"] = function () {
    gcd.emit("draw cards requested", data);
  };
  
  a["emit end game"] = function  () {
    gcd.emit("end game requested", data);      
  };
  
  a["emit retrieve game"] = function (event) {
    data.requestedgid = $(event.target).parents("tr").attr("id");
    gcd.emit('old game requested', data);
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }
  
};
});

require.define("/ui/history.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/history: ';

var gcd;

var a;

var deltalabel; 

module.exports = function (gcde, data) {
  gcd = gcde;
    
  gcd.on("clear history", a['empty history body']);
  
  gcd.on("add history", a['add row to history']);
  
  
};

a = {
  'empty history body' :  function () {
    $('#history table tbody').empty();
  },
  
  'add row to history' :  function (data) {
    $('#history table tbody').prepend(
      "<tr><td>" + data.num + ".</td><td>" +
      data.score + "</td><td><span " + deltalabel(data.delta) + "</span></td><td class='left'>" +
      a["assemble the hand's short call"](data.shorthand) +
      "</td><td>" + data.shortcall + "</td></tr>"
      );    
  }, 
  
  "assemble the hand's short call" :  function (hand) {
    var i, n, c, shc; 
    n = hand.length; 
    shc = '';
    for (i= 0; i <n; i += 1) {
      c = hand[i];
      if (c[0] === "new") {
        shc += " <strong>"+c[1] +c[2]+"</strong> ";          
      } else {
        shc += " " + c[1] + c[2] + " ";                
      }
    }
    return shc; 
  }
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}

deltalabel = function (delta) {
  if (delta > 0) {
    return "class='label success'>&#x25B2;"+delta;
  } else if (delta <0 ) {
    return "class='label important'>&#x25BC;"+(-1*delta);
  } else {
    return "class='label' >▬";
  }
};

});

require.define("/ui/hand.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/hand: ';

var cardutil = require('../utilities/cards');
var deck = cardutil.deck;

var gcd;

var a, install;

var querycards, handcall, hail, computecardposition;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
    
  gcd.on("draw cards requested"   , a["assemble drawn cards"]);
  gcd.on("cards discarded"        , a["use backing for discarded cards"]);
  
  gcd.on("server started new game", a["load hand"]);
  gcd.on("server started new game", a["update number of cards left"]);

  gcd.on("server drew cards"      , a["load hand"]);
  gcd.on("server drew cards"      , a["update number of cards left"]);

  
  gcd.on("hand loaded"            , a["restore cards"]);
  gcd.on("hand loaded"            , a["make full hand call"]);
  
  
  gcd.on("no cards left to draw"  , a["remove deck"]);


  gcd.on("miagan"                 , a["display miagan"]);
  gcd.on("hail mia"               , a["display hail mia"]);
  gcd.on("mulligan"               , a["display mulligan"]);
  gcd.on("hail mary"              , a["display hail mary"]);
  

  gcd.on("ready", a["initialize draw card click, hide hail, hand"]);
  
};

a = {
  "load hand" : function (data) {
    var hand = data.hand;
    $('#hand li').each(function () {
      var cardnum = this.id[4]-1;
      var pos = computecardposition(data, hand[cardnum]);
      $(this).css("background-position", "-"+pos[0]+"px -"+pos[1]+"px");
    });
    gcd.emit("hand loaded", data);
  },
  
  "assemble drawn cards" : function (data) {
    var carddata = querycards(data);
    if (carddata[1] === 0) {
      gcd.emit("no discarded cards", data);
      return false;
    }
    data.drawcount = carddata[1];
    data.draws = carddata[0];
    gcd.emit("cards discarded", data);
  },
  
  "restore cards" : function () {
    $("#hand li").removeClass('draw').removeClass('backing');
  },
  
  "make full hand call" : function (data) {
    console.log(handcall(data.call));
    $("#handtext").html(handcall(data.call));
  },
  
  "show deck" : function () {
    $('#dc').fadeTo(400, 1);
  },
  
  "update number of cards left" : function  (data) {
    $("#numcards").html(data.cardsleft);
  },
  
  "remove deck" : function () {
    $('#dc').fadeTo(400, 0.5); 
  },
  
  "toggle draw class" : function (data) {
    return function (event) {
      var drawcount;
      if (data.cardsleft < 5) {
        drawcount = querycards[1];
        if (drawcount >= data.cardsleft) {
          gcd.emit("not enough cards left", data);
          return false;
        } 
      }
      var this$ = $(this);
      this$.toggleClass('draw');
    };
  },
  
  "use backing for discarded cards": function () {
   $(".draw").addClass('backing');   
  },
  
  //hail calls
  "display miagan" : function    () {
    hail("#m4");
  },
  "display hail mia" : function  () {
    hail("#dr4");
  },
  "display mulligan" : function  () {
    hail("#m5");
  },
  "display hail mary" : function () {
    hail("#dr5");
  },
  
  //initial hand display
  "hide hand" : function () {
    $("#hand").css("visibility", "hidden"); 
    gcd.once("hand loaded", a["show hand"]);
  },
  
  "show hand" : function () {
    $("#hand").css("visibility", "visible"); 
  }
  
};


install = function (data) {
  a["initialize draw card click, hide hail, hand"] = function () {
   $('#hand li').bind("click"     , a["toggle draw class"](data)); 
   
   $('#hail >span').hide();
   
   a["hide hand"](); 
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }  
};


querycards = function () {
  var draws = '';
  var drawcount = 0;
  $("#hand li").each(function (){
    if ($(this).hasClass('draw')) {
      draws += '1';
      drawcount += 1;
    } else {
      draws += '0';
    }
  });
  return [draws, drawcount];
};

handcall = function (call) {
  var ranks = cardutil.handcall(call)[1];
  switch (call[0]) {
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
    default :  return "";
  }
};

hail = function (domid) {
  $(domid).fadeIn(600).fadeOut(600);  
};


computecardposition = function (data, card) {
  var i;
  for (i = 0; i<52; i+=1) {
    if (card === deck[i]) {
      return [(i % 8)*86, Math.floor(i/8)*120];
    }
  }
  gcd.emit("card not found", data, card);
  return [0, 0];
};




  
  
  
  

});

require.define("/ui/scores.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/scores: ';

var gcd;

var a, install;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data); //for initializing click functions, mostly
  
  gcd.on("draw cards"             , a["clear streak"]); //
  gcd.on("new game requested"     , a["clear streak"]);
  gcd.on("streak"                 , a["call streak"]); //
  gcd.on("name entry shown"       , a["add score entry"]); //send endgame
//  gcd.on("high scores checked"    , a["display high scores"]);//
  gcd.on("server started new game" , a["pulse positive score"]);
  gcd.on("negative change in score", a["pulse negative score"]);
  gcd.on("positive change in score", a["pulse positive score"]);  
  gcd.on("no change in score"     , a["no score change"]);    
  gcd.on("name entry hidden"      , a["emit submit name" ]);
  gcd.on("name entry shown"       , a["focus into name modal"]);
  gcd.on("name submitted"         , a["get name value"]);
  gcd.on("name entry shown"       , a["bind name entry keys"]);
  gcd.on("name submitted"         , a["unbind name entry keys"]);

  gcd.on("ready"                  , a['initialize name/score clicks, modals, high scores']);
  
};



a = {
  'clear streak' : function  (data) {
    $('#inarow').html("&nbsp;");
  }, 
  'call streak' : function  (data) {
    $('#inarow').html(data.streak+" in a row"+ (data.level ? " with a bonus of "+data.level+"!" : "!"));
  },
  'add score entry' : function (data) {
    $('#scoreentry').bind('hide', function self () {
      data.name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
      if (!data.name) {
        data.name = "___";
      }
      $('#scoreentry').unbind('hide', self); //self cleanup
      gcd.emit('send endgame');
    });
  },
  'display high scores' : function (data) {
    var row, rowclass, n, i, date;
    n = data.highscores.length;
    var htmltablebody = '';
    for (i = 0; i<n; i += 1) {
      row = data.highscores[n-1-i];
      date = new Date (row.date);
      date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
      if (row.ownscore) {
        rowclass = 'class="newHighScore"';
      }
      if (row.externalnewscore) {
        rowclass = 'class="otherNewHighScore"';
      }
      htmltablebody += '<tr '+rowclass+' id="'+row._id+'"><td>'+(i+1)+'.</td><td>'+row.name+'</td><td>'+row.score+'</td><td>'+date+'</td></tr>';
    }    
    $("#hs").html(htmltablebody);    
    
    $('#modal-highscores').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  }, 
  "pulse negative score" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("&#x25BC;"+(-1*data.delta));
    $('#score, #delta').removeClass("scoreminus scoreplus");
    setTimeout(function () {$('#score, #delta').addClass("scoreminus");}, 5);
  },
  "pulse positive score" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("&#x25B2;"+data.delta);
    $('#score, #delta').removeClass("scoreminus scoreplus");
    setTimeout(function () {$('#score, #delta').addClass("scoreplus");}, 5);
  },
  "no score change" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("▬");
    $('#score, #delta').removeClass("scoreminus scoreplus");
  },
  
  
  "install score entry" : function  () {
    $('#scoreentry').modal({
      backdrop: "static",
      keyboard: true,
      show: false
    }); 
  },
  
  "focus into name modal" : function () {
    $("#namemodal").attr("tabindex", 1).focus().select(); 
  },
  
  "get name value" : function (data) {
    var name = $("#namemodal").val().replace(/\W/g, ''); 
    if (name) {
      $("#name a").html(name);
      data.name = name;
    }
  }, 
  
  "initialize name" : function (data) {
    data.name = '';
  }, 
  
  "bind name entry keys" : function (data) {
    $('html').bind('keyup', a["keys for name entry"]);
  },
  
  "unbind name entry keys" : function (data) {
    $('html').unbind('keyup', a["keys for name entry"]);
  }
  
};

install = function (data) {
  a['initialize name/score clicks, modals, high scores'] = function () {
    $('#highscores')    .bind("click", a["retrieve high scores for viewing"]);
    $("#name")          .bind("click", a["name entry requested"]);
    $("#submitname")    .bind("click", a["hide name entry"]);
    $("#scoreentry")    .bind("hide" , a["emit name entry hidden"]);
    
    
    gcd.emit("high scores requested", data);
    
    a["install score entry"](data);
    a["initialize name"](data);
    
  };
  
  
  a["emit submit name"] = function () {
      gcd.emit("name submitted", data);
  };

  a["retrieve high scores for viewing"] = function () {
    gcd.once("high scores checked", a["display high scores"]);
    gcd.emit("high scores requested", data);
  };
  
  a["name entry requested"] = function () {
    $('#scoreentry').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    gcd.emit("name entry displayed", data);
  };
  
  a["hide name entry"] = function () {
    $("#scoreentry").modal('hide');
  };
  
  a["emit name entry hidden"] = function () {
    gcd.emit("name entry hidden", data);
  };
  
  a["keys for name entry"] = function  (evnt) {
    if (evnt.keyCode === 13) {
      a["hide name entry"]();
      return false;
    } 
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }

};


});

require.define("/entry.js", function (require, module, exports, __dirname, __filename) {
    /*global $, console, submitScore, require, eventlogger, hashevents */

var events = require('events');

var gcd = new events.EventEmitter(); 

var data = {};

eventlogger = [];
hashevents = {};

var eventdebugger = function (evem) {
  var _emit = evem.emit;
  evem.emit = function (ev, data) {
    if (ev === "newListener") {
      if (hashevents.hasOwnProperty(data)) {
        hashevents[data] += 1;
      } else {
        hashevents[data] = 1;
      }
    } else {
      console.log(eventlogger.length+". "+ev);
      eventlogger.push([ev, JSON.parse(JSON.stringify(data))]);
      var list = evem.listeners(ev);
      //console.log("list"+list)
      var i, n; 
      n = list.length; 
      for (i = 0; i < n; i += 1) {
        if (list[i].hasOwnProperty("desc")) {
          console.log("listener: ", list[i].desc);
        } else {
          console.log("listener with no description");
        }
      }
    }
    _emit.apply(this, arguments);
  };
};

eventdebugger(gcd);

//$ = function (arg) {arg();};

console.log("running");



require('./logic/gamecontrol'  )(gcd, data);
require('./logic/history'      )(gcd, data);
require('./logic/hand'         )(gcd, data);
require('./logic/scores'       )(gcd, data);

require('./ui/gamecontrol'    )(gcd, data);
require('./ui/history'        )(gcd, data);
require('./ui/hand'           )(gcd, data);
require('./ui/scores'         )(gcd, data);


$(function() { 
  gcd.emit("ready", data);
});



  





});
require("/entry.js");
