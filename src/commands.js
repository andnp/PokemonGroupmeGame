var messenger = global.DEBUG ? require('./debugMessenger.js') : require('./GroupMe/message.js');
var gsm = require('./gameStateMachine.js');
var utils = require('./Utils/utils.js');

/* Helper Methods */

function increaseScore(game, user){
	if(game.score[user] == undefined)
		game.score[user] = 0;
	game.score[user] = game.score[user] + 1 || 1;
}

var lastEnded = Date.now();

function hasGuessed(user, game){
	return utils.isIn(game.guessed, user);
}

function canStart(game){
	var seconds = Math.floor((Date.now() - lastEnded) / 1000);
	if(seconds < global.waitTime){
		messenger.post("Please wait " + (global.waitTime - seconds) + " seconds then try again");
	}
	return !game.running && seconds > global.waitTime;
}

function secondGuess(user){
	var str = "Sorry " + user + ", but you've already had your guess for this round, and you were wrong.";
	messenger.post(str);
}

/* Commands */

function correctGuess(user, game){
	if(!hasGuessed(user, game) && game.running){
		lastEnded = Date.now();
		game.gameState = 4;
		messenger.post("Good job " + user);
		increaseScore(game, user);
		gsm.exec(game);
	} else if(hasGuessed(user, game) && game.running){
		secondGuess(user);
	}
}

function reset(game){
	messenger.post("resetting");
	utils.reset(game);
}

function resetScores(game){
	reset(game);
	game.score = {};
}

function printScores(game){
	utils.printScores(game.score);
}

function startGen1(game){
	if(!canStart(game)) return;
	game.maxPoke = 151;
	game.minPoke = 1; 
	gsm.start(game);
}

function startGen2(game){
	if(!canStart(game)) return;
	game.maxPoke = 251;
	game.minPoke = 152; 
	gsm.start(game);
}

function startGen3(game){
	if(!canStart(game)) return;
	game.maxPoke = 386;
	game.minPoke = 252; 
	gsm.start(game);
}

function startGen4(game){
	if(!canStart(game)) return;
	game.maxPoke = 493;
	game.minPoke = 387; 
	gsm.start(game);
}

function startGen5(game){
	if(!canStart(game)) return;
	game.maxPoke = 649;
	game.minPoke = 494; 
	gsm.start(game);
}

function startGen6(game){
	if(!canStart(game)) return;
	game.maxPoke = 718;
	game.minPoke = 650; 
	gsm.start(game);
}

function whatIs(text){
	var move = text.split('what is ')[1];
	var moveData = dataService.getMoveData(move);
	if(moveData != null){
		var str = "Move " + moveData.name + " has " + moveData.power + " power " + moveData.accuracy + " accuracy and " + moveData.description.toLowerCase();
		messenger.post(str);
	} else {
		var str = "Couldn't find it, sorry!";
		messenger.post(str);
	}
}

function wrongGuess(user, game){
	if(!hasGuessed(user, game) && game.running){
		game.guessed.push(user);
		messenger.post("Nope. Sorry " + user + ", but you are wrong.");
	} else if(hasGuessed(user, game) && game.running){
		secondGuess(user);
	}
}


module.exports = {
	correctGuess: correctGuess,
	reset: reset,
	resetScores: resetScores,
	printScores: printScores,
	startGen1: startGen1,
	startGen2: startGen2,
	startGen3: startGen3,
	startGen4: startGen4,
	startGen5: startGen5,
	startGen6: startGen6,
	whatIs: whatIs,
	wrongGuess: wrongGuess
}