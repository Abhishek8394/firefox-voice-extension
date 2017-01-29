/* For testing routing */
var eventTest = ["search_intent","create_tab","printRoutes","close_tab","foo_illegal"];
var ctr = 0;
/* --------------- */

// Maintain list of tabs that are already loaded, avoid loading content scripts twice.
var initializedTabs = {};

// Handle initialization of newly created tab. 
function createdTabHandler(tab){
	// // for debugging -----
	// console.log("dispatching "+eventTest[ctr]);
	// var msg = {hello:"hi",request:{intent:{name:eventTest[ctr]}}};
	// broadCastAll(msg);
	// ctr = (ctr+1)%eventTest.length;	
	// //  -------------------
}
// Handle initialization of updated tab. 
function updatedTabHandler(tab){
	initializeTab(tab);	
}

//handle closing  of tabs
function removedTabHandler(tab){
	if(initializedTabs[tab]!=undefined){
		delete initializedTabs[tab];
	}
}

// Load Content scripts and other stuff to prepare for voice control
function initializeTab(t){
	if(initializedTabs[t.id]!=undefined){		
		// initializedTabs[t.id] = true;
		// console.log("collision");
		return;
	}
	//TODO load content scripts
	loadContentScripts(t);		
}

function loadContentScripts(tab){	
	// contentScriptsToLoad defined in intentMappings.js	
	for(cs of contentScriptsToLoad){		
		var injectScript = browser.tabs.executeScript(tab.id,{file:browser.extension.getURL(cs)});
		injectScript.then(function(obj){
			// console.log("successfully injected "+cs+" in "+tab.id);
		},function(e){
			console.log("error injecting script "+cs+" in " + tab.id);
		});
	}
}
// broadcast event to background scripts as well as content scripts
function broadCastAll(msg){
	broadcastToBackgroundScripts(msg);
	broadcastToContentScripts(msg);
}
function broadcastToContentScripts(msg){
	var tablist = browser.tabs.query({});
	tablist.then(function(tabs){
		for(f of tabs){
			browser.tabs.sendMessage(f.id,msg.getFormattedForContentScript());
		}
	},tabQueryErrorHandler);
}
function broadcastToBackgroundScripts(msg){
	// browser.runtime.sendMessage(msg);
	// browser.runtime.sendMessage does not work anymore. Workaround.
	msgRcv(msg);
}

// Perform initialization of all existing tabs
function tabQueryHandler(tabs){
	for(var t of tabs){
		initializeTab(t);
	}
}

//Error handler for tabs.query
function tabQueryErrorHandler(e){
	console.log(e);
}

// Initialize existing tabs
function initializeExistingTabs(){
	var tablist = browser.tabs.query({});
	tablist.then(tabQueryHandler,tabQueryErrorHandler);
}

function connectBackend(){	
	var wbsock = new WebSocket("ws://127.0.0.1:8080/"+"hi");
	wbsock.onerror = function(err){
		console.log("err");
	};
	// wbsock.onmessage = function(event){
	// 	console.log(event.data);
	// }
	wbsock.onopen = function(event){	
		// wbsock.send("hello");
		wbsockVOPIntf = new VopInterface(wbsock);
		wbsockVOPIntf.establishConnection();
		console.log("writing socket");
	};
	console.log("socket defined");
	logMessage("socket defined");

}

function msgFromContentScript(msg){
	// console.log("rcvd msg from content script");
	// console.log(msg);
	if(msg.forVop){
		wbsockVOPIntf.quickReply(msg.data.sessionAttributes,msg.data.outputText,msg.data.repromptText,msg.data.shouldEndSession);
	}
}

function globalInit(){	
	browser.tabs.onCreated.addListener(createdTabHandler);
	browser.tabs.onUpdated.addListener(updatedTabHandler);
	browser.tabs.onRemoved.addListener(removedTabHandler);
	// Receive messages from content scripts
	router.registerRoute("msg_from_local_content_script",msgFromContentScript);
	// In case need for long lived connections realized, go this path.
		// browser.runtime.onConnect.addListener(onContentScriptConnect);
	initializeExistingTabs();
	connectBackend();
}

globalInit();
var wbsockVOPIntf;