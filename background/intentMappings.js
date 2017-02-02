// each entry => "intent delivered by voice engine": "scriptName"
const intent2script = {
	"create_tab":"tabManager",
	"close_tab":"tabManager",
	"search_intent":"search"
};
const APP_NAME_REGISTERED_AT_VOP = "firefox-extension";
const FORM_FILLER_INTENT = "form_input";
const AppConnectionStates = {
	UNCONNECTED:1,
	REGISTERING:2,
	CONNECTED:3
};

const ResponseTypes = {
	plainText:"PlainText",
	ssml:"SSML"
};

const RequestTypes = {
	launchRequest: "LaunchRequest",
	intentRequest: "IntentRequest",
	sessionEndedRequest: "SessionEndedRequest"
};
// Necessary scripts to load for each tab
const contentScriptsToLoad = [
	"/content_scripts/jquery.js",
	"/background/sessions.js",
	"/background/router.js",
	"/background/requestResponse.js",
	"/background/vopInterface.js",
	"/content_scripts/backendInterface.js",
	"/content_scripts/contentUtility.js",
	"/content_scripts/navigation.js",
	"/browser_action/contentSample.js",
	"/content_scripts/videoController.js",
	"/content_scripts/FormFiller.js"
];

const cssToLoad = [
	"/content_css/foxy.css"
];