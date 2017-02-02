function highlightElement(element,highlightColor="red"){
	// console.log(element.position());
	// var highLighter = document.createElement("div");
	// highLighter.style.position = "absolute";
	// highLighter.style.left = element.style.left;
	// highLighter.style.top = element.style.top;
	// highLighter.style.width = element.style.width;
	// highLighter.style.height = element.style.height;
	// highLighter.style.border = "3 px solid red";	
	// console.log(highLighter);
	// element.appendChild(highLighter);
	var oldBorder = element.style.border;
	element.style.border = "3px solid "+highlightColor;
	return oldBorder;
}

function unHighlightElement(element){
	if(element==undefined){
		return;
	}
	// element.removeChild(highlightElement);
	element.style.border = "transparent";
}

// Interact with user to decide on a option to choose. 
// TODO cancel request, access by index number
function ElementPicker(msg,elementList,currIndexKey,userReplySlotKey,sessionObject,expectedReplyHandlers,shouldHighlight=true,highlightColor="red",promptText,reprompt){
	// var forms = formFillerSession.get("all_forms");
	var currIndex = sessionObject.get(currIndexKey);
	var userReply = msg.getSlot(userReplySlotKey);
	if(promptText==undefined){
		promptText = "Perform input on element "+(currIndex+1)+"?";
	}
	reprompt=reprompt==undefined?promptText:reprompt;
	// console.log(userChosenIndex);
	if(userReply==undefined){
		console.log("said nothing");
		addSessionAttribute(msg,"asking_option",currIndex);
		sessionObject.add(currIndexKey,currIndex);
		if(shouldHighlight){			
			highlightElement(elementList[currIndex],highlightColor);
		}
		sendMessageToVop(msg,promptText,reprompt);
		return;
	}
	for(possibleReply of expectedReplyHandlers){
		if(possibleReply.name == userReply.value){
			possibleReply.handler(msg,userReply.value);
		}
	}
}

// If user is saying yes, no or something else.
function isSayingYes(responseString){
	// responseString = responseString.trim().toLowerCase();
	var positiveWords = ["yes","ok","true"];
	var negativeWords = ["no","nope"];
	if(isAValidCommand(positiveWords,responseString)){
		return true;
	}
	if(isAValidCommand(negativeWords,responseString)){
		return false;
	}
	return undefined;
}

function getPromptDisplayBanner(){
	var banner = document.createElement("div");
	banner.id="foxy-prompt";
	banner.style.height =  "50%";
	banner.style.position = "fixed";
	banner.style.top="25%";
	banner.style.left="25%";
	banner.style.overflow="scroll";
	banner.zIndex=1000;
	banner.style.background="#FFF";
	banner.style.borderRadius="5px";
	banner.style.boxShadow="6px 6px 10px #333";
	banner.style.padding="2%";
	return banner;
}

function isAValidCommand(cmdList,userInput){
	userInput = userInput.trim().toLowerCase();
	for(cmd of cmdList){
		if(cmd==userInput){
			return true;
		}
	}
	return false;
}