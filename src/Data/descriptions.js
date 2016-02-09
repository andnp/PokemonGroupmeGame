var fs = require('fs');

function getDescriptions(){
	var dataStr = fs.readFileSync('./Data/pokemonDescription/data.json');
	var data = JSON.parse(dataStr);
	return data;
}

function getRandomDescription(name, descriptions){
	name = name.toLowerCase();
	var descs = descriptions[name];
	var randi = Math.floor(Math.random() * descs.length);
	return descs[randi];
}

module.exports = {
	getDescriptions: getDescriptions,
	getRandomDescription: getRandomDescription
}