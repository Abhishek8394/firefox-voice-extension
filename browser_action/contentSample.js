function foo(msg){
	console.log("foo got it");
	console.log(msg);
}
console.log("foo");
browser.runtime.onMessage.addListener(foo);
document.addEventListener("click",function(e){
	if(e.target.classList.contains("ntab")){
		browser.tabs.create({url:"https://www.google.com"});
	}
});