var Router = function(){
	this.routes={};
	// Scripts call this method to subscribe to intents
	// TODO get content scripts to register here as well
	this.registerRoute = function(intentName,handlerMethod){
		if(this.routes[intentName]==undefined){
			this.routes[intentName] = [];
		}
		this.routes[intentName].push(handlerMethod);
	};
	this.printRoutes = function(){
		console.log(this.routes);
	};
};
var router = new Router();
function msgRcv(msg){
	console.log(msg);
	// if msg.request form for vop requests. msg.eventType for content script requests.
	var intentName = msg.request==undefined?msg.eventType:msg.request.intent.name;
	if(intentName=="printRoutes"){		
		router.printRoutes();
	}
	else{
		if(router.routes[intentName]!=undefined){
			for(f of router.routes[intentName]){
				f(msg);
			}
		}
		else{
			console.log("illegal event");
		}
	}
}
browser.runtime.onMessage.addListener(msgRcv);