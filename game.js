global.DEBUG = false;
global.time = .5; // in minutes
global.waitTime = 15; // in seconds


if(process.argv[2] == "--debug"){ // if run with --debug, then run in terminal
	global.DEBUG = true;
	global.time = .1;
	global.waitTime = 5;
}

/* Load NPM Modules */
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());

/* Load user modules */
var messenger = global.DEBUG ? require('./src/debugMessenger.js') : require('./src/GroupMe/message.js');
var utils = require('./src/Utils/utils.js');
var dataService = require('./src/Data/data.js');
var commands = require('./src/commands.js');


var names = dataService.getAllNames();
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

function isValidPokemon(name){
	return utils.isIn(names, name);
}

function parseCommand(text, user){
	var data = dataService.getData(gameObject.num);
	var name = data.name.toLowerCase();
	if(name == text){
		commands.correctGuess(user, gameObject);	
	} else if(text == "merpmer"){
		commands.reset(gameObject);
	} else if(text == "merpmerpmer"){
		commands.resetScores(gameObject);
	} else if(text == "score"){
		commands.printScores(gameObject);
	} else if(text.indexOf("start pokebot") > -1){
		var args = text.split("start pokebot")[1];
		if(args == " gen 1"){
			commands.startGen1(gameObject);
		} else if(args == " gen 2"){
			commands.startGen2(gameObject);
		} else if(args == " gen 3"){
			commands.startGen3(gameObject);
		} else if(args == " gen 4"){
			commands.startGen4(gameObject);
		} else if(args == " gen 5"){
			commands.startGen5(gameObject);
		} else if(args == " gen 6"){
			commands.startGen6(gameObject);
		} else if(args != ""){
			messenger.post("Don't know that command. Starting Gen 1");
		}
		commands.startGen1(gameObject);
	} else if(text.indexOf("what is") > -1){
		commands.whatIs(text);
	} else if(isValidPokemon(text)){
		commands.wrongGuess(user, gameObject);
	}
}

if(!global.DEBUG){
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
