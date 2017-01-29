function foo(msg){
	console.log("foo got it");
	console.log(msg);
}
router.registerRoute("search_intent",foo);
document.addEventListener("click",function(e){
	if(e.target.classList.contains("ntab")){
		browser.tabs.create({url:"https://www.google.com"});
	}
	console.log(session.get("lastSentBy"));	
	informBackground({clicked:e.target.innerText.substring(0,4)});
});