/**
* Currently works with google only
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
	browser.tabs.create({url:searchUrl});
}
router.registerRoute("search_intent",search);