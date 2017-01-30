/**
* Keep a track of tabs that already have their content scripts loaded.
* Tab is considered uninitialized if it's url has changes since that requires reloading of content script.
*/
var InitializedTabsRegistry = function(){
	this.registry = {};
};

// Create a unique key to identify a tab.
InitializedTabsRegistry.prototype.generateKey = function(tab){
	return tab.windowId+":"+tab.id;
};

// Add a tab that is getting content scripts loaded.
InitializedTabsRegistry.prototype.addEntry = function(tab){
	var key = this.generateKey(tab);
	this.registry[key] = tab;
};

// Remove tab entries based on window id and tab id. Doesn't consider urls.
InitializedTabsRegistry.prototype.removeEntry = function(tab){
	var key = this.generateKey(tab);
	if(this.registry[key]!=undefined){
		delete this.registry[key];
	}
};

InitializedTabsRegistry.prototype.hasTab = function(tab){
	var key = this.generateKey(tab);
	// Debugging
	// if(this.registry[key]!=undefined){		
	// 	console.log(domainUrlExtractor(this.registry[key].url) + " " + domainUrlExtractor(tab.url));
	// }
	 return this.registry[key]!=undefined && domainUrlExtractor(this.registry[key].url)==domainUrlExtractor(tab.url);
};

//return domain Name from a url. Returns blank if not found
function domainUrlExtractor(url){
	var dmn = "";
	if(url.indexOf("://")>-1){
		dmn = url.split('/')[2];
	}
	else{
		dmn = dmn.split('/')[0];
	}
	dmn = dmn.split(":")[0];

	return dmn;
}
