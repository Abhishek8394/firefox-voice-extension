/* For testing routing */
var eventTest = ["printRoutes","create_tab","search_intent","close_tab","foo_illegal"];
var ctr = 0;
/* --------------- */

// Maintain list of tabs that are already loaded, avoid loading content scripts twice.
var initializedTabs = {};

// Handle initialization of newly created tab. 
function createdTabHandler(tab){
	initializeTab(tab);
}
// Handle initialization of updated tab. 
function updatedTabHandler(tab){
	// for debugging -----
	// console.log("dispatching "+eventTest[ctr]);
	// var msg = {hello:"hi",eventType:eventTest[ctr]};
	// browser.runtime.sendMessage(msg);
	// ctr = (ctr+1)%eventTest.length;	
	//  -------------------
	initializeTab(tab);	
}

//handle closing  of tabs
function removedTabHandler(tab){
	if(initializedTabs[tab.id]!=undefined){
		delete initializedTabs[tab.id];
	}
}

// Load Content scripts and other stuff to prepare for voice control
function initializeTab(t){
	if(initializedTabs[t.id]!=undefined){		
		initializedTabs[t.id] = true;
		// console.log("collision");
		return;
	}
	//TODO load content scripts
	browser.tabs.executeScript(t.id,{file:browser.extension.getURL("/browser_action/contentSample.js")});
	//for debugging-----------------
	// var tablist = browser.tabs.query({});
	// tablist.then(function(tabs){
	// 	for(f of tabs){
	// 		browser.tabs.sendMessage(f.id,{hello:"hi",eventType:eventTest[ctr],tid:f.id});
	// 	}
	// },tabQueryErrorHandler);
	// ------------------------------
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
	wbsock.onmessage = function(event){
		console.log(event.data);
	}
	wbsock.onopen = function(event){	
		wbsock.send("hello");
		console.log("writing socket");
	};
	console.log("socket defined");
	logMessage("socket defined");

}

function globalInit(){	
	browser.tabs.onCreated.addListener(createdTabHandler);
	browser.tabs.onUpdated.addListener(updatedTabHandler);
	browser.tabs.onRemoved.addListener(removedTabHandler);
	initializeExistingTabs();
	connectBackend();
}

globalInit();