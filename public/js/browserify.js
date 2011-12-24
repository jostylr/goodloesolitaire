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

require.define("/utilities/debugging.js", function (require, module, exports, __dirname, __filename) {
    /*global $, console, submitScore, require, eventlogger, hashevents */


eventlogger = [];
hashevents = {};

module.exports = function (evem) {
  var isArray = typeof Array.isArray === 'function'
      ? Array.isArray
      : function (xs) {
          return Object.toString.call(xs) === '[object Array]';
      }
  ;
  //var _emit = evem.emit;
  evem.emit = function(type, data) {
    
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
    
    if (type === "newListener") {
      console.log("NL: ", data, arguments[2].desc);
      if (hashevents.hasOwnProperty(data)) {
        hashevents[data].push(arguments[2].desc);
      } else {
        hashevents[data] = [arguments[2].desc];
      }
    } else {
      console.log(eventlogger.length+". "+type);
      var list = evem.listeners(type);
      //console.log("list"+list)
      var i, n; 
      n = list.length; 
      var listenlist = [];
      for (i = 0; i < n; i += 1) {
        if (list[i].hasOwnProperty("desc")) {
          listenlist.push([list[i].desc, list[i]]);
        } else {
          listenlist.push([null, list[i]]);
        }
      }
      eventlogger.push([type, ((data) ? JSON.parse(JSON.stringify(data)) : {} ), listenlist]);
    }
    
    if (!this._events) {
       return false;
     }
    var handler = this._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      if (type !== "newListener") {
        console.log(type+": "+( handler.hasOwnProperty("desc") ? handler.desc : "no description")); 
      }
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
      var i, l; 
      for (i = 0, l = listeners.length; i < l; i++) {
        if (type !== "newListener") {
          console.log(type+": "+( listeners[i].hasOwnProperty("desc") ? listeners[i].desc : "no description")); 
        }
        listeners[i].apply(this, args);
      }
      return true;

    } else {
      return false;
    }
  };
  
  evem.once = function(type, listener) {
    var self = this;
    var g = function g () {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    };
    g.desc = listener.desc+" (once)";
    self.on(type, g);
    return this;
  };
};
});

require.define("/utilities/inventory.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require, process*/

var file = 'utilities/inventory';

var install, prepargs, makechanges, wrapper, wrapper_debug, delayedemit;

module.exports = function (evem, debug) {
  evem.install = install;
  evem.a = {};
  evem.debug = debug;
  evem.data = {};
  evem.store = {};  //for non-JSON able stuff, record it by using $$store : "..."
  evem.retrieve = function (name) {
    return evem.store[name];
  };
  evem.log = {
    "prepargs" : function (desc, args) {
      console.log("args to "+desc+": "+JSON.stringify(args));
    },
    "makechanges" : function (desc, changes) {
      console.log("changes from "+desc+": "+JSON.stringify(changes));
    }
  };
  if (evem.debug) {
    evem.ret = function (changes, desc) {
      evem.log.makechanges(desc || "no description", changes);
      makechanges(evem, changes);
    }; 
  } else {
    evem.ret = function (changes) {
      makechanges(evem, changes);
    };    
  }
};

install = function (file, a) {
  var evem = this;
  var eva = this.a;
  var f, g;
  
  var fname, entry, args; 

  for (fname in a) {
    if (eva.hasOwnProperty(fname)) {
      console.log("duplicate name: "+fname+"from "+ file+", old: "+eva.fname.desc);
    }
    entry = a[fname];
    if ($.isArray(a[fname])) {
      //[args, function]
      args = entry[0];
      f = entry[1];
    } else {
      args = false;
      f = entry;
    }
    if (evem.debug) {
      g = wrapper_debug(f, args, evem);    
    } else {
      g = wrapper(f, args, evem);      
    }
    eva[fname] = g;
    g.desc = file+fname;
    f.desc = file+fname;       
  }
  
  
};

wrapper = function (f, args, evem) {
  return function () {
    var changes,doneargs;
    if (!args) {
      changes = f.call(evem);
    } else {
      doneargs = prepargs(evem, args);
      changes = f.apply(evem, doneargs);
    }
    makechanges(evem, changes);
  };
};

wrapper_debug = function (f, args, evem) {
  return function me () {
    var changes, doneargs;
    if (!args) {
      changes = f.call(evem);
    } else {
      doneargs = prepargs(evem, args);
      evem.log.prepargs(me.desc, doneargs);
      changes = f.apply(evem, doneargs);
    }
    if (changes) {
      evem.log.makechanges(me.desc, changes);
      makechanges(evem, changes);
    }
  };
};


prepargs = function (evem, args) {
  var i, n, current, value, key;
  var values = [];
  var data = evem.data;
  var store = evem.store;
  n = args.length;
  for (i = 0; i < n; i += 1) {
    current = args[i];
    if (typeof current === "string") {
      //data name
      if (data.hasOwnProperty(current)) {
        values.push(data[current]);
      } else {
        values.push(undefined);
      }
    } else {
      //assuming data object
      if (current.hasOwnProperty("$$default")) {
        value = current.$$default;
      } else {
        value = undefined;
      }
      if (current.hasOwnProperty("$$transform")) { //fix transform. do key:value with value possibly an array of actions to take after event.
       if (current.$$transform.length === 2) { //simple case
         key = current.$$transform[1];
         if (data.hasOwnProperty(key)) {
           value = current.$$transform[0](data[key]);
         }
       }
      }
      if (current.hasOwnProperty("$$get")) {
        key = current.$$get;
        if (data.hasOwnProperty(key)) {
          value = data[key];
        }
      }
      if (current.hasOwnProperty("$$retrieve")) {
        key = current.$$retrieve;
        if (store.hasOwnProperty(key)) {
          value = "retrieve:" +  key;
        }
      }
      values.push(value);
    }
  }
  return values; 
};

delayedemit = function (evem, evnt) {
  if (typeof evnt === "string") {
    process.nextTick(function () {evem.emit(evnt);});
  } else {
    process.nextTick(function () {evem.emit.apply(evem, evnt);});    
  }
};

makechanges = function (evem, changes) {
  var data = evem.data;
  var a = evem.a;
  var key, i, n, evnt, type, current, pe;
  //command structure
  if (changes.hasOwnProperty("$set")) {
    for (key in changes.$set) {
      data[key] = changes.$set[key];
    }
  }
  if (changes.hasOwnProperty("$unset")) {
    for (key in changes.$unset) {
      delete data[key];
    }
  }
  if (changes.hasOwnProperty("$inc")) {
    for (key in changes.$key) {
      data[key] += changes.$inc[key];
    }
  }
  if (changes.hasOwnProperty("$$emit")) {
    if (typeof changes.$$emit === "string" ) {
      delayedemit(evem, changes.$$emit); 
    } else { //presumably array
      n = changes.$$emit.length;
      for (i = 0; i < n; i += 1) {
        delayedemit(evem, changes.$$emit[i]);
      }      
    }
  }
  if (changes.hasOwnProperty("$$emitnow")) {
    if (typeof changes.$$emitnow === "string" ) {
      evem.emit(changes.$$emitnow);              
    } else { //presumably array
      n = changes.$$emitnow.length;
      for (i = 0; i < n; i += 1) {
        evnt = changes.$$emitnow[i];
        if (typeof evnt === "string" ){
          evem.emit(evnt);
        } else {
          evem.emit.apply(evem, evnt);
        }
      }      
    }
  }
  
  for (type in {"$$once" : 1, "$$on" : 1, "$$removeListener" : 1 }) {
    if (changes.hasOwnProperty(type)) {
      pe = type.slice(2);
      for (key in changes[type]) {        
        current = changes[type][key];
        if (typeof current === "string") {
          evem[pe](key, a[current]);
        } else { //array
          n = current.length;
          for (i = 0; i < n; i += 1) {
            evem[pe](key, a[current[i]]);
          }
        }
      }
      n = changes[type].length;
      for (i = 0; i < n; i += 1) {
        evnt = changes[type][i];
        evem.once(evnt[0], a[evnt[1]]);
      }
    }    
  }  
  
  
  
  return false; 
};
});

require.define("/logic/gamecontrol.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var servercalls = require('../utilities/server');

var ret, gcd;

var a;

var process;

module.exports = function (gcde) {
  gcd = gcde; 
  
  ret = gcd.ret;
  
  gcd.install(file, a);
  
  
};

a = {
  "initialize values" : function () {
    return {$set : {
      uid : 0, //set by server
      gid : 0, //set by server
      type : 'basic' //toggle options
    }};
  },
  
  
  "watch name to send end game" : function () {
    return { $$once: { "name submitted" : "send end game" } };
  },
  
  "attach end to request" : function () {
    return { $$removeListener : { "no highscore at end of game" : "send end game" }, 
             $$on : { "end game requested" : "send end game" }
    };
  },
  
  //server calls
  
  "send new game": [[ "uid", "type" ],
    function me (uid, type) {
      servercalls.get('shuffle/'+uid+'/'+type, function (server) {
        var build;
        if (server.error) {
          ret({$$emit: [["new game denied", server]]}, me.desc);
          return false;
        }
        build = process(type, server);
        build.$$emit = "server started new game";
        ret(build, me.desc);
      });
    }
  ],
  
  "send draw cards" : [["uid", "gid", "draws", "type", "cardsleft"],
    function me (uid, gid, draws, type) {
      servercalls.get('drawcards/'+uid+'/'+gid+'/'+draws, function (server){
        var build;
        if (server.error) {
          ret({$$emit: [["failed to draw cards", server]]}, me.desc);
          return false;
        }
        build = process(type, server);
        build.$$emit = "server drew cards";      
        ret(build, me.desc);
      });  
  }],
  
  
  "send end game" : [ ["uid", "gid", {$$get : "name", $$default :"____"} ],
    function me (uid, gid, name) {
      servercalls.get('endgame/'+uid+"/"+gid+"/"+name, function (server){
        var build;
        if (server.error) {
          ret({$$emit: [["end game denied", server]]}, me.desc);
          return false;
        }
        ret({$set : { highscores: server.highscores.sort(function (a,b) {return b.score - a.score;})  },
            $$emit : "server ended game"
        }, me.desc);
      });
    }
  ],
  
  
  "send view scores" : function me () {
    servercalls.get('viewscores', function (server) {
      if (server.error) {
        ret({$$emit: [["view scores denied", server]]}, me.desc);
        return false;
      }
    ret({$set : {highscores: server.highscores},
          $$emit : "server sent high scores"
        }, me.desc);
    });
  }

/*
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
  */
  
};

process = function (type, server) {
  var build = {$set : {}};
  var data = build.$set;
  if (server.hasOwnProperty("gid")) {
     data.gid = server.gid;
  }
  data.hand = server.hand;
  data.call = server.call;
  data.cardsleft  = server.cardsleft;
  switch (type) {
    case "basic" :
      data.streak = server.gamedata.streak;
      data.score = server.gamedata.score;
      data.delta = server.delta;
      data.level = server.gamedata.level;
    break;
    default : 
    break;
  }
  return build;
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


module.exports = function (gcd) {
  gcd.install(file, a);  
};

a = {
  "zero history count" : function () {
    return {$set : { historycount : 1 } };
  },
  "negate oldhand" : function  () {
    return {$set : { oldhand : false } }; // used in cards.js
  },
  "increment history count" : function () {
    return {$inc : { historycount : 1} };
  },
  "process row data" : [["hand", "oldhand", "call"],
    function (hand, oldhand, call) {
      var handdata = cardutil["generate short hand string"](hand, oldhand);
      return {$set : {
          oldhand: handdata[1],
          shorthand: handdata[0], 
          shortcall: cardutil["generate short version of call"](call)
        }, 
        $$emit: ["add history"]
      };
    }
  ] 
};

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


exports["generate short hand string"] = function (hand, oldhand) {
  var i; 
  if (!oldhand) {
    oldhand = hand;
  }
  var shortcards = [];
  for (i = 0; i < 5; i+=1) {
    if (hand[i] === oldhand[i]) {
      shortcards.push(['old', [hand[i][0], suitHtml[hand[i][1]]]]);  
    } else {
      shortcards.push(['new', [hand[i][0], suitHtml[hand[i][1]]]]);
    }
  }
  return [shortcards, hand];
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

var a;

module.exports = function (gcd) {

  gcd.install(file, a);
  
};

a = {
  'reset hand state' : function () {
    return { $set: { state : 'newhand' } };
  },
  "end the game" : function () {
    return { $$emit : "end game requested" };
  },
  "note new hand" : function () {
    return { $set: { newhand : true } };
  },
  "note old hand" : function () {
    return { $set : { newhand : false } };
  },
  "check for a hail call" : [ [ "newhand", "drawcount" ], 
    function  (newhand, count) {
      var build = { $$emit : [ ] };
      var em = build.$$emit;
      if (count === 4) {
        if (newhand) {
          em.push("miagan");
        } else {
          em.push('hail mia');
        }
      } else if (count === 5) {
        if (newhand) {
          em.push("mulligan");
        } else {
          em.push('hail mary');
        }      
      }
      em.push("hail call checked");
    }
  ],
  "check for cards left" : [ [ "cardsleft" ], 
    function (cardsleft) {
      if (cardsleft <= 0) {
        return { $$emit : "no cards left to draw" };
      }
    }
  ]
  
  
};

});

require.define("/logic/scores.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'logic/scores: ';

var a;

module.exports = function (gcd) {
  
  gcd.install(file, a);    
  
};

a = {
  "initialize score data" : function () {
     return {$set: {
       score: 0,
       highscores : [],
       "old high scores" : false
     }};
  },
  
  'check score/name' : [ ["name", "score", "highscores"],
    function (name, score, highscores) {
      
      if (!name && (score >= (highscores[highscores.length-1].score) || ( score >= highscores[0].score) ) ) {
        return { $$emit: "name requested for high score" };
      } else {
        return { $$emit : "no highscore at end of game" };    
      }
    }
  ],
  
  'remove score/name' : function () {
    return {$$removeListener : { "end game requested" : 'check score/name' }};
  },
  
  
  "check delta" : [["delta"], 
    function  (delta) {
      if (delta < 0) {
        return {$$emit : "negative change in score"};
      } else if (delta > 0) {
        return {$$emit : "positive change in score"};
      } else {
        return {$$emit : "no change in score"};
      }
    }
  ],
  
  "check for streak" : [ [ "streak", "delta" ], 
    function  (streak, delta) {
      if ((streak >2) && (delta >0)) {
        return {$$emit : "streak"};
      }
    }
  ],
  
  "look for new high scores" : [ [ "highscores", "oldHighScores", "gid" ],
    function  (highscores, oldHighScores, gid) {
      var i, n, row, date, tempOldHighScores, rowClass;
      n = highscores.length;
      tempOldHighScores = {};
      for (i = 0; i<n; i += 1) {
        row = highscores[i];
        if (gid === row._id) {
          row.ownscore = true;
        } else if (oldHighScores && !(oldHighScores.hasOwnProperty(row._id)) ) {
          //new high scores from others added
          row.externalnewscore = true;
        }
        tempOldHighScores[row._id] = true;
      }    
      return { $set: {oldHighScores: tempOldHighScores},
          $$emit : "high scores checked"
      };
    }
  ]
  
};
});

require.define("/ui/gamecontrol.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var a, b;

var fadelevel = 0.4;

var ret; 

module.exports = function (gcd) {
  
  ret = gcd.ret;
  gcd.install(file, a);
  

};

b = { "hand key bindings": function (evnt) {
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
  
  "emit new game requested" : function me () {
    ret({ $$emit : "new game requested" }, file+"emit new game requested");
  },
   
  "emit draw cards requested" : function me () {
    ret({ $$emit : "draw cards requested" }, file+"emit draw cards requested");
  },
  
  "emit end game requested" : function me  () {
    ret({ $$emit : "end game requested" }, file+"emit end game requested");     
  },
  
  "emit retrieve game requested" : function me (event) {
    ret({ $set : {"requested gid" : $(event.target).parents("tr").attr("id") },
      $$emit : 'old game requested'
    }, file+"emit retrieve game requested");
  },
  
  
  "show about" : function () {
    $('#modal-about').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  }

  
};


a = {
  "install endgame" : function () {
    $("#togglegame").html('<a id="endgame">End Game</a>');        
  },
  "install startgame": function () {
    $("#togglegame").html('<a id="newgame">Start Game</a>');      
  },
  "remove main fade" : function  () {
    $(".main").fadeTo(200, 1);
  },
  "fade main" : function  me () {
    $(".main").fadeTo(600, fadelevel, function () {
      ret( { $emit : "main is faded" }, me.desc );
    });
  },
  

  //key clicks
  "bind hand keys" : function () {
    $('html').bind('keyup', b["hand key bindings"]);
  },
  "unbind hand keys" : function () {
    $('html').unbind('keyup', b["hand key bindings"]);
  },
  "listen for name entry" : function me () {
    ret({ $$on: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }}, me.desc);
  },
  "remove listen for name entry" : function me () {
    ret({ $$removeListener: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }}, me.desc);
  },
  
  "initialize game clicks, hide stuff" : function () {
    $("#newgame").live('click', b["emit new game requested"]);
    $("#drawcards").click(b["emit draw cards requested"]);
    $("#endgame").live('click', b["emit end game requested"]);
    $("#endgame").hide(); 
    $(".main").fadeTo(100, fadelevel);
    $("#hs").click(b["emit retrieve game requested"]);
    $("#about").click(b["show about"]);
  
    
  }
  
};



/*
//gcd.once("name registered"                , a["skip name"]); // ui/gamecontrol: 
//Remove "end game", "emit check"; ON "end game" send end game

  "skip name" : function (data) {
    gcd.removeListener("end game", a["emit check"]);
    gcd.on("end game", a["send end game"] function (data) {
      gcd.emit("send end game", data);
    }); 
  },
  */

});

require.define("/ui/history.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/history: ';

var a, b;


module.exports = function (gcd) {
  gcd.install(file, a);  
};


b = {
  "assemble the hand's short call" :  function (hand) {
    var i, n, c, shc; 
    n = hand.length; 
    shc = '';
    for (i= 0; i <n; i += 1) {
      c = hand[i];
      if (c[0] === "new") {
        shc += " <strong>"+c[1][0] +c[1][1]+"</strong> ";          
      } else {
        shc += " " + c[1][0] + c[1][1] + " ";                
      }
    }
    return shc; 
  },
  
  'generate delta label' : function (delta) {
    if (delta > 0) {
      return "class='label success'>&#x25B2;"+delta;
    } else if (delta <0 ) {
      return "class='label important'>&#x25BC;"+(-1*delta);
    } else {
      return "class='label' >▬";
    }
  }
  
};


a = {
  'empty history body' :  function () {
    $('#history table tbody').empty();
  },
  
  
  'add row to history' :  [ ["historycount", "score", "shortcall",
                              {$$transform: [b['generate delta label'], "delta"]},
                              {$$transform: [b["assemble the hand's short call"],  "shorthand"]}],  
    function (historycount, score, shortcall, deltalabel, shorthand) {
      $('#history table tbody').prepend(
        "<tr><td>" + historycount + ".</td><td>" +
        score + "</td><td><span " + deltalabel + "</span></td><td class='left'>" +
        shorthand + "</td><td>" + shortcall + "</td></tr>"
        );    
    }] 
  
};




});

require.define("/ui/hand.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

var file = 'ui/hand: ';

var cardutil = require('../utilities/cards');
var deck = cardutil.deck;

var a, b, ret, store, retrieve;

var querycards, handcall, hail, computecardposition;

module.exports = function (gcd) {
  ret = gcd.ret;
  store = gcd.store;
  retrieve = gcd.retrieve; 
  
  gcd.install(file, a);
    
  
};

b = {
  "translate card click" : function (event) {
    store.clickedcard = $(this);
    ret({ $$emitnow: 'card clicked', $$store : "clickedcard" }, file+"translate card click" );
  }
  
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


a = {
  "load hand" : [ [ "hand" ],
    function (hand) {
      $('#hand li').each(function () {
        var cardnum = this.id[4]-1;
        var pos = computecardposition(hand[cardnum]);
        $(this).css("background-position", "-"+pos[0]+"px -"+pos[1]+"px");
      });
      return { $$emit : "hand loaded" };
    }
  ],
  
  "assemble drawn cards" : function () {
    var carddata = querycards();
    if (carddata[1] === 0) {
      return { $$emit : "no discarded cards" };
    }
    return { $set : { 
        drawcount : carddata[1],
        draws : carddata[0]
      },
      $$emit : "cards discarded"
    };
  },
  
  "restore cards" : function () {
    $("#hand li").removeClass('draw').removeClass('backing');
  },
  
  "make full hand call" : [ [{ $$transform : [ handcall,  "call" ] }],
    function (call) {
      $("#handtext").html(call);
    }
  ],
  
  "show deck" : function () {
    $('#dc').fadeTo(400, 1);
  },
  
  "update number of cards left" : [ [ "cardsleft" ], 
    function  (cardsleft) {
      $("#numcards").html(cardsleft);
    }
  ],
  
  "remove deck" : function () {
    $('#dc').fadeTo(400, 0.5); 
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
    ret({$$on : {"hand loaded" : "show hand" } }, file+"hide hand");
  },
  
  "show hand" : function () {
    $("#hand").css("visibility", "visible"); 
  },

  "toggle draw cards" : [ [ "cardsleft", {$$retrieve : "clickedcard"}],
    function (cardsleft, card$) {
      card$ = retrieve(card$.slice(9)); // uses gcd.retrieve to get object, but wanted above for doc
      var drawcount;
      if (card$.hasClass('draw')) {
        card$.removeClass('draw');
      } else if (cardsleft < 5) {
        drawcount = querycards()[1];
        if (drawcount >= cardsleft) {
          return {$$emit : "not enough cards left"};
        } else {
          card$.addClass('draw');
        }
      } else {
        card$.addClass('draw');      
      }      
    }
  ],
  
  
  "initialize draw card click, hide hail, hand" : function () {
   $('#hand li').bind("click"     , b["translate card click"]); 
   
   $('#hail >span').hide();
   
   a["hide hand"](); 
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


hail = function (domid) {
  $(domid).fadeIn(600).fadeOut(600);  
};


computecardposition = function (card) {
  var i;
  for (i = 0; i<52; i+=1) {
    if (card === deck[i]) {
      return [(i % 8)*86, Math.floor(i/8)*120];
    }
  }
  ret( { $$emit : "card not found" } );
  return [0, 0];
};




  
  
  
  

});

require.define("/ui/scores.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require, humaneDate*/

var file = 'ui/scores: ';

var ret;

var a;

module.exports = function (gcd) {
  ret = gcd.ret; 
  gcd.install(file, a);   
};



a = {
  'clear streak' : function  () {
    $('#inarow').html("&nbsp;");
  }, 
  'call streak' : [ [ "streak", "level" ], 
    function  (streak, level) {
      $('#inarow').html(streak + " in a row" + (level ? " with a bonus of "+ level + "!" : "!"));
    }
  ],
  'get name' : function me () {
    $('#scoreentry').bind('hide', function self () {
      var name;
      name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
      if (!name) {
        name = "___";
      } else {
        $("#name a").html(name);
      }
      $('#scoreentry').unbind('hide', self); //self cleanup
      ret({ $set : {name : name},
        $$emit : 'name submitted' }, me.desc);
    });
  },
  "add listener to show high scores" : function () {
    return {$$once : {"high scores checked" : "display high scores" } };
  },
  'display high scores' : [ [ "highscores" ],
    function (highscores) {
      var row, rowclass, n, i, date;
      n = highscores.length;
      highscores.sort(function (a,b) {return b.score -a.score;});
      var htmltablebody = '';
      for (i = 0; i<n; i += 1) {
        row = highscores[i];
        date = humaneDate(new Date (row.date)).toLowerCase();
  //      date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
        rowclass = '';
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
    }
  ], 
  "pulse negative score" : [ [ "score", "delta" ],
     function (score, delta) {
      $("#score").html(score);
      $("#delta").html("&#x25BC;"+(-1*delta));
      $('#score, #delta').removeClass("scoreminus scoreplus");
      setTimeout(function () {$('#score, #delta').addClass("scoreminus");}, 5);
      return {$$emit : "score loaded" };
    }
  ],
  "pulse positive score" :   [ [ "score", "delta" ],
    function (score, delta) {
      $("#score").html(score);
      $("#delta").html("&#x25B2;" + delta);
      $('#score, #delta').removeClass("scoreminus scoreplus");
      setTimeout(function () {$('#score, #delta').addClass("scoreplus");}, 5);
      return {$$emit : "score loaded" };
    }
  ],
  "no score change" : [ [ "score", "delta" ],
     function (score, delta) {
      $("#score").html(score);
      $("#delta").html("▬");
      $('#score, #delta').removeClass("scoreminus scoreplus");
      return {$$emit : "score loaded" };
    }
  ],
  
  
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
  
  "get name value" : function () {
    var name = $("#namemodal").val().replace(/\W/g, ''); 
    if (name) {
      $("#name a").html(name);
      return {$set : { name : name }};
    }
  }, 
  
 /* "initialize name" : function (data) {
    data.name = '';
  }, */
  
  "bind name entry keys" : function () {  
    $('html').bind('keyup', a["keys for name entry"]);
  },
  
  "unbind name entry keys" : function () {
    $('html').unbind('keyup', a["keys for name entry"]);
  },
  
  'initialize name/score clicks, modals, high scores' : function () {
    $('#highscores')    .bind("click", a["retrieve high scores for viewing"]);
    $("#name")          .bind("click", a["name entry requested"]);
    $("#submitname")    .bind("click", a["hide name entry"]);
    $("#scoreentry")    .bind("hide" , a["emit name entry hidden"]);
  
    a["install score entry"]();
    
    return { $$emit : "high scores requested" };
    
    //a["initialize name"](data);
    
  },
  
  /*
  a["emit submit name"] = function () {
      gcd.emit("name submitted", data);
  };*/

  "retrieve high scores for viewing" : function () {
    ret({$$once : { "high scores checked" : "display high scores" }, 
      $$emit : "high scores requested" });
  },
  
  "name entry requested" : function () {
    $('#scoreentry').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    ret({$$emit : "name entry shown"});
  },
  
  "hide name entry" : function () {
    $("#scoreentry").modal('hide');
  },
  
  "emit name entry hidden" : function () {
    ret({ $$emit : "name entry hidden" });
  },
  
  "keys for name entry" : function  (evnt) {
    if (evnt.keyCode === 13) {
      a["hide name entry"]();
      return false;
    } 
  }
  
};


});

require.define("/events.js", function (require, module, exports, __dirname, __filename) {
    /*globals $, module, console, require*/

module.exports = function (gcd) {
  var a = gcd.a;
  
  gcd.on("ready"                          , a["initialize values"]);  // logic/gamecontrol:
  gcd.on("ready"                          , a["initialize score data"]); // logic/scores:
  gcd.on("ready"                          , a["initialize game clicks, hide stuff"]); // ui/gamecontrol: 
  gcd.on("ready"                          , a["initialize draw card click, hide hail, hand"]); // ui/hand:   
  gcd.on("ready"                          , a['initialize name/score clicks, modals, high scores']);// ui/scores: "high scores requested"
                                          
                                          
  gcd.on("new game requested"             , a["zero history count"]); // logic/history:
  gcd.on("new game requested"             , a["negate oldhand"]);   // logic/history:
  gcd.on("new game requested"             , a['empty history body']); // ui/history:
  gcd.on('new game requested'             , a["send new game"]);  // logic/gamecontrol: "server started new game" OR "new game denied"
  gcd.on("new game requested"             , a["reset hand state"]); // logic/hand: 
  gcd.on("new game requested"             , a["remove main fade"]); // ui/gamecontrol: 
  gcd.on("new game requested"             , a["clear streak"]);// ui/scores: 
  
  gcd.on("server started new game"        , a["note new hand"]); // logic/hand: 
  gcd.on("server started new game"        , a["install endgame"]); // ui/gamecontrol: 
  gcd.on("server started new game"        , a["bind hand keys"]); // ui/gamecontrol: 
  gcd.on("server started new game"        , a["listen for name entry"]); // ui/gamecontrol: ON "name entry shown", ON "name submitted"
  gcd.on("server started new game"        , a["remove main fade"]); // ui/gamecontrol: 
  gcd.on("server started new game"        , a["load hand"]); // ui/hand: "hand loaded" 
  gcd.on("server started new game"        , a["update number of cards left"]); // ui/hand: 
  gcd.on("server started new game"        , a["pulse positive score"]);// ui/scores: 

  gcd.on("card clicked"                   , a["toggle draw cards"]); // ui/hand: "not enough cards left"
                                            
  gcd.on("draw cards requested"           , a["increment history count"]); // logic/history:
  gcd.on("draw cards requested"           , a["assemble drawn cards"]); // ui/hand: "no discarded cards"  OR "cards discarded"
  gcd.on("draw cards requested"           , a["clear streak"]); // ui/scores:   
  
  gcd.on("server drew cards"              , a["check for cards left" ]); // logic/hand:  // IF cards <=0, "no cards left to draw"
  gcd.on("server drew cards"              , a["load hand"]); // ui/hand: 
  gcd.on("server drew cards"              , a["update number of cards left"]); // ui/hand: 
  
  gcd.on("miagan"                         , a["display miagan"]); // ui/hand: 
  gcd.on("hail mia"                       , a["display hail mia"]); // ui/hand: 
  gcd.on("mulligan"                       , a["display mulligan"]); // ui/hand: 
  gcd.on("hail mary"                      , a["display hail mary"]); // ui/hand: 
  gcd.on("hail call checked"              , a["note old hand"]); // logic/hand: 
  
  gcd.on('cards discarded'                , a["send draw cards"]);  // logic/gamecontrol: "server drew cards" OR "failed to draw cards"
  gcd.on("cards discarded"                , a["check for a hail call"]); // logic/hand: "hail call checked" AND MAYBE "miagan", "mulligan", "hail mia", "hail mary"
  gcd.on("cards discarded"                , a["use backing for discarded cards"]); // ui/hand: 

  gcd.on("server drew cards"              , a["check delta"]);  //  logic/scores: "(negative OR positive OR no) change in score"
  gcd.on("server drew cards"              , a["check for streak"]); // logic/scores: "streak" OR ""
 
  gcd.on("hand loaded"                    , a["restore cards"]); // ui/hand: 
  gcd.on("hand loaded"                    , a["make full hand call"]); // ui/hand: 
  // gcd.on("hand loaded"                 , a["show hand"]) // ui/hand: added by hide hand
                      
  gcd.on("no cards left to draw"          , a["end the game"]); // logic/hand: 
  gcd.on("no cards left to draw"          , a["remove deck"]); // ui/hand: 

  gcd.on("negative change in score"       , a["pulse negative score"]);// ui/scores: "score loaded"
  gcd.on("positive change in score"       , a["pulse positive score"]);  // ui/scores: "score loaded"
  gcd.on("no change in score"             , a["no score change"]);    // ui/scores: "score loaded"

  gcd.on("score loaded"                   , a["process row data"]);  // logic/scores: "add history"
  gcd.on("streak"                         , a["call streak"]); // ui/scores: 
  gcd.on("add history"                    , a['add row to history']); // ui/history: ""
  
  gcd.on("end game requested"             , a["add listener to show high scores"]);// ui/scores: ONCE "high scores checked"
  gcd.on("end game requested"             , a["check score/name"]);  // logic/scores: "name requested for high score" OR "no highscore at end of game"
  // above removed by 'remove score/name'
  //ON "end game requested", a["send end game"] // logic/gamecontrol: added by "attach end to request"
  
  gcd.on("server ended game"              , a["look for new high scores"]); // logic/scores:  "high scores checked"
  gcd.on("server ended game"              , a["install startgame"]); // ui/gamecontrol: 
  gcd.on("server ended game"              , a["unbind hand keys"]); // ui/gamecontrol: 
  gcd.on("server ended game"              , a["remove listen for name entry"]); // ui/gamecontrol: REMOVE "name entry shown", REMOVE "name submitted"
  gcd.on("server ended game"              , a["fade main"]); // ui/gamecontrol: "main is faded"

  //  gcd.on("high scores checked"          , a["display high scores"]); // ui/scores: 

  gcd.on('name requested for high score'  , a["watch name to send end game"]); // logic/scores: once
  gcd.on("name requested for high score"  , a["name entry requested"]);// ui/scores: "name entry shown"

  gcd.on("name entry shown"               , a["bind name entry keys"]);// ui/scores:
  gcd.on("name entry shown"               , a["focus into name modal"]);// ui/scores:  
  gcd.on("name entry shown"               , a["get name"]); // ui/scores:  'name submitted'
  
  // gcd.on("name entry shown"      , a["unbind hand keys"]); // ui/gamecontrol: added by "listen for name entry"
  // gcd.removeListener("name entry shown", a["unbind hand keys"]); // ui/gamecontrol: removed by "remove listen for name entry"
 
  //gcd.on("name entry hidden"            , a["emit submit name" ]);// ui/scores: 
  
  gcd.on("name submitted"                 , a["attach end to request"]); // logic/gamecontrol: removeListerner, on
  gcd.on("name submitted"                 , a["remove score/name"]); // logic/scores: removeListener
  gcd.on("name submitted"                 , a["unbind name entry keys"]);// ui/scores: 
  // ONCE "name submitted", a["send end game"]  // logic/gamecontrol: added by "watch name to send end game"
  // gcd.on("name submitted"       , a["bind hand keys"]); // ui/gamecontrol: added by "listen for name entry"
  // gcd.removeListener("name submitted"  , a["bind hand keys"]);  // ui/gamecontrol: removed by "remove listen for name entry"
  // gcd.on("name submitted"               , a["get name value"]);// ui/scores: 
  
  
  gcd.on('no highscore at end of game'    , a["send end game"]); // logic/gamecontrol: "server ended game" OR "end game denied"
  //above removed by "attach end to request" 

  gcd.on('high scores requested'          , a["send view scores"]); // logic/gamecontrol: "server sent high scores" OR "view scores denied"
  
  gcd.on("server sent high scores"        , a["look for new high scores"]);  // logic/scores: "high scores checked"
  


  
};
});

require.define("/entry.js", function (require, module, exports, __dirname, __filename) {
    /*global $, console, submitScore, require, process*/

var events = require('events');

 gcd = new events.EventEmitter(); 


require('./utilities/debugging')(gcd);
require('./utilities/inventory')(gcd, true);

/*
gcd.emit = (function (gcd) {
  var _emit = gcd.emit;
  var self = gcd;
  return function () {
    var args = arguments;
    process.nextTick(function () {_emit.apply(self, args);});
  };
}(gcd));
*/

var data = gcd.data;

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

require('./events.js')(gcd);

$(function() { 
  gcd.emit("ready", data);
});



  





});
require("/entry.js");
