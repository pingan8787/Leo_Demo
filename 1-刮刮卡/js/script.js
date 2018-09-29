$(function(){
	var	ts = 1493697600 * 1000;
	console.log(ts)
	// if((new Date()) > ts){
	// 	ts = (new Date()).getTime() + 10*24*60*60*1000;
	// }
	$('#countdown').countdown({
		timestamp	: ts
	});
	
});
