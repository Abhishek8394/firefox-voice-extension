// communicate to VOP server using this interface. This will implement all the protocols necessary.
var VopInterface = function(wbsock){
	this.socket = wbsock;
	this.state=AppConnectionStates.REGISTERING;	
};

VopInterface.prototype.establishConnection=function(){
	this.write(this.appNamePacket());
	var selfPtr = this;
	this.socket.onmessage = function(e){
		selfPtr.readEventHandler(e);
	};
	// var m1=this.buildSpeechletResponse(undefined,"hello!!","hello again!",false);
	// var m2 = this.buildSpeechletResponse(undefined,"world!!","world again!",false);
	// m1.addSessionAttribute("key1","value1");
	// m2.addSessionAttribute("key2",{a:1,b:2});
	// console.log(m1);
	// this.write(m1);
	// this.write(m2);
};

VopInterface.prototype.write = function(msgObj){
	if(this.socket!=undefined){
		var data = JSON.stringify(msgObj);
		this.socket.send(data);
		this.socket.send("\r\n");
		console.log(msgObj);
	}
};

VopInterface.prototype.readEventHandler = function(e){
	var data = new VopMessage(JSON.parse(e.data),this);
	console.log(data);
	if(!this.dataFromValidSource(data)){
		return undefined;
	}
	this.processRequest(data);
	return data;
};

VopInterface.prototype.appNamePacket = function(){
	// App ID sort of registered at VOP. Defined in intentMapping.js
	return {appname:APP_NAME_REGISTERED_AT_VOP};
};

VopInterface.prototype.buildSpeechletResponse = function(sessionAttributes,output,repromptText,shouldEndSession){
	return new SpeechletResponse(sessionAttributes,ResponseTypes.plainText,output,ResponseTypes.plainText,repromptText,shouldEndSession);
};

VopInterface.prototype.quickReply = function(sessionAttributes,output,repromptText,shouldEndSession){
	var resp = new SpeechletResponse(sessionAttributes,ResponseTypes.plainText,output,ResponseTypes.plainText,repromptText,shouldEndSession);
	this.write(resp);
};

// Verify incoming request is valid. For now just check validity of source
VopInterface.prototype.dataFromValidSource = function(data){
	try{		
		if(data.getApplicationId() == APP_NAME_REGISTERED_AT_VOP){
			return true;
		}
	}catch(e){}
	return false;
};

VopInterface.prototype.processRequest = function(data){
	// RequestTypes defined in intentMappings.js
	switch(data.getRequestType()){
		case RequestTypes.launchRequest:
			this.processLaunchRequest(data);
			break;
		case RequestTypes.intentRequest: 
			this.processIntentRequest(data);
			break;
		case RequestTypes.sessionEndedRequest:
			this.processSessionEndedRequest(data);
			break;
	}
};

VopInterface.prototype.processLaunchRequest = function(data){
	// send help options
	var response  = this.buildSpeechletResponse(data.getAllSessionAttributes(),"Ask firefox something to do","",false);
	
	// session testing
	var tmp = data.session.attributes.foo==undefined?0:(parseInt(data.getSessionAttribute("foo"))+1);
	response.addSessionAttribute("foo",tmp);
	console.log(response);

	this.write(response);
};

VopInterface.prototype.processIntentRequest = function(data){
	// pass an pointer to this interface so that script handlers can manipulate session and interact with server if needed
	// send intent to router and content scripts
	broadCastAll(data);
};

VopInterface.prototype.processSessionEndedRequest = function(data){
	// remove any session data being maintained.
	var response = this.buildSpeechletResponse(data.getAllSessionAttributes(),"","",true);
	this.write(response);
};
