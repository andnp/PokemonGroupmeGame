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

function numToZeroString(num){
	var str = ""+num;
	if(num < 10)
		str = "00"+num;
	else if(num < 100)
		str = "0"+num;

	return str;
}

function removeSubstring(str, sub){
	str = str.toLowerCase().replace(sub, "*******");
	return str;
}

module.exports = {
	isIn: isIn,
	getRandomEntry: getRandomEntry,
	getRandomEntries: getRandomEntries,
	numToZeroString: numToZeroString,
	removeSubstring: removeSubstring
}