/*globals require, console */

var fs = require('fs');

fs.readFile('modmf/static.js', function (err, file) {
  fs.writeFile("node_modules/express/node_modules/connect/lib/middleware/static.js", file, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("file static.js copied to middleware");
    }
  });
});