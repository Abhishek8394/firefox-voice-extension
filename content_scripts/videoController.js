function play(msg){
	var videos = getVideoElement(msg);
	console.log(videos);
	if(videos==undefined){return;}
	for(video of videos){
		video.play();
	}
}

function pause(msg){
	var videos = getVideoElement(msg);
	if(videos==undefined){return;}
	for(video of videos){
		video.pause();
	}
}

function getVideoElement(msg){
	var videos = document.getElementsByTagName("video");
	return videos;
}

function videoController(msg){
	msg = new VopMessage(msg,undefined);
	console.log(msg);
	switch(msg.request.intent.slots.action.value){
		case "play":
			play(msg);
			console.log("sdfsdf");
			addSessionAttribute(msg,"player_status","playing");
			sendMessageToVop(msg,"play resuming","");
			break;
		case "pause":
			pause(msg);
			addSessionAttribute(msg,"player_status","pausing");
			sendMessageToVop(msg,"pausing","");
			break;
	}
	console.log("finally");
}

router.registerRoute("video_intent",videoController);