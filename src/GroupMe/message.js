var API = require('groupme').Stateless;
var fs = require('fs');
var ImageService = require('groupme').ImageService;

var utils = require('../Utils/utils.js');

var access_token = JSON.parse(fs.readFileSync("accessKeys.json")).access_token;
var bot_id = JSON.parse(fs.readFileSync("accessKeys.json")).bot_id;

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
	var numstr = utils.numToZeroString(num);
	ImageService.post(
	"pokemon/" + numstr +".png",
	function(err, res){
		if(err) throw(err);
		post(str, res.picture_url);
	});
}

module.exports = {
	post: post
}