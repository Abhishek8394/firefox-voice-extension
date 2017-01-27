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
	}
};

VopInterface.prototype.readEventHandler = function(e){
	var data = JSON.parse(e.data);
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

// Verify incoming request is valid. For now just check validity of source
VopInterface.prototype.dataFromValidSource = function(data){
	try{		
		if(data.session.application.applicationId == APP_NAME_REGISTERED_AT_VOP){
			return true;
		}
	}catch(e){}
	return false;
};

VopInterface.prototype.processRequest = function(data){
	// RequestTypes defined in intentMappings.js
	switch(data.request.type){
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
	var response  = this.buildSpeechletResponse(data.session.attributes,"Ask firefox something to do","",false);
	
	// session testing
	var tmp = data.session.attributes.foo==undefined?0:(parseInt(data.session.attributes.foo.value)+1);
	response.addSessionAttribute("foo",tmp);
	console.log(response);

	this.write(response);
};

VopInterface.prototype.processIntentRequest = function(data){
	// send intent to router
	data.vopInterface = this;
	broadCastAll(data);
};

VopInterface.prototype.processSessionEndedRequest = function(data){
	// remove any session data being maintained.
	var response = this.buildSpeechletResponse(data.session.attributes,"","",true);
	this.write(response);
};