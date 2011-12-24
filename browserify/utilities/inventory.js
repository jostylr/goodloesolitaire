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
          value = data.key;
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