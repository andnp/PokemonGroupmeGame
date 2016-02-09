function numToZeroString(num){
	var str = ""+num;
	if(num < 10)
		str = "00"+num;
	else if(num < 100)
		str = "0"+num;

	return str;
}

function post(str){
	console.log(str);
}

function postPicture(str, num){
	var numstr = numToZeroString(num);
	console.log("Would post: " + "pokemon/" + numstr +".png");
	post(str);
}

module.exports = {
	post: post,
	postPicture: postPicture
}