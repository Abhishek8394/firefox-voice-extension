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
	if(msg.eventType=="printRoutes"){		
		router.printRoutes();
	}
	else{
		if(router.routes[msg.eventType]!=undefined){
			for(f of router.routes[msg.eventType]){
				f(msg);
			}
		}
		else{
			console.log("illegal event");
		}
	}
}
browser.runtime.onMessage.addListener(msgRcv);