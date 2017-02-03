// For sharing data among scripts.
var globalSession = new Session();

const globalConstants = {
	SCROLL_TARGET:"scrolling_target"
};

function globalInit(){
	globalSession.add(globalConstants.SCROLL_TARGET,window);
}

function resetGlobalScrollTarget(){
	globalSession.add(globalConstants.SCROLL_TARGET,window);	
}

function setGlobalScrollTarget(element){
	globalSession.add(globalConstants.SCROLL_TARGET,element);
}

function isActiveTab(){
	return !document.hidden;
}



function highlightElement(element,highlightColor="red",shouldCenterOn = true){
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
	if(shouldCenterOn){		
		window.scrollTo($(element).position().left,$(element).position().top);	
	}
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
			break;
		}
	}
}

// Interact with user to decide on a option to choose. 
// TODO cancel request, access by index number.
// Currently serves just first one matching response handler. Makes sense and saves resources.
function ElementPicker2(msg,elementList,currIndexKey,userReplySlotKey,expectedReplyHandlers,promptText,reprompt,shouldHighlight=true,highlightColor="red"){
	// var forms = formFillerSession.get("all_forms");
	var currIndex = msg.getSessionAttribute(currIndexKey);
	console.log(currIndex);
	currIndex = currIndex==undefined?0:parseInt(currIndex);
	var userReply = msg.getSlot(userReplySlotKey);
	if(promptText==undefined){
		promptText = "Perform input on element "+(currIndex+1)+"?";
	}
	reprompt=reprompt==undefined?promptText:reprompt;
	// console.log(userChosenIndex);
	if(userReply==undefined){
		console.log("said nothing");
		addSessionAttribute(msg,currIndexKey,currIndex);
		// sessionObject.add(currIndexKey,currIndex);
		if(shouldHighlight){		
			highlightElement(elementList[currIndex],highlightColor);
		}
		sendMessageToVop(msg,promptText,reprompt);
		return;
	}
	for(possibleReply of expectedReplyHandlers){
		if(isAValidCommand(possibleReply.name,userReply.value)){
			possibleReply.handler(msg,elementList,currIndex,userReply.value);
			break;
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
	banner.style.height =  "40%";
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

function getMsgSlotValue(msg,key){
	var val = msg.getSlot(key);
	val = val==undefined?undefined:val.value;
	return val;
}

// Find the innermost text elements as an array.
function getInnerMostText(element){
	var inText=[];
	if(element.children.length==0){
		return [element.innerText];
	}
	for(c of element.children){
		inText.push(getInnerMostText(c));
	}
	return inText;
}

globalInit();