var dataService = require('./Data/data.js');
var messenger = global.DEBUG ? require('./debugMessenger.js') : require('./GroupMe/message.js');
var utils = require('./Utils/utils.js');

var pokemonDescriptions = dataService.getDescriptions();

function getRandomPokemon(game){
	return Math.floor(Math.random() * ((game.maxPoke - game.minPoke)) + game.minPoke);
}

function exec(game){
	if(!game.running) {
		utils.reset(game);
		return;
	}
	if(game.gameState == 0){
		game.num = getRandomPokemon(game);
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
		clearTimeout(game.to);
		utils.printScores(game.score);
		messenger.postPicture(dataService.getData(game.num).name, game.num);
		utils.reset(game);
	}
}

function gameTimer(game){
	exec(game);
	game.to = setTimeout(gameTimer, global.time * 60 * 1000, game);
}

function start(game){
	var str = "Welcome to the game. I will post a new hint every " + global.time + " minutes with 4 total hints. You get one guess. Make sure to spell it right :)";
	messenger.post(str);
	utils.reset(game);
	game.running = true;
	gameTimer(game);
}

module.exports = {
	exec: exec,
	start: start
}