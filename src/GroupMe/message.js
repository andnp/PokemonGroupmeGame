var API = require('groupme').Stateless;
var fs = require('fs');
var ImageService = require('groupme').ImageService;

var access_token = JSON.parse(fs.readFileSync("./accessKeys.json")).access_token;
var bot_id = JSON.parse(fs.readFileSync("./accessKeys.json")).bot_id;

function numToZeroString(num){
	var str = ""+num;
	if(num < 10)
		str = "00"+num;
	else if(num < 100)
		str = "0"+num;

	return str;
}

function post(str,url){
	var options = {};
	if(url)
		options = {picture_url: url};
	API.Bots.post(access_token, bot_id, str, options, function(err, res){
		if(err)
			throw(err);
	});
}

function postPicture(str, num){
	var numstr = numToZeroString(num);
	ImageService.post(
	"./Data/pokemon/" + numstr +".png",
	function(err, res){
		if(err) throw(err);
		post(str, res.picture_url);
	});
}

module.exports = {
	post: post,
	postPicture, postPicture
}