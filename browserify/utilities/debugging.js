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