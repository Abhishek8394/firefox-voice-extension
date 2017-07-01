/**
* Currently works with google, duckduckgo, yahoo only
*/
var search = function(params){
	console.log("performing search");
	var searchEngineSlot = "searchEngine";
	var searchQuerySlot = "searchQuery";
	var searchEngine = params.getSlot(searchEngineSlot)==undefined?"google":params.getSlot(searchEngineSlot).value;
	var searchEngineParts = searchEngine.split(".");
	if(searchEngineParts[searchEngineParts.length-1].length<2 || searchEngineParts[searchEngineParts.length-1].length>3){
		searchEngine+=".com";
	}
	var searchQuery = params.getSlot(searchQuerySlot)==undefined?"":(encodeURIComponent(params.getSlot(searchQuerySlot).value));
	if(searchEngine.indexOf("google")>=0){
		searchQuery= "/#q=" + searchQuery;
	}
	else{
		searchQuery = "/?q=" + searchQuery;
	}
	var searchUrl = "https://"+ searchEngine + searchQuery;
	// check if currently on the searchEngine's page. If yes and is not displaying a query result, then perform query on this one, else open a new tab. 
	var currentTab = browser.tabs.query({active:true});
	currentTab.then(function(tabs){
		// query executed successfully
		var loadNew = true;
		for(tab of tabs){
			// console.log(tab);
			if(tab.url.indexOf(searchEngine)>-1 && tab.url.indexOf('q=')==-1){
				// console.log('match found');
				// found the tab that we can use. update its url to perform the query user requested
				var updateTab = browser.tabs.update(tab.id,{url:searchUrl});
				updateTab.then(function(){}, function(error){
					// updating the tab url failed. create a new tab.
					browser.tabs.create({url:searchUrl});
					// console.log('error updating');		
				});
				loadNew = false;
				break;
			}
		}
		if(loadNew){
			// no matching tabs found or found but were already used to display something.
			// console.log('loop failure');
			browser.tabs.create({url:searchUrl});
		}
	}, function(error){		
		// Query failed
		// console.log('query failure');
		browser.tabs.create({url:searchUrl});
	});
}
router.registerRoute("search_intent",search);