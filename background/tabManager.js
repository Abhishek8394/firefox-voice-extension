var createTab = function(param){
	console.log("creating tab");	
	var slots = param.getAllSlots();
	var wbname = getTargetSiteName(param);
	var tabparams = {};
	if(wbname !=undefined){
		tabparams = {url:craftUrl(wbname)};	
	}
	browser.tabs.create(tabparams);
};

var renameTab = function(param){
	// TODO assign names to tabs and refer to them with those names.
}

// Currently removes all by given sitename or active one in case sitename not given.
// TODO close by names, titles, ask if many match the pattern
var removeTab = function(param){
	console.log("removing tab");
	var wbname = getTargetSiteName(param);
	var targetTab={};
	if(wbname==undefined){
		// close active tab
		console.log("closing active");
		targetTab.active=true;
	}
	else{
		targetTab.url="*://*."+wbname+"/*";
		console.log(targetTab.url);
	}
	var tabQuery = browser.tabs.query(targetTab);
	tabQuery.then(function(tabs){
		console.log("removing "+tabs);
		browser.tabs.remove(tabs[0].id);
	},function(e){
		console.log(e);
	});
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

router.registerRoute("create_tab",createTab);
router.registerRoute("close_tab",removeTab);
// router.registerRoute("rename_tab",removeTab);
// browser.runtime.onMessage.addListener(msgRcv);