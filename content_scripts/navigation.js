var NavManager = function(){
	this.BASIC_SCROLL_KEY = "basicScroll";
	this.defaultScrollX = 100;
	this.defaultScrollY = 100;
};
NavManager.prototype.handleScroll = function(action,msg){
	if(this.isScrollUpCommand(action)){
		this.scrollUp(msg);
	}
	else if(this.isScrollDownCommand(action)){
		this.scrollDown(msg);
	}
	else if(this.isScrollLeftCommand(action)){
		this.scrollLeft(msg);
	}
	else if(this.isScrollRightCommand(action)){
		this.scrollRight(msg);
	}
};
NavManager.prototype.scrollUp = function(msg){
	this.scroller(0,-1);
};
NavManager.prototype.scrollDown = function(msg){
	this.scroller(0,1);
};
NavManager.prototype.scrollLeft = function(msg){
	this.scroller(-1,0);
};
NavManager.prototype.scrollRight = function(msg){
	this.scroller(1,0);
};
NavManager.prototype.isScrollUpCommand = function(action) {
	var upCommands = ["up","high"];
	return isAValidCommand(upCommands,action);
};
NavManager.prototype.isScrollDownCommand = function(action) {
	var downCommands = ["down","low"];
	return isAValidCommand(downCommands,action);
};
NavManager.prototype.isScrollLeftCommand = function(action) {
	var leftCommands = ["left"];
	return isAValidCommand(leftCommands,action);
};
NavManager.prototype.isScrollRightCommand = function(action) {
	var rightCommands = ["right"];
	return isAValidCommand(rightCommands,action);
};
/**
* dir: 1 for moving in that axis' +ve direction, -1 for -ve direction, 0 for staying put. 
* xDir=1 => scroll right, xDir=-1 => scroll left. 
* yDir=1 => scroll down, yDir=-1 => scroll up
**/
NavManager.prototype.scroller = function(xDir,yDir,xVal=undefined,yVal=undefined){
	xVal = xVal==undefined?this.defaultScrollX:xVal;
	yVal = yVal==undefined?this.defaultScrollY:yVal;
	var newScrollX = xDir*xVal;
	var newScrollY = yDir*yVal;
	var scrollTarget = globalSession.get(globalConstants.SCROLL_TARGET);
	console.log(scrollTarget);
	scrollTarget.scrollBy(newScrollY,newScrollY);
};
function navHandler(msg){
	console.log(isActiveTab());
	if(!isActiveTab()){
		return;
	}
	var navMan = new NavManager(); 
	msg = new VopMessage(msg,undefined);
	var action = msg.getSlot(navMan.BASIC_SCROLL_KEY);
	action=action==undefined?undefined:action.value;
	if(action!=undefined){
		// is a scroll command.
		navMan.handleScroll(action,msg);
	}

};
router.registerRoute("nav_intent",navHandler);