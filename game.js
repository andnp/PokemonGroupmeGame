var DEBUG = false;
var time = .5;


if(process.argv[2] == "--debug"){ // if run with --debug, then run in terminal
	DEBUG = true;
	time = .1;
}

/* Load NPM Modules */
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());

/* Load user modules */
var messenger = DEBUG ? require('./src/debugMessenger.js') : require('./src/GroupMe/message.js');
var utils = require('./src/Utils/utils.js');
var dataService = require('./src/Data/data.js');


var names = dataService.getAllNames();
var pokemonDescriptions = dataService.getDescriptions();

var gameObject = {
	gameState: 0,
	guessed: [],
	to: null,
	running: false,
	maxPoke: 151,
	minPoke: 1, 
	num: Math.round((Math.random() * 150) + 1),
	score: {}
}

function reset(game){
	clearTimeout(game.to);
	game.gameState = 0;
	game.guessed = [];
	game.to = null;
	game.running = false;
}

function increaseScore(game, user){
	if(game.score[user] == undefined)
		game.score[user] = 0;
	game.score[user] = game.score[user] + 1 || 1;
}

function printScores(score){
	var str = "Scores:\n ";
	for(var key in score){
		str += key + ": " + score[key] + "\n";
	}
	messenger.post(str);
}

function exec(game){
	if(!game.running) return;
	if(game.gameState == 0){
		game.num = Math.round((Math.random() * ((game.maxPoke - game.minPoke) - 1)) + game.minPoke);
		var data = dataService.getData(game.num);
		console.log(data.name);
		var moves = dataService.getAllLevelMoves(data);
		moves = dataService.getRandomMoves(moves, 4);
		var str = "Pokemon moves: ";
		for(var i = 0; i < moves.length; i++){
			str += moves[i] + " ";
		}
		messenger.post(str);
		game.gameState = 1;
	} else if(game.gameState == 1){
		var data = dataService.getData(game.num);
		var hwObj = dataService.getHeightWeight(data);
		var str = "Pokemon height: " + hwObj.height + " meters, and weight: " + hwObj.weight + " kg";
		messenger.post(str);
		game.gameState = 2;
	} else if(game.gameState == 2){
		var data = dataService.getData(game.num);
		var types = dataService.getTypes(data);
		var str = "Pokemon types: ";
		for(var i = 0; i < types.length; i++){
			str += types[i] + " ";
		}
		messenger.post(str);
		game.gameState = 3;
	} else if(game.gameState == 3){
		var data = dataService.getData(game.num);
		var name = data.name;
		var desc = dataService.getRandomDescription(name, pokemonDescriptions);
		desc = utils.removeSubstring(desc, name.toLowerCase());
		messenger.post(desc);
		game.gameState = 4;
	} else if(game.gameState == 4){
		messenger.postPicture(dataService.getData(game.num).name, game.num);
		reset(game);
	}
}

function merp(){
	exec(gameObject);
	to = setTimeout(merp, time * 60 * 1000);
}

function start(){
	var str = "Welcome to the game. I will post a new hint every " + time + " minutes with 4 total hints. You get one guess. Make sure to spell it right :)";
	messenger.post(str);
	reset(gameObject);
	gameObject.running = true;
	merp();
}

function parseCommand(text, user){
	var data = dataService.getData(gameObject.num);
	var name = data.name.toLowerCase();
	if(name == text && !utils.isIn(gameObject.guessed, user) && gameObject.running){
		clearTimeout(to);
		messenger.post("Good job " + user);
		gameObject.gameState = 4;
		increaseScore(gameObject, user);
		printScores(gameObject.score);
		exec(gameObject);
	} else if(text == "merpmer"){
		messenger.post("resetting");
		reset(gameObject);
	} else if(text == "merpmerpmer"){
		reset(gameObject);
		gameObject.score = {};
	} else if(text.indexOf("start pokebot") > -1 && !gameObject.running){
		var args = text.split("start pokebot")[1];
		maxPoke = 151;
		minPoke = 1;
		if(args == " gen 1"){
			maxPoke = 151;
			minPoke = 1; 
		} else if(args == " gen 2"){
			maxPoke = 251;
			minPoke = 152;
		} else if(args == " gen 3"){
			maxPoke = 386;
			minPoke = 252;
		} else if(args == " gen 4"){
			maxPoke = 493;
			minPoke = 387;
		} else if(args == " gen 5"){
			maxPoke = 649;
			minPoke = 494;
		} else if(args == " gen 6"){
			maxPoke = 718;
			minPoke = 650;
		} else if(args != ""){
			messenger.post("Don't know that command. Starting Gen 1");
		}
		start();
	} else if(text.indexOf("what is") > -1){
		var move = text.split('what is ')[1];
		var moveData = dataService.getMoveData(move);
		if(moveData != null){
			var str = "Move " + moveData.name + " has " + moveData.power + " power " + moveData.accuracy + " accuracy and " + moveData.description.toLowerCase();
			messenger.post(str);
		} else {
			var str = "Couldn't find it, sorry!";
			messenger.post(str);
		}
	} else if(utils.isIn(names, text) && !utils.isIn(gameObject.guessed, user) && gameObject.running){
		guessed.push(user);
		messenger.post("Nope. Sorry kiddo");
	} else if(utils.isIn(names, text) && utils.isIn(gameObject.guessed, user) && gameObject.running){
		var str = "Sorry " + user + ", but you've already had your guess for this round, and you were wrong.";
		messenger.post(str);
	} else if(gameObject.to == null){
		reset(gameObject);
	}
}

if(!DEBUG){
	app.post('/pokemon', function(req, res){
		var body = req.body;
		var text = body.text.toLowerCase();
		var user = body.name;
		parseCommand(text, user);
	});

	var server = app.listen(3000, function(){
	});
} else {
	process.stdin.setEncoding('utf8');

	var input = "";
	process.stdin.on('readable', function() {
	 	input = process.stdin.read();
	 	if(input != "" && input != null){
	 		input = input.substring(0, input.length - 1);
	 		parseCommand(input, "me");
	 	}
	});

	process.stdin.on('end', function(){
	});
}
