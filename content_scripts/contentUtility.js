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
function ElementPicker(msg,elementList,currIndexKey,userReplySlotKey,sessionObject,expectedReplyHandlers,shouldHighlight=true,highlightColor="red"){
	// var forms = formFillerSession.get("all_forms");
	var currIndex = sessionObject.get(currIndexKey);
	var userReply = msg.getSlot(userReplySlotKey);
	// console.log(userChosenIndex);
	if(userReply==undefined){
		console.log("said nothing");
		addSessionAttribute(msg,"asking_option",currIndex);
		sessionObject.add(currIndexKey,currIndex);
		if(shouldHighlight){			
			highlightElement(elementList[currIndex],highlightColor);
		}
		sendMessageToVop(msg,"Perform input on element "+(currIndex+1)+"?","Answer in a yes or no");
		return;
	}
	for(possibleReply of expectedReplyHandlers){
		if(possibleReply.name == userReply.value){
			possibleReply.handler(msg,userReply.value);
		}
	}
}