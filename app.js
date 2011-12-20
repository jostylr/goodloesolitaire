/*jslint node:true */

var express = require('express');
var app = express.createServer();

//app-specific modules
var scores = require('./scores');
var games = require('./games');
var users = require('./users');

//dealing with require issues--probably should refactor
games.initializehs(scores);


var setHeaders = function (req,res,next) {
// if ajax set access control	

//if (req.xhr) {	 
	//res.header("Access-Control-Allow-Origin",req.header('origin'));	
	//res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");	 
	//res.header("X-Powered-By","nodeejs");	
	res.header("Cache-Control", "no-store");
//}	

next();
};

var logger = function (req, res, next) {
	console.log(req.headers);
	res.on('end', function (arg) {
		console.log(arg); 
	});
	next();
};

app.configure( function () {
  app.use(express.logger({format:':req[Accept]  :res[Content-Type] :http-version :response-time :remote-addr :date :method :url :referrer :user-agent :status'}));
	app.use(setHeaders);
	app.use(express.bodyParser());
	//app.use(logger);
	app.use(express["static"](__dirname + '/public'));	
});


app.get('/retrievegame/:gid', function (req, res) {
	games.retrievegame(res, req.params.gid);
});

app.get('/viewscores', function (req, res) {
	scores.viewscores(res); 
});


app.get('/drawcards/:id/:gid/:cards', function (req, res) {
  if (req.params.gid && req.params.cards) {
  	games.drawcards(res, req.params.cards, req.params.id, req.params.gid, scores);    
  }
});

app.get('/endgame/:id/:gid/:name', function (req, res) {
	games.endgame(res, req.params.id, req.params.gid, scores, req.params.name);
});

app.post('/login', function (req, res){
	//implement oauth
	
}); 

app.get('/shuffle/:id/:type', function (req, res) {
	games.shuffle(res, req.params.id, req.params.type, scores);		
});
	
//	  console.log("posting", req.params.com, req.params.id);
//    res.json([req.params.com, req.params.id, req.body]);

app.listen(3000);

console.log("node started", Date.now());