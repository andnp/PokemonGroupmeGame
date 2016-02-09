var fs = require('fs');
var utils = require('../Utils/utils.js');

function getMoveData(move){
	console.log("looking for: " + move);
	try {
		var dataStr = fs.readFileSync('./Data/moveData/' + move + '.json');
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

function getRandomMoves(moves, num){
	if(moves.length < num){
		return moves;
	}
	var ret = utils.getRandomEntries(moves, num);
	return ret;
}

module.exports = {
	getMoveData: getMoveData,
	getAllLevelMoves: getAllLevelMoves, 
	getRandomMoves: getRandomMoves
}