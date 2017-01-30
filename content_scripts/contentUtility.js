function highlightElement(element){
	// console.log(element.position());
	// var highLighter = document.createElement("div");
	// highLighter.style.position = "absolute";
	// highLighter.style.left = element.style.left;
	// highLighter.style.top = element.style.top;
	// highLighter.style.width = element.style.width;
	// highLighter.style.height = element.style.height;
	// highLighter.style.border = "3 px solid red";	
	// console.log(highLighter);
	// element.appendChild(highLighter);
	var oldBorder = element.style.border;
	element.style.border = "3px solid red";
	return oldBorder;
}

function unHighlightElement(element){
	if(element==undefined){
		return;
	}
	// element.removeChild(highlightElement);
	element.style.border = "transparent";
}