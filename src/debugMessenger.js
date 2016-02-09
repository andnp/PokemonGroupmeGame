var utils = require('./Utils/utils.js');

function post(str){
	console.log(str);
}

function postPicture(str, num){
	var numstr = utils.numToZeroString(num);
	console.log("Would post: " + "pokemon/" + numstr +".png");
	post(str);
}

module.exports = {
	post: post,
	postPicture: postPicture
}