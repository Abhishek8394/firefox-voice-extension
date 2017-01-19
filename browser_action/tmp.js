//sample for scripts wanting to interface but are not loaded as content scripts by background.

function foto(msg){
	console.log("tmp foo got it");
	console.log(msg);
}
console.log("foo tmp");
document.addEventListener("click",function(e){
	if(e.target.classList.contains("ntab")){
		browser.tabs.create({url:"https://www.google.com"});
	}	
});
router.registerRoute("search_intent",foto);