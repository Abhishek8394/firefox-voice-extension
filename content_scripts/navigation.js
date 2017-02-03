var NavManager = function(){
	this.BASIC_SCROLL_KEY = "basicScroll";
	this.LINK_KEY = "hyperlink";
	this.BROWSER_NAV_KEY = "browserNav";
	this.defaultScrollX = 100;
	this.defaultScrollY = 100;
	this.hyperlinks=undefined;
};
NavManager.prototype.handleScroll = function(msg,action){
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
	// console.log(scrollTarget);
	scrollTarget.scrollBy(newScrollY,newScrollY);
};

// Click on a link
NavManager.prototype.clickLink = function(msg,link){
	var ahrefs = document.getElementsByTagName("a");
	var userQuery = new RegExp(link.trim(),"i");
	var candidates=[];
	for(i of ahrefs){
		var linkDisplayText = getInnerMostText(i);
		// Some links have useful info in title
		if(i.attributes.title!=undefined){
			linkDisplayText.push(i.attributes.title);
		}
		linkDisplayText = linkDisplayText.join(" ");
		if(userQuery.test(linkDisplayText)){
			candidates.push(i);
		}
	}
	for(c of candidates){
		highlightElement(c,"orange");
	}
	candidates[0].click();
};

NavManager.prototype.handleBrowserNavigation = function(msg,userInput){
	var forward=["forward"];
	var back=["back"];
	if(isAValidCommand(forward,userInput)){
		window.history.go(1);
		return;
	}
	if(isAValidCommand(back,userInput)){
		window.history.go(-1);
		return;
	}
};

function navHandler(msg){
	console.log(isActiveTab());
	if(!isActiveTab()){
		return;
	}
	var navMan = new NavManager(); 
	msg = new VopMessage(msg,undefined);
	var action = getMsgSlotValue(msg,navMan.BASIC_SCROLL_KEY);
	var link = getMsgSlotValue(msg,navMan.LINK_KEY);
	var browserNav = getMsgSlotValue(msg,navMan.BROWSER_NAV_KEY);
	if(browserNav!=undefined){
		navMan.handleBrowserNavigation(msg,browserNav);
		return;	
	}
	if(action!=undefined){
		// is a scroll command.
		navMan.handleScroll(msg,action);
	}
	if(link!=undefined){
		navMan.clickLink(msg,link);
	}
};
router.registerRoute("nav_intent",navHandler);