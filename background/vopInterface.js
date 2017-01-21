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
	this.write({"hi":"hello"});
};

VopInterface.prototype.write = function(msgObj){
	if(this.socket!=undefined){
		var data = JSON.stringify(msgObj);
		this.socket.send(data);
	}
}

VopInterface.prototype.readEventHandler = function(e){
	console.log(JSON.parse(e.data));
}

VopInterface.prototype.appNamePacket = function(){
	return {appname:APP_NAME_REGISTERED_AT_VOP};
}