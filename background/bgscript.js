/* For testing routing */
var eventTest = ["search_intent","create_tab","printRoutes","close_tab","foo_illegal"];
var ctr = 0;
/* --------------- */

var webServerUrl = "ws://127.0.0.1:8080/"+"hi";
var socketReconnectionInterval = 2000;
console.log(navigator);

// Maintain list of tabs that are already loaded, avoid loading content scripts twice.
var initializedTabs = new InitializedTabsRegistry();
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
function updatedTabHandler(tabId,changeInfo,tab){
	console.log(changeInfo);
	// Init with scripts only after tab completely loaded.
	if(changeInfo.status=="complete"){		
		initializeTab(tab);	
	}
}

//handle closing  of tabs
function removedTabHandler(tab){
	if(initializedTabs[tab]!=undefined){
		delete initializedTabs[tab];
	}
}

// Load Content scripts and other stuff to prepare for voice control
function initializeTab(t){
	console.log("init call on " + t.url);
	// if(!initializedTabs.hasTab(t)){		
		//TODO load content scripts
		// Load scripts when you cannot establish connection to a tab's content scripts. This is to prevent
		// loading multiple times in same tab.
		var scriptExistanceChecker = browser.tabs.sendMessage(t.id,{eventType:"ping",msg:"ping"});
		scriptExistanceChecker.then(function(response){
			console.log(response);
			if(response==undefined){
				loadContentScripts(t);
				initializedTabs.addEntry(t);
			}
		},function(e){	
			console.log(e);
			console.log("loading scripts. in "+t.url);
			loadContentScripts(t);
			initializedTabs.addEntry(t);
		});
		// loadMainContentScript(t);	
		// initializedTabs[t.id] = t;			
	// }
}

function loadMainContentScript(tab){
	var injectScript = browser.tabs.executeScript(tab.id,{file:browser.extension.getURL(MyConstants.mainContentScript)});
	injectScript.then(function(obj){
		// console.log("successfully injected "+cs+" in "+tab.id);
	},function(e){
		console.log("error injecting script "+MyConstants.mainContentScript+" in " + tab.id);
	});
}

function loadContentScripts(tab){	
	// contentScriptsToLoad defined in intentMappings.js	
	for(cs of contentScriptsToLoad){		
		var injectScript = browser.tabs.executeScript(tab.id,{file:browser.extension.getURL(cs)});
		injectScript.then(function(obj){
			// console.log("successfully injected "+cs+" in "+tab.id);
		},function(e){
			console.log("error injecting script "+cs+" in " + tab.id);
			// console.log(e);
		});
	}
}
// broadcast event to background scripts as well as content scripts
function broadCastAll(msg){
	broadcastToBackgroundScripts(msg);
	broadcastToContentScripts(msg);
}
function broadcastToContentScripts(msg){
	var browserTabQuery={};
	// if(msg.getIntentName()==FORM_FILLER_INTENT){
	// 	console.log("viola!");
	// 	browserTabQuery = {currentWindow:true,active:true};
	// }
	var tablist = browser.tabs.query(browserTabQuery);
	tablist.then(function(tabs){
		for(f of tabs){
			var f = browser.tabs.sendMessage(f.id,msg.getFormattedForContentScript());
			f.then().catch(function(e){
				console.log("error transmitting to content script");
				console.log(e);
			});
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
	console.log("tab query error");
	console.log(e);
}

// Initialize existing tabs
function initializeExistingTabs(){
	var tablist = browser.tabs.query({});
	tablist.then(tabQueryHandler,tabQueryErrorHandler);
}

function connectBackend(){	
	console.log("calling connect backend");
	var wbsock = new WebSocket(webServerUrl);
	wbsock.onerror = function(err){
		console.log("err");
		setTimeout(connectBackend, socketReconnectionInterval);
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

// When a browser tab asks for content scripts.
function contentScriptsLoader(msg){
	console.log(msg.tab);
	console.log("requested cs'");
	loadContentScripts(msg.tab);
}

function globalInit(){	
	browser.tabs.onCreated.addListener(createdTabHandler);
	browser.tabs.onUpdated.addListener(updatedTabHandler);
	browser.tabs.onRemoved.addListener(removedTabHandler);
	// Receive messages from content scripts
	router.registerRoute("msg_from_local_content_script",msgFromContentScript);
	// router.registerRoute("need_content_scripts",contentScriptsLoader);
	// In case need for long lived connections realized, go this path.
		// browser.runtime.onConnect.addListener(onContentScriptConnect);
	initializeExistingTabs();
	connectBackend();
}

globalInit();
var wbsockVOPIntf;