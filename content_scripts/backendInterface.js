// Interface for content scripts to communicate with background scripts
function informBackground(data,forVop=false){
	var msg = {
		eventType:"msg_from_local_content_script",
		forVop:forVop,
		data:data
	};
	// console.log("sending "+msg);
	browser.runtime.sendMessage(msg);
	session.add("lastSentBy",tab);
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
	console.log(vopMsgRcvd.getAllSessionAttributes());
	vopMsgRcvd.getAllSessionAttributes()[key] = new SessionAttribute(key,value);
	console.log(vopMsgRcvd.getAllSessionAttributes());
}