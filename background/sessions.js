//Not thread safe. Ocassionally falls in inconsistent state.

var Session = function(){
	this.session={};
	// Add a value to session. key=>string, value=>anyObject
	this.add = function(key,value){
		this.session[key] = value;
	};
	// Remove value from session. key=>string
	this.remove = function(key){
		if(session[key]!=undefined){
			delete this.session[key];
		}
	};	

	// Return object stored at "key" in session, undefined if key not found. 
	this.get = function(key){
		return this.session[key];
	};
	// Clear entire session. TODO: Maybe restrict to privileged scripts 
	this.clear = function(){
		this.session = {};
	};
	this.print = function(){
		console.log(this.session);
	};
};
var session = new Session();