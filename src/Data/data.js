var fs = require('fs');
var descriptions = require('./descriptions.js');
var moves = require('./moves.js');


function getData(num){
	var dataStr = fs.readFileSync('./Data/pokemonData/'+num+'.json');
	var data = JSON.parse(dataStr);
	return data;
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

function getAllNames(){
	var names = [];
	for(var i = 1; i < 719; i++){
		var data = getData(i);
		var name = data.name.toLowerCase();
		names.push(name);
	}
	return names;
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

module.exports = {
	/* General data methods */
	getData: getData,
	getAllNames: getAllNames,
	getTypes: getTypes,
	getHeightWeight: getHeightWeight,

	/* Description methods */
	getDescriptions: descriptions.getDescriptions,
	getRandomDescription: descriptions.getRandomDescription,

	/* Moves methods */
	getMoveData: moves.getMoveData,
	getAllLevelMoves: moves.getAllLevelMoves,
	getRandomMoves: moves.getRandomMoves
}