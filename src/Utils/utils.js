var messenger = global.DEBUG ? require('../debugMessenger.js') : require('../GroupMe/message.js');

function isIn(arr, num){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == num)
			return true;
	}
	return false;
}

function getRandomEntry(arr){
	var index = Math.floor(Math.random() * arr.length);
	return arr[index];
}

function getRandomEntries(arr, num){
	var ret = [];
	if(arr.length < num)
		throw new Error('Wanted: ' + num + ' random entries, but only have: ' + arr.length + ' entries');
	for(var i = 0; i < num; i++){
		var entry = getRandomEntry(arr);
		if(isIn(ret, entry)) {
			i--;
		} else {
			ret.push(entry);
		}
	}
	return ret;
}

function removeSubstring(str, sub){
	str = str.toLowerCase().replace(sub, "*******");
	return str;
}

function reset(game){
	clearTimeout(game.to);
	game.gameState = 0;
	game.guessed = [];
	game.to = null;
	game.running = false;
}

function printScores(score){
	var str = "Scores:\n ";
	for(var key in score){
		str += key + ": " + score[key] + "\n";
	}
	messenger.post(str);
}

module.exports = {
	isIn: isIn,
	getRandomEntry: getRandomEntry,
	getRandomEntries: getRandomEntries,
	removeSubstring: removeSubstring,
	reset: reset,
	printScores: printScores
}