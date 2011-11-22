var express = require('express');

var app = express.createServer();

app.get('/', function(req, res){
    res.send('Hello World');
});

app.listen(3000);


var app2 = express.createServer();

app2.get('/', function(req, res){
    res.send('Hello World');
});

app2.listen(4000);