/*globals $, module, console, require*/

var file = 'utilities/inventory';

var install, process, makechanges, wrapper, wrapper_debug;

module.exports = function (evem, debug) {
  evem.install = install;
  evem.a = {};
  evem.debug = debug;
  evem.data = {};
  evem.log = {
    "process" : function (desc, args) {
      console.log("args to "+desc+": "+JSON.stringify(args));
    },
    "makechanges" : function (desc, changes) {
      console.log("changes from "+desc+": "+JSON.stringify(changes));
    }
  };
};

install = function (a, file) {
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
  }
  
  
};

wrapper = function (f, args, evem) {
  return function () {
    var changes,doneargs;
    if (!args) {
      changes = f.call(evem);
    } else {
      doneargs = process(evem, args);
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
      doneargs = process(evem, args);
      evem.log.process(me.desc, doneargs);
      changes = f.apply(evem, doneargs);
    }
    if (changes) {
      evem.log.makechanges(me.desc, changes);
    }
    makechanges(evem, changes);
  };
};


process = function (evem, args) {
  var i, n, current;
  var values = [];
  var data = evem.data;
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
      if (current.hasOwnProperty("$$transform")) {
       if (current.$$transform.length === 2) { //simple case
         values.push(current.$$transform[0](data[current.$$transform[1]]));
       }/* else { //later if needed
         //values.push(current.$$transform[0].apply(evem.data, ))
       }*/
      }
    }
  }
  return values; 
};

makechanges = function (evem, changes) {
  //command structure
  var type;
/*  for (type in changes) {
    
  }*/
  return false; 
};