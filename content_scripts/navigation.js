var navSession = new Session();
const NavConstants = {
	LINKS_LIST_KEY:"list_of_links",
	BASIC_SCROLL_KEY : "basicScroll",
	LINK_KEY : "hyperlink",
	BROWSER_NAV_KEY : "browserNav",
	MSG_SESSION_LINK_INDEX_KEY : "nav_hyperlink_index",
	USER_REPLY_KEY : "navReply"
};
var NavManager = function(){
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
	var candidates=[];
	if(link!=undefined){		
		var userQuery = new RegExp(link.trim(),"i");
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
		var prevSet = navSession.get(NavConstants.LINKS_LIST_KEY);
		if(prevSet!=undefined){
			for(i of prevSet){
				unHighlightElement(i);
			}
		}
		navSession.add(NavConstants.LINKS_LIST_KEY,candidates);
		msg.removeSessionAttribute(NavConstants.MSG_SESSION_LINK_INDEX_KEY);
	}
	else{
		if(navSession.get(NavConstants.LINKS_LIST_KEY)!=undefined){
			candidates = navSession.get(NavConstants.LINKS_LIST_KEY);
		}
	}
	if(candidates.length>0){		
		var handlers = this.clickHandlersGenerator();
		ElementPicker2(msg,candidates,NavConstants.MSG_SESSION_LINK_INDEX_KEY,NavConstants.USER_REPLY_KEY,
			handlers,"Click on this link?","Answer in yes or no",
			shouldHighlight=true,highlightColor="green");
	}
};
NavManager.prototype.clickHandlersGenerator = function(){
	var handlers = [];
	var noResponses = ["no","nope"];
	var cancelResponses = ["cancel"];
	var yesResponses = ["yes","click","yep","yeah"];
	var noHandler = function(msg,elementList,currIndex,userReply,direction=1){
		highlightElement(elementList[currIndex],"orange",false);
		currIndex = (currIndex + (direction*1))%elementList.length;
		console.log(currIndex);
		highlightElement(elementList[currIndex],"green");
		addSessionAttribute(msg,NavConstants.MSG_SESSION_LINK_INDEX_KEY,currIndex);
		console.log(msg);
		sendMessageToVop(msg,"Click on this link?","Answer in a yes or no");
	};
	var cancelHandler = function(msg,elementList,currIndex,userReply){
		for(i of elementList){
			unHighlightElement(i);
		}
		msg.removeSessionAttribute(NavConstants.MSG_SESSION_LINK_INDEX_KEY);
		sendMessageToVop(msg,"ok","ok");
	};
	var yesHandler = function(msg,elementList,currIndex,userReply){
		cancelHandler(msg,elementList,currIndex,userReply);
		elementList[currIndex].click();
	};
	handlers.push({name:noResponses,handler:noHandler});
	handlers.push({name:cancelResponses,handler:cancelHandler});
	handlers.push({name:yesResponses,handler:yesHandler});
	return handlers;
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
	var action = getMsgSlotValue(msg,NavConstants.BASIC_SCROLL_KEY);
	var link = getMsgSlotValue(msg,NavConstants.LINK_KEY);
	var browserNav = getMsgSlotValue(msg,NavConstants.BROWSER_NAV_KEY);
	var userReply = getMsgSlotValue(msg,NavConstants.USER_REPLY_KEY);
	if(browserNav!=undefined){
		navMan.handleBrowserNavigation(msg,browserNav);
		return;	
	}
	if(action!=undefined){
		// is a scroll command.
		navMan.handleScroll(msg,action);
	}
	if(link!=undefined || userReply!=undefined){
		navMan.clickLink(msg,link);
	}
};
router.registerRoute("nav_intent",navHandler);