/**
* In this file the "param" refers to msg object received from the router.
*/

var globalTabNameMappings = {};

var createTab = function(param){
	console.log("creating tab");	
	var slots = param.getAllSlots();
	var wbname = getTargetSiteName(param);
	var tabparams = {};
	if(wbname !=undefined){
		tabparams = {url:craftUrl(wbname)};	
	}
	var newTab = browser.tabs.create(tabparams);
	newTab.then(
		function(tab){
			if(param.getSlot("nickName")!=undefined){
				renameTab(undefined,tab,param.getSlot("nickName").value);
			}
		},
		function(e){
			console.log(e);
		}
	);
};

// Make a tab active
var switchActiveTab = function(param){
	var targetTab = getTargetTabQuery(param);
	if(targetTab==undefined){
		handleInvalidParam(param);
		return;
	}
	var tabQuery = browser.tabs.query(targetTab);
	tabQuery.then(function(tabs){
		console.log(tabs);
		console.log("activating "+tabs[0].id);
		browser.tabs.update(tabs[0].id,{active:true});
	},function(e){
		console.log(e);
	});
}

//TODO prompt if many match. Also allow rename from tab titles
var renameTab = function(param,tab=undefined,nickName=undefined){
	// Incase tab and it's name already decided
	if(tab!=undefined && nickName!=undefined){
		addGlobalTabNameMapping(tab,nickName);
		console.log(globalTabNameMappings);
		return;
	}
	// Rename tab based on request
	var targetTab = getTargetTabQueryParamByTitle(param);
	if(targetTab==undefined){
		targetTab = getTargetTabQueryParamByUrl(param);
	}
	if(targetTab==undefined){
		handleInvalidParam(param);
		return;
	}
	var tabQuery = browser.tabs.query(targetTab);
	tabQuery.then(function(tabs){
		console.log("renaming "+tabs);
		addGlobalTabNameMapping(tabs[0],param.getSlot("nickName").value);
		console.log(globalTabNameMappings);
	},function(e){
		console.log(e);
	});
}

// Currently removes all by given sitename or active one in case sitename not given.
// TODO close by names, titles, ask if many match the pattern
var removeTab = function(param){
	console.log("removing tab");	
	var targetTab = getTargetTabQuery(param);
	if(targetTab==undefined){
		handleInvalidParam(param);
		return;
	}
	var tabQuery = browser.tabs.query(targetTab);
	tabQuery.then(function(tabs){
		if(tabs.length==0){
			handleInvalidParam(param);
			return;
		}
		console.log("removing "+tabs);
		browser.tabs.remove(tabs[0].id);
	},function(e){
		console.log(e);
	});
};


/**
* If you want tab query by suggested method.
* 1. check if one is there by nickname.
* 2. by tab title.
* 3. by tab number (index).
* 4. by url
* */
function getTargetTabQuery(param){
	var tryFuncs = [getTargetTabQueryParamByNickName,getTargetTabQueryParamByTitle,getTargetTabQueryParamByIndex,getTargetTabQueryParamByUrl];
	for(f of tryFuncs){
		var tabparams = f(param);
		if(tabparams!=undefined){
			console.log(tabparams);
			return tabparams;
		}
	}
	return undefined;
}

var getTargetTabQueryParamByNickName = function(param){
	if(param.getSlot("nickName")!=undefined){
		var nickName = param.getSlot("nickName").value;
		if(globalTabNameMappings[nickName]!=undefined){
			var tab=globalTabNameMappings[nickName];
			return {url:tab.url,index:tab.index,windowId:tab.windowId};
		}
	}
	return undefined;
};

var getTargetTabQueryParamByUrl = function(param){
	var wbname = getTargetSiteName(param);
	var targetTab={};
	if(wbname==undefined){
		targetTab.active=true;
	}
	else{
		targetTab.url="*://*."+wbname+"/*";
		console.log(targetTab.url);
	}
	return targetTab;
};

var getTargetTabQueryParamByIndex = function(param){
	var index = param.getSlot("tabNumber");
	if(index==undefined){return undefined;}
	try{
		index = parseInt(index.value);
		if(index<=0){
			return undefined;
		}
	}catch(e){
		return undefined;
	}
	return {currentWindow:true,index:index-1};
};

var getTargetTabQueryParamByTitle = function(param){
	var title = param.getSlot("tabTitle");
	if(title==undefined){return undefined;}
	return {title:title.value};
};

function craftUrl(siteName){
	return "https://"+siteName;
}

function getTargetSiteName(param){
	var wbname = param.getSlot("websiteName");
	if(wbname !=undefined){
		return wbname.value;	
	}
	return undefined;
}

function addGlobalTabNameMapping(tab,nickname){
	globalTabNameMappings[nickname] = tab;
}

function removeGlobalTabNameMapping(nickname){
	delete globalTabNameMappings[nickname];
}

// Clean up when a tab closes.
function removedTabCleaner(tab){
	for(key of Object.keys(globalTabNameMappings)){
		if(globalTabNameMappings[key].id == tab){
			removeGlobalTabNameMapping(key);
			break;
		}
	}
};

var handleInvalidParam = function(param){
	var resp = param.getVopConnection().buildSpeechletResponse(param.getAllSessionAttributes(),"Invalid target for action","",false);
	param.getVopConnection().write(resp);
};

browser.tabs.onRemoved.addListener(removedTabCleaner);
router.registerRoute("create_tab",createTab);
router.registerRoute("close_tab",removeTab);
router.registerRoute("rename_tab",renameTab);
router.registerRoute("activate_tab",switchActiveTab);
// browser.runtime.onMessage.addListener(msgRcv);