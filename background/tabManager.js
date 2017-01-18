var createTab = function(param){
	console.log("create tab");	
};
var removeTab = function(param){
	console.log("remove tab");
};
router.registerRoute("create_tab",createTab);
router.registerRoute("close_tab",removeTab);
// browser.runtime.onMessage.addListener(msgRcv);