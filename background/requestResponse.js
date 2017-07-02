var SessionAttribute = function(k,v){
	this.name = k;
	this.value = v;
};

function getOutputSpeech(outputType,output){
	if(outputType==ResponseTypes.ssml){
		return {type:outputType,ssml:output};
	}
	return {type:outputType,text:output};
};

function getReprompt(repromptType,repromptText){
	var outputSpeech = getOutputSpeech(repromptType,repromptText);
	return {outputSpeech:outputSpeech};
}

var AppResponse = function(outputType,output,repromptType,repromptText,shouldEndSession){
	this.outputSpeech = getOutputSpeech(outputType,output);
	this.reprompt = getReprompt(repromptType,repromptText);
	this.shouldEndSession = shouldEndSession;
}

var SpeechletResponse = function(sessionAttributes,outputType,output,repromptType,repromptText,shouldEndSession){
	this.sessionAttributes = sessionAttributes;
	if(sessionAttributes==undefined){
		this.sessionAttributes={};
	}
	this.response = new AppResponse(outputType,output,repromptType,repromptText,shouldEndSession);
};
SpeechletResponse.prototype.addSessionAttribute = function(key,value){
	this.sessionAttributes[key] = new SessionAttribute(key,value);
};
SpeechletResponse.prototype.getSessionAttribute = function(key,value){
	return this.sessionAttributes[key];
};

/**
* Accessor methods for object received from VOP
*/
var VopMessage = function(vopData,vopConn){
	// this.data = vopData; // just in case for fields added and someone needs them.
	this.session = vopData.session;
	this.request = vopData.request;
	this.vopConn = vopConn;
};

VopMessage.prototype.getVopConnection = function(){
	return this.vopConn;
};

// Session object getters
VopMessage.prototype.getSession = function(){
	return this.session;
};

VopMessage.prototype.getApplication = function(){
	return this.getSession().application;
};

VopMessage.prototype.getApplicationId = function(){
	return this.getApplication().applicationId;
};

VopMessage.prototype.getAllSessionAttributes = function(){
	return this.getSession().attributes;
};

VopMessage.prototype.getSessionAttribute = function(key){
	var tmp = this.getAllSessionAttributes()[key];
	return tmp==undefined?undefined:tmp.value;
};

VopMessage.prototype.removeSessionAttribute = function(key){
	if(key==undefined || this.getAllSessionAttributes[key]==undefined){
		return;
	}
	delete this.getAllSessionAttributes[key];
};

VopMessage.prototype.isNewSession = function(){
	return this.getSession().isNew;
};

VopMessage.prototype.getSessionId = function(){
	return this.getSession().sessionId;
}

VopMessage.prototype.getUser = function(){
	return this.getSession().sessionUser;
};

// Request Object getters
VopMessage.prototype.getRequest = function(){
	return this.request;
};

VopMessage.prototype.getRequestType = function(){
	return this.getRequest().type;
};

VopMessage.prototype.getRequestId = function(){
	return this.getRequest().requestId;
};

VopMessage.prototype.getTimeStamp = function(){
	return this.getRequest().timestamp;
};

VopMessage.prototype.getIntent = function(){
	return this.getRequest().intent;
};

VopMessage.prototype.getIntentName = function(){
	if(this.getIntent()==undefined){return undefined;}
	return this.getIntent().name;
};

VopMessage.prototype.getAllSlots = function(){
	if(this.getIntent()==undefined){return undefined;}
	return this.getIntent().slots;
};

VopMessage.prototype.getSlot = function(key){
	if(this.getAllSlots()==undefined){return undefined;}
	return this.getAllSlots()[key];
};

VopMessage.prototype.addSlot = function(key,slot){
	this.request.intent.slots[key] = slot;
};

// For uncloneable error when passing vopmessage to content script
VopMessage.prototype.getFormattedForContentScript = function(){
	return {
		session:this.getSession(),
		request:this.getRequest()
	};
};

VopMessage.reconstructFromContentScript = function(msg){
	var session_tmp = msg.session;
};