// Interface for content scripts to communicate with background scripts
function informBackground(tab,data){
	var msg = {
		eventType:"msg_from_local_content_script",
		from:tab,
		data:data
	};
	// console.log("sending "+msg);
	browser.runtime.sendMessage(msg);
	session.add("lastSentBy",tab);
}