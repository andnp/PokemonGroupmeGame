var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());
var API = require('groupme').Stateless;
var ImageService = require('groupme').ImageService;

var num = Math.round((Math.random() * 150) + 1);

var time = 1;

var access_token = JSON.parse(fs.readFileSync("accessKeys.json")).access_token;
var bot_id = JSON.parse(fs.readFileSync("accessKeys.json")).bot_id;

function post(url){
	API.Bots.post(access_token, bot_id, "Pokemon #" + num,{picture_url: url},
		function(err, res){
			if(err) console.log(err);
			console.log(res);
		});
}

function upload(callback){
	var str = ""+num;
	if(num < 10)
		str = "00"+num;
	else if(num < 100)
		str = "0"+num;
	ImageService.post(
	"pokemon/" + str +".png",
	function(err, res){
		if(err) console.log("upload err: " + err);
		callback(res.picture_url);
	});
}

function getDescriptions(){
	var dataStr = fs.readFileSync('pokemonDescription/data.json');
	var data = JSON.parse(dataStr);
	return data;
}

function getData(num){
	var dataStr = fs.readFileSync('pokemonData/'+num+'.json');
	var data = JSON.parse(dataStr);
	return data;
}

function getRandomDescription(name, descriptions){
	name = name.toLowerCase();
	var descs = descriptions[name];
	var randi = Math.floor(Math.random() * descs.length);
	return descs[randi];
}

function getAllNames(){
	var names = [];
	for(var i = 1; i < 719; i++){
		var data = getData(i);
		var name = data.name.toLowerCase();
		names.push(name);
	}
	return names;
}

function getMoveData(move){
	console.log("looking for: " + move);
	try {
		var dataStr = fs.readFileSync('moveData/' + move + '.json');
		var data = JSON.parse(dataStr);
		return data;
	} catch(e) {
		return null;
	}
}

function getAllLevelMoves(data){
	var moves = data.moves;
	var ret = [];
	for(var i = 0; i < moves.length; i++){
		var move = moves[i];
		if(move.learn_type == 'level up' && move.name)
			ret.push(move.name);
	}
	return ret;
}
function isIn(arr, num){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == num)
			return true;
	}
	return false;
}
function getRandomMoves(moves, num){
	var ret = [];
	var temp = [];
	var rand = [];
	if(moves.length < num){
		return moves;
	}
	for(var i = 0; i < num; i++){
		var ranN = Math.round(Math.random() * moves.length);
		if(!isIn(rand, ranN)){
			temp.push(moves[ranN])
			rand.push(ranN);
		} else {
			i--;
		}
	}
	for(var i = 0; i < temp.length; i++){
		if(temp[i] != undefined)
			ret.push(temp[i]);
	}
	return ret;
}

function getTypes(data){
	var types = data.types;
	var ret = [];
	for(var i = 0; i < types.length; i++){
		var type = types[i];
		ret.push(type.name);
	}
	return ret;
}

function getHeightWeight(data){
	return {height: data.height / 10, weight: data.weight / 10};
}

var gameState = 0;
var guessed = [];
var to = null;
var running = false;
var maxPoke = 151;
var minPoke = 1;

var names = getAllNames();
var pokemonDescriptions = getDescriptions();

function reset(){
	clearTimeout(to);
	gameState = 0;
	guessed = [];
	to = null;
	running = false;
}

var score = {};

function increaseScore(user){
	if(score[user] == undefined)
		score[user] = 0;
	score[user] = score[user] + 1 || 1;
}

function printScores(){
	var str = "Scores:\n ";
	for(var key in score){
		str += key + ": " + score[key] + "\n";
	}
	API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
}

function exec(){
	if(!running) return;
	if(gameState == 0){
		num = Math.round((Math.random() * ((maxPoke - minPoke) - 1)) + minPoke);
		console.log(getData(num).name);
		var data = getData(num);
		var moves = getAllLevelMoves(data);
		moves = getRandomMoves(moves, 4);
		var str = "Pokemon moves: ";
		for(var i = 0; i < moves.length; i++){
			str += moves[i] + " ";
		}
		API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
		gameState = 1;
	} else if(gameState == 1){
		var data = getData(num);
		var hwObj = getHeightWeight(data);
		var str = "Pokemon height: " + hwObj.height + " meters, and weight: " + hwObj.weight + " kg";
		API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
		//console.log(str);
		gameState = 2;
	} else if(gameState == 2){
		var data = getData(num);
		var types = getTypes(data);
		var str = "Pokemon types: ";
		for(var i = 0; i < types.length; i++){
			str += types[i] + " ";
		}
		//console.log(str);
		API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
		gameState = 3;
	} else if(gameState == 3){
		var data = getData(num);
		var name = data.name;
		var desc = getRandomDescription(name, pokemonDescriptions);
		API.Bots.post(access_token, bot_id, desc,{}, function(err, res){});
		gameState = 4;
	} else if(gameState == 4){
		upload(post);
		reset();
	}
}

function merp(){
	exec();
	to = setTimeout(merp, time * 30 * 1000);
}

function start(){
	console.log("starting");
	var str = "Welcome to the game. I will post a new hint every " + time + " minutes with 3 total hints. You get one guess. Make sure to spell it right :)";
	API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
	reset();
	running = true;
	merp();
}

app.post('/pokemon', function(req, res){
	//console.log('POST');
	var body = req.body;
	//console.log(body);
	var text = body.text.toLowerCase();
	var data = getData(num);
	var name = data.name.toLowerCase();
	var user = body.name;
	if(name == text && !isIn(guessed, user) && running){
		clearTimeout(to);
		API.Bots.post(access_token, bot_id, "Good job " + user,{}, function(err, res){});
		gameState = 4;
		increaseScore(user);
		printScores();
		exec();
	} else if(text == "merpmer"){
		API.Bots.post(access_token, bot_id, "resetting",{}, function(err, res){});
		reset();
	} else if(text == "merpmerpmer"){
		reset();
		score = {};
	} else if(text.indexOf("start pokebot") > -1 && !running){
		var args = text.split("start pokebot")[1];
		console.log(args);
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
		}
		start();
	} else if(text == "start pokebot"){

	} else if(text.indexOf("what is") > -1){
		var move = text.split('what is ')[1];
		var moveData = getMoveData(move);
		if(moveData != null){
			var str = "Move " + moveData.name + " has " + moveData.power + " power " + moveData.accuracy + " accuracy and " + moveData.description.toLowerCase();
			API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
		} else {
			var str = "Couldn't find it, sorry!";
			API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
		}
	} else if(isIn(names, text) && !isIn(guessed, user) && running){
		guessed.push(user);
		API.Bots.post(access_token, bot_id, "Nope. Sorry kiddo",{}, function(err, res){});
	} else if(isIn(names, text) && isIn(guessed, user) && running){
		var str = "Sorry " + user + ", but you've already had your guess for this round, and you were wrong.";
		API.Bots.post(access_token, bot_id, str,{}, function(err, res){});
	} else if(to == null){
		reset();
	}
});

var server = app.listen(3000, function(){
});
// console.log(getHeightWeight(getData(num)))