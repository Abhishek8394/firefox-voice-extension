function play(msg){
	var videos = getVideoElement(msg);
	console.log(videos);
	if(videos.length==0){return;}
	for(video of videos){
		video.play();
	}
}

function pause(msg){
	var videos = getVideoElement(msg);
	if(videos.length==0){return;}
	for(video of videos){
		video.pause();
	}
}

function muteToggler(msg,toMute){
	var videos = getVideoElement(msg);
	if(videos.length==0){return;}
	for(video of videos){
		video.muted = toMute;
	}	
}

function volumeSetter(msg,volumeLevel){
	if(volumeLevel==undefined){
		return;
	}
	volumeLevel = volumeLevel.value;
	console.log(volumeLevel);
	var vols = {"high":1,"low":0.1,"med":0.5};
	var videos = getVideoElement(msg);
	var newVolume = vols[volumeLevel];
	if(videos.length==0){return;}
	for(video of videos){
		if(newVolume==undefined){
			switch(volumeLevel){
				case "inc":
					video.volume = Math.min(1,video.volume+0.2);
					break;
				case "dec":
					console.log(video.volume+" dec freg");
					video.volume = Math.max(0,video.volume-0.2);
					console.log(video.volume);
					break;
			}
		}
		else{
			video.volume = newVolume;
		}
		
	}		
}

function timeSeeker(msg,incOrDec){
	var seekTimeDelta = msg.getSlot("seek");
	seekTimeDelta = seekTimeDelta==undefined?5:parseInt(seekTimeDelta.value);
	var videos = getVideoElement(msg);
	if(videos.length==0){return;}
	for(video of videos){
		video.currentTime += incOrDec*seekTimeDelta;
	}	
}

function getVideoElement(msg){
	var videos = document.getElementsByTagName("video");
	return videos;
}

function videoController(msg){
	var videos = getVideoElement(msg);
	console.log(videos);
	if(videos.length==0){return;}
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
		case "mute":
			muteToggler(msg,true);
			addSessionAttribute(msg,"volume_status","muting");
			sendMessageToVop(msg,"muting","");
			break;
		case "unmute":
			muteToggler(msg,false);
			addSessionAttribute(msg,"volume_status","unmuting");
			sendMessageToVop(msg,"unmuting","");
			break;
		case "volume":
			volumeSetter(msg,msg.getSlot("volumeLevel"));
			addSessionAttribute(msg,"volume_status","changing");
			sendMessageToVop(msg,"changing","");
			break;
		case "fwd":
			timeSeeker(msg,1);
			addSessionAttribute(msg,"seek_status","changing");
			sendMessageToVop(msg,"fwding","");
			break;
		case "rewind":
			timeSeeker(msg,-1);
			addSessionAttribute(msg,"seek_status","changing");
			sendMessageToVop(msg,"rewinding","");
			break;
	}
	console.log("finally");
}

router.registerRoute("video_intent",videoController);