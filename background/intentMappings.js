// each entry => "intent delivered by voice engine": "scriptName"
var intent2script = {
	"create_tab":"tabManager",
	"close_tab":"tabManager",
	"search_intent":"search"
};

// Necessary scripts to load for each tab
var contentScriptsToLoad = ["/background/sessions.js","/background/router.js","/content_scripts/backendInterface.js","/browser_action/contentSample.js"];