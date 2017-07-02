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

// return volumeLevel based on high,low, med. Return undefined if something like inc or dec
function decipherVolume(volumeLevel){
	var highValues = ["high", "full", "loud"];
	var lowValues = ["low", "soft", "dull", "quiet"];
	var mediumValues = ["medium", "pleasant", "med", "mediocre", "normal", "default"];
	var highVolume = 1.0;
	var lowVolume = 0.1;
	var midVolume = 0.5; 
	if(isAValidCommand(highValues, volumeLevel)){
		return highVolume;
	}
	if(isAValidCommand(lowValues, volumeLevel)){
		return lowVolume;
	}
	if(isAValidCommand(mediumValues, volumeLevel)){
		return midVolume;
	}
	return undefined;
}

// check if a command for increasing volume
function isIncreaseVolumeCommand(volumeLevel){
	var increaseCommands = ["inc", "increase", "push", "up", "plus", "higher"];
	return isAValidCommand(increaseCommands, volumeLevel);
}

// check if command for decreasing volume
function isDecreaseVolumeCommand(volumeLevel){
	var decreaseCommands = ["dec", "decrease", "soften", "down", "lower"];
	return isAValidCommand(decreaseCommands, volumeLevel);
}


function volumeSetter(msg,volumeLevel){
	if(volumeLevel==undefined){
		return;
	}
	volumeLevel = volumeLevel.value;
	console.log(volumeLevel);

	var videos = getVideoElement(msg);
	var newVolume = decipherVolume(volumeLevel);
	if(videos.length==0){return;}
	for(video of videos){
		if(newVolume==undefined){
			// switch(volumeLevel){
				// case "inc":
			if(isIncreaseVolumeCommand(volumeLevel)){
				video.volume = Math.min(1,video.volume+0.2);
			}

			else if(isDecreaseVolumeCommand(volumeLevel)){
				console.log(video.volume+" dec freg");
				video.volume = Math.max(0,video.volume-0.2);
				console.log(video.volume);				
			}
					// break;
				// case "dec":
					// break;
			// }
		}
		else{
			video.volume = newVolume;
		}
		
	}		
}

function timeSeeker(msg,incOrDec, key="seek"){
	var seekTimeDelta = msg.getSlot(key);
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

// determine if request is for this tab.
// must be active tab or expicitly mentioned in the command.
function isRequestForMe(msg){
	return isActiveTab();
}

function videoController(msg){
	var videos = getVideoElement(msg);
	console.log(videos);
	if(videos.length==0 || !isRequestForMe(msg)){return;}
	msg = new VopMessage(msg,undefined);
	console.log(msg);
	if(msg.request.intent.slots.volumeLevel!=undefined){
		volumeSetter(msg,msg.getSlot("volumeLevel"));
		addSessionAttribute(msg,"volume_status","changing");
		sendMessageToVop(msg,"changing","");
	}
	else if(msg.request.intent.slots.forwardSeek!=undefined){
		timeSeeker(msg, 1, "forwardSeek");
		addSessionAttribute(msg,"seek_status","changing");
		sendMessageToVop(msg,"fwding","");
	}
	else if(msg.request.intent.slots.backwardSeek!=undefined){
		timeSeeker(msg,-1, "backwardSeek");
		addSessionAttribute(msg,"seek_status","changing");
		sendMessageToVop(msg,"rewinding","");
	}
	else{		
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
	}
	console.log("finally");
}

router.registerRoute("video_intent",videoController);