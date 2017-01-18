// Handle initialization of newly created tab. 
function newTabHandler(tab){
	// console.log(tab);
	initializeTab(tab);	
}

// Load Content scripts and other stuff to prepare for voice control
function initializeTab(t){
	//TODO load content scripts
	// browser.tabs.update(t.id,{url:"https://www.google.com"});
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
	browser.tabs.onCreated.addListener(newTabHandler);
	initializeExistingTabs();
	connectBackend();
}

globalInit();