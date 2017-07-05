// Interface for content scripts to communicate with background scripts
function informBackground(data,forVop=false){
	var msg = {
		eventType:"msg_from_local_content_script",
		forVop:forVop,
		data:data,
		from: document.getElementsByTagName("title")[0].innerText
	};
	// console.log("sending "+msg);
	browser.runtime.sendMessage(msg);
	// session.add("lastSentBy",tab);
}

function sendMessageToVop(vopMsgRcvd,outputText,repromptText,shouldEndSession=false){
	informBackground({
		sessionAttributes:vopMsgRcvd.getAllSessionAttributes(),
		outputText:outputText,
		repromptText:repromptText,
		shouldEndSession:shouldEndSession
	},true);
}

function addSessionAttribute(vopMsgRcvd,key,value){
	// console.log(vopMsgRcvd.getAllSessionAttributes());
	console.log(key,value);
	vopMsgRcvd.getAllSessionAttributes()[key] = new SessionAttribute(key,value);
	console.log(vopMsgRcvd.getAllSessionAttributes());
}

function removeSessionAttribute(vopMsgRcvd, key){
	console.log("Removing session attribute: " + key);
	vopMsgRcvd.removeSessionAttribute(key);
}

function pingHandler(msg){
	if(msg.eventType=="ping"){
		console.log("ping received");
		return Promise.resolve({msg:"pong",from:document.getElementsByTagName("title")[0].innerText});
	}
}

browser.runtime.onMessage.addListener(pingHandler);