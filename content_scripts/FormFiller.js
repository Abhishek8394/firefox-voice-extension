var formFillerSession = new Session();

// Get all forms in a page
function captureAllForms(){
	var forms = $('form:visible');
	if(forms!=undefined && forms.length>0){
		formFillerSession.add("all_forms",forms);
	}
	console.log(forms);
	if(forms.length==1){
		formFillerSession.add('current_form',forms[0]);
	}
	formFillerSession.add("asking_form_index",0);
}

// Interact with user to decide on a form to fill up.
// TODO cancel request.
function pickForm(msg){
	var forms = formFillerSession.get("all_forms");
	var currIndex = formFillerSession.get("asking_form_index");
	var userChosenIndex = msg.getSlot("chooseFormIndex");
	var yesHandler = function(msg,userReply){
		console.log("said yes");
		formFillerSession.add("current_form",forms[currIndex]);
		formInputHandler(msg);
	};
	var noHandler = function(msg,userReply){
		unHighlightElement(forms[currIndex]);
		currIndex = (currIndex+1)%forms.length;
		addSessionAttribute(msg,"asking_form",currIndex);
		formFillerSession.add('asking_form_index',currIndex);
		highlightElement(forms[currIndex]);
		sendMessageToVop(msg,"Perform input on form number "+(currIndex+1)+"?","Answer in a yes or no");
	};
	var formReplyHandlers = [
		{name:"yes",handler:yesHandler},
		{name:"no",handler:noHandler}
	];
	ElementPicker(msg,forms,"asking_form_index",
		"chooseFormIndex",formFillerSession,formReplyHandlers,true,"red");
}

// get all input elements of a form
function getInputElements(form){
	// If the form we are trying to fill is still the one the input elements think they belong to, return that list. 
	// return cached copy of available input fields.
	if(formFillerSession.get("formInputFields")!=undefined && formFillerSession.get("fillingFormId")!=undefined && 
		formFillerSession.get("fillingFormId")==formFillerSession.get("asking_form_index")){
		console.log("served from cache");
		return formFillerSession.get("formInputFields");
	}
	// Collect all fillable form elements, cache the copy along with the form index.
	var inputs = form.getElementsByTagName("input");
	var selects = form.getElementsByTagName("select");
	var buttons = form.getElementsByTagName("button");
	var formsInput = {
		inputs:inputs,
		selects:selects,
		buttons:buttons
	};
	// Hold the collected input Elements
	formFillerSession.add("formInputFields",formsInput);
	// A pointer to form which current element list is populated. 
	// Required because inputElement list is cached and needs to be refreshed when 
	// target form changes.
	formFillerSession.add("fillingFormId",formFillerSession.get("asking_form_index"));
	// Reset the values
	formFillerSession.add("input_group",undefined);
	formFillerSession.add("input_element_index",undefined);
	return formsInput;
}

// See if user allowed to enter input on this element. For now, filter out hidden elements.
function isLegitInput(element){
	if(element.attributes.type.value!="hidden"){
		return true;
	}
	return false;
}

// Enter value in a form input. 
function performFormInput(msg){
	var form = formFillerSession.get('current_form');
	var inputGroup = formFillerSession.get("input_group");
	var elementOffset = formFillerSession.get("input_element_index");
	var userInput = msg.getSlot("formInput")==undefined?undefined:msg.getSlot("formInput").value;
	var inputElement = formFillerSession.get("current_input_field");
	console.log(inputGroup);
	console.log(elementOffset);
	console.log(userInput);
	console.log(inputElement);
	inputElement.focus();
	switch(inputGroup){
		case "inputs":
			inputElement.click();
			userInput = userInput==undefined?inputElement.value:userInput;;
			inputElement.value += userInput;
			break;			
		case "selects":
			inputElement.click();
			userInput = userInput==undefined?"0":userInput;
			inputElement.options[parseInt(userInput)].selected=true;
			break;
		case "buttons":
			userInput = userInput==undefined || userInput!="true"?false:true;
			if(userInput)
			{
				inputElement.click();
			}
			break;
	}
	return true;
}

function formInputHandler(msg){
	console.log("hello");
	msg = new VopMessage(msg,undefined);
	// check if a form decided for input
	if(formFillerSession.get('current_form')==undefined){
		pickForm(msg);
		return;
	}
	console.log("all set to operate!");
	var form = formFillerSession.get('current_form');
	var inpElements = getInputElements(form);
	var askForInput = true;
	console.log(inpElements);
	// loop through elements of chosen form.
	// For separate treatment of inputs, selects and buttons
	var inputGroup = formFillerSession.get("input_group");
	var elementOffset = formFillerSession.get("input_element_index");
	// If msg contains input for a input field.
	if(msg.getSlot("formInput")!=undefined && formFillerSession.get("current_input_field")!=undefined){
		askForInput = performFormInput(msg);
	}
	if(inputGroup==undefined){
		// get first non empty input group
		for(group of Object.keys(inpElements)){
			if(inpElements[group]!=undefined && inpElements[group].length>0){
				inputGroup = group;
				formFillerSession.add("input_group",inputGroup);
				break;
			}
		}
	}
	
	if(elementOffset==undefined){
		console.log(inpElements[inputGroup]);
		var tmpCtr = 0;
		for(element of inpElements[inputGroup]){
			if(isLegitInput(element)){				
				elementOffset=tmpCtr;
				formFillerSession.add("input_element_index",elementOffset);	
				highlightElement(inpElements[inputGroup][elementOffset],"green");	
				break;
			}
			tmpCtr+=1;
		}
	}
	// When asking to confirm a input element and user said yes
	var inputYesHandler = function(msg,userReply){
		var chosenInputField = inpElements[inputGroup][elementOffset];
		console.log(chosenInputField);
		formFillerSession.add("current_input_field",chosenInputField);		
	};
	// When asking to confirm a input Element and user says no
	var inputNoHandler = function(msg,userReply,movementDirection = 1){
		unHighlightElement(inpElements[inputGroup][elementOffset]);
		var currOffset = elementOffset;
		elementOffset = (elementOffset+movementDirection)%inpElements[inputGroup].length;
		while(!isLegitInput(inpElements[inputGroup][elementOffset])){
			elementOffset = (elementOffset+movementDirection)%inpElements[inputGroup].length;
			if(elementOffset==currOffset){break;}
		}
		addSessionAttribute(msg,"input_element_index",elementOffset);
		formFillerSession.add('input_element_index',elementOffset);
		highlightElement(inpElements[inputGroup][elementOffset],"green");
		sendMessageToVop(msg,"Perform input on element number "+(elementOffset+1)+"?","Answer in a yes or no");
	};
	var inputPrevHandler = function(msg,userReply){
		inputNoHandler(msg,userReply,-1);
	};
	var inputNextHandler = function(msg,userReply){
		inputNoHandler(msg,userReply,1);
	};
	var inputReplyHandlers = [
		{ name:"yes", handler:inputYesHandler },
		{ name:"no", handler:inputNoHandler },
		{ name:"next", handler:inputNextHandler },
		{ name:"previous", handler:inputPrevHandler }
	];
	if(askForInput){		
		ElementPicker(msg,inpElements[inputGroup],"input_element_index","chooseInputIndex",formFillerSession,inputReplyHandlers,true,"green");
	}
	console.log("input ready on ");
	console.log(inpElements[inputGroup][elementOffset]);
	// Ask for input on a form. If out of input fields ask for next form, else wait for submit command.
}

$('ready',function(){
	captureAllForms();
	router.registerRoute("form_input",formInputHandler);
});