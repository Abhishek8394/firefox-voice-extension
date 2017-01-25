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
	var m1=this.buildSpeechletResponse(undefined,"hello!!","hello again!",false);
	var m2 = this.buildSpeechletResponse(undefined,"world!!","world again!",false);
	m1.addSessionAttribute("key1","value1");
	m2.addSessionAttribute("key2",{a:1,b:2});
	console.log(m1);
	this.write(m1);
	this.write(m2);
};

VopInterface.prototype.write = function(msgObj){
	if(this.socket!=undefined){
		var data = JSON.stringify(msgObj);
		this.socket.send(data);
		this.socket.send("\r\n");
	}
};

VopInterface.prototype.readEventHandler = function(e){
	console.log(JSON.parse(e.data));
	return JSON.parse(e.data);
};

VopInterface.prototype.appNamePacket = function(){
	// App ID sort of registered at VOP. Defined in intentMapping.js
	return {appname:APP_NAME_REGISTERED_AT_VOP};
};

VopInterface.prototype.buildSpeechletResponse = function(sessionAttributes,output,repromptText,shouldEndSession){
	return new SpeechletResponse(sessionAttributes,ResponseTypes.plainText,output,ResponseTypes.plainText,repromptText,shouldEndSession);
};