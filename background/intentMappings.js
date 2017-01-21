// each entry => "intent delivered by voice engine": "scriptName"
const intent2script = {
	"create_tab":"tabManager",
	"close_tab":"tabManager",
	"search_intent":"search"
};
const APP_NAME_REGISTERED_AT_VOP = "firefox-extension";
// Necessary scripts to load for each tab
const contentScriptsToLoad = ["/background/sessions.js","/background/router.js","/content_scripts/backendInterface.js","/browser_action/contentSample.js"];
const AppConnectionStates = {
	UNCONNECTED:1,
	REGISTERING:2,
	CONNECTED:3
};