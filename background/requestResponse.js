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