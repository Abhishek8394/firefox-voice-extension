// Handle initialization of newly created tab. 
function newTabHandler(tab){
	// console.log(tab);
	initializeTab(tab);	
}

// Load Content scripts and other stuff to prepare for voice control
function initializeTab(t){
	//TODO load content scripts
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

browser.tabs.onCreated.addListener(newTabHandler);
initializeExistingTabs();