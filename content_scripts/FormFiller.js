//TODO handle navigation, scrolling, etc.

var formFillerSession = new Session();
const FormConstants={
	PRIMARY_INTENT_NAME :"form_intent",
	// local sessions keys
	ALL_FORMS_KEY:"forms_all",
	CURR_FORM_KEY:"current_form",
	FORM_ASKING_KEY:"asking_form_index",
	ACTIVE_FORM_OFFSET_KEY:"selected_form_index",
	INPUT_OFFSET_KEY:"input_element_index",
	ACTIVE_FORM_INPUTS_KEY:"form_input_fields",
	INPUT_ACTIVE_KEY:"current_input_field",
	SELECT_OPTIONS_DISPLAYER:"select_options_displayer",
	// user request keys
	MSG_CHOSEN_FORM_INDEX:"formCommand",
	MSG_CHOSEN_INPUT_INDEX:"formCommand",
	MSG_USER_INPUT:"formInput",

	// variables expecting a yes/no response 
	YES_NO_VARS: ["MSG_CHOSEN_INPUT_INDEX", "MSG_CHOSEN_FORM_INDEX"]
};

// This function displays a list on screen.
// TO remove existing select, just pas undefined, false
function selectElementsToggleDisplay(selectElement,show=true){
	if(selectElement==undefined){
		if(formFillerSession.get(FormConstants.SELECT_OPTIONS_DISPLAYER)!=undefined){
			console.log("cached select" + show);
			formFillerSession.get(FormConstants.SELECT_OPTIONS_DISPLAYER).style.display=show?"block":"none";
			if(show){
				setGlobalScrollTarget(formFillerSession.get(FormConstants.SELECT_OPTIONS_DISPLAYER));
			}
		}
		return;
	}
	else{		
		console.log("new select");
		var selectOptions = getPromptDisplayBanner();
		var opts = [];
		opts.push("<h4>Speak the number for the option you wish to select.</h4>")
		var ctr=0;
		for(option of selectElement.options){
			opts.push("<span>"+ctr+": "+option.innerHTML+"</span><br>");
			ctr+=1;
		}
		selectOptions.innerHTML += opts.join("");
		document.getElementsByTagName("body")[0].appendChild(selectOptions);
		formFillerSession.add(FormConstants.SELECT_OPTIONS_DISPLAYER,selectOptions);
		setGlobalScrollTarget(selectOptions);
	}
}

// See if a form can take input. To eliminate hidden forms
function canFormInput(form){
	var inpElements = getInputElements(form);
	for(inp of inpElements){
		if(isLegitInput(inp)){
			return true;
		}
	}
	return false;
}
// Get all forms in a page
function captureAllForms(){
	var forms = $('form:visible');
	var validForms=[];
	if(forms!=undefined && forms.length>0){
		// Weed out forms that only have hidden elements.
		for(var i=0;i<forms.length;i++){
			if(canFormInput(forms[i])){
				validForms.push(forms[i]);
			}
		}
		formFillerSession.add(FormConstants.ALL_FORMS_KEY,validForms);
	}
	else{
		return;
	}
	console.log(forms);
	if(forms.length==1){
		formFillerSession.add(FormConstants.CURR_FORM_KEY,validForms[0]);
	}
	formFillerSession.add(FormConstants.FORM_ASKING_KEY,0);
}

// Interact with user to decide on a form to fill up.
// TODO cancel request.
function pickForm(msg){
	var forms = formFillerSession.get(FormConstants.ALL_FORMS_KEY);
	var currIndex = formFillerSession.get(FormConstants.FORM_ASKING_KEY);
	var userChosenIndex = msg.getSlot(FormConstants.MSG_CHOSEN_FORM_INDEX);
	var formYesHandler = function(msg,userReply){
		console.log("said yes");
		formFillerSession.add(FormConstants.CURR_FORM_KEY,forms[currIndex]);
		// formInputHandler(msg);
	};
	var formNoHandler = function(msg,userReply,direction=1){
		unHighlightElement(forms[currIndex]);
		currIndex = (currIndex+direction)%forms.length;
		addSessionAttribute(msg,"asking_form",currIndex);
		formFillerSession.add(FormConstants.FORM_ASKING_KEY,currIndex);
		highlightElement(forms[currIndex]);
		formFillerSession.add(FormConstants.CURR_FORM_KEY,undefined);
		formFillerSession.add(FormConstants.INPUT_ACTIVE_KEY,undefined);
		formFillerSession.add(FormConstants.INPUT_OFFSET_KEY,undefined);
		sendMessageToVop(msg,"Perform input on form number "+(currIndex+1)+"?","Answer in a yes or no");
		selectElementsToggleDisplay(undefined,false);
	};
	var formNextHandler = function(msg,userReply){
		formNoHandler(msg,userReply,1);
	};
	var formPrevHandler=function(msg,userReply){
		formNoHandler(msg,userReply,-1);
	};
	var formCancelHandler = function(msg,userReply){
		formNoHandler(msg,userReply,1);
	};
	var formSubmitHandler = function(msg,userReply){
		var form = formFillerSession.get(FormConstants.CURR_FORM_KEY);
		if(form!=undefined){
			form.submit();
		}
	};
	var formReplyHandlers = [
		{name:"yes",handler:formYesHandler, keywords:globalConstants.YES_KEYWORDS},
		{name:"no",handler:formNoHandler, keywords:globalConstants.NO_KEYWORDS},
		{name:"next",handler:formNextHandler, keywords:globalConstants.NEXT_KEYWORDS},
		{name:"previous",handler:formPrevHandler, keywords:globalConstants.PREV_KEYWORDS},
		{name:"cancel",handler:formCancelHandler, keywords:globalConstants.CANCEL_KEYWORDS},
		{name:"submit",handler:formSubmitHandler, keywords:globalConstants.SUBMIT_KEYWORDS}
	];
	ElementPicker(msg,forms,FormConstants.FORM_ASKING_KEY,
		FormConstants.MSG_CHOSEN_FORM_INDEX,formFillerSession,formReplyHandlers,true,"red");
}

// get all input elements of a form
function getInputElements(form){
	// If the form we are trying to fill is still the one the input elements think they belong to, return that list. 
	// return cached copy of available input fields.
	if(formFillerSession.get(FormConstants.ACTIVE_FORM_INPUTS_KEY)!=undefined && formFillerSession.get(FormConstants.ACTIVE_FORM_OFFSET_KEY)!=undefined && 
		formFillerSession.get(FormConstants.ACTIVE_FORM_OFFSET_KEY)==formFillerSession.get(FormConstants.FORM_ASKING_KEY)){
		console.log("served from cache");
		return formFillerSession.get(FormConstants.ACTIVE_FORM_INPUTS_KEY);
	}
	// Collect all fillable form elements, cache the copy along with the form index.
	var inputs = form.getElementsByTagName("input");
	var selects = form.getElementsByTagName("select");
	var buttons = form.getElementsByTagName("button");
	var formsInputByType = [
		inputs,
		selects,
		buttons
	];
	var formsInput = [];
	for(formInputList of formsInputByType){
		for( formInput of formInputList){
			formsInput.push(formInput);
		}
	}
	// Hold the collected input Elements
	formFillerSession.add(FormConstants.ACTIVE_FORM_INPUTS_KEY,formsInput);
	// A pointer to form which current element list is populated. 
	// Required because inputElement list is cached and needs to be refreshed when 
	// target form changes.
	formFillerSession.add(FormConstants.ACTIVE_FORM_OFFSET_KEY,formFillerSession.get(FormConstants.FORM_ASKING_KEY));
	// Reset the values
	formFillerSession.add("input_group",undefined);
	formFillerSession.add(FormConstants.INPUT_OFFSET_KEY,undefined);
	return formsInput;
}

// See if user allowed to enter input on this element. For now, filter out hidden elements.
function isLegitInput(element){
	if((element.attributes.type!=undefined && element.attributes.type.value=="hidden") || element.offsetParent==null){
		return false;
	}
	return true;
}

// Enter value in a form input. 
function performFormInput(msg){
	var form = formFillerSession.get(FormConstants.CURR_FORM_KEY);
	// var inputGroup = formFillerSession.get("input_group");
	var elementOffset = formFillerSession.get(FormConstants.INPUT_OFFSET_KEY);
	var userInput = msg.getSlot(FormConstants.MSG_USER_INPUT)==undefined?undefined:msg.getSlot(FormConstants.MSG_USER_INPUT).value;
	var inputElement = formFillerSession.get(FormConstants.INPUT_ACTIVE_KEY);
	// console.log(inputGroup);
	console.log(elementOffset);
	console.log(userInput);
	console.log(inputElement);
	inputElement.focus();
	switch(inputElement.tagName){
		case "INPUT":
			userInput = userInput==undefined?inputElement.value:userInput;
			if(isRadio(inputElement) || isCheckBox(inputElement)){
				if(userInput!=undefined && isSayingYes(userInput)==true){
					inputElement.checked=true;
				}
				else if(userInput!=undefined && isSayingYes(userInput)==false){
					inputElement.checked = false;
				}
			}
			else{				
				inputElement.click();
				inputElement.value += userInput;
			}
			break;			
		case "SELECT":
			inputElement.click();
			userInput = userInput==undefined?"0":userInput;
			inputElement.options[parseInt(userInput)].selected=true;
			resetGlobalScrollTarget();
			break;
		case "BUTTON":
			if(userInput!=undefined && isSayingYes(userInput)==true)
			{
				inputElement.click();
			}
			break;
		default:
			return false;
	}
	return true;
}

// Check if user issued a valid command for form navigation.
function validFormNavigationRequest(msg){
	var validRequests = ["yes","no","next","previous","cancel","submit"];
	var userCommand = msg.getSlot(FormConstants.MSG_CHOSEN_FORM_INDEX);
	if(userCommand!=null){
		userCommand=userCommand.value;//.trim().toLowerCase();
		if(isAValidCommand(validRequests,userCommand)){
			return true;
		}
	}
	return false;
}

function isCheckBox(inputElement){
	return inputElement.tagName == "INPUT" && inputElement.type=="checkbox";
}

function isRadio(inputElement){
	return inputElement.tagName == "INPUT" && inputElement.type=="radio";
}

function getLabelElem(inputElement){
	return document.querySelector("label[for='"+inputElement.id+"']");
}

function getLabelForElem(inputElement, defaultValue){
	var labelElem = getLabelElem(inputElement);
	return labelElem? labelElem.innerHTML : defaultValue;
}

// Prompt text for elements
function getPromptText(inputElement){
	var promptText="";
	switch(inputElement.tagName){
		case "INPUT":
			if(isRadio(inputElement)){
				promptText = "select "+ getLabelForElem(inputElement, "this") +" option?";
			}
			else if(isCheckBox(inputElement)){
				promptText = "select "+getLabelForElem(inputElement, "this")+" option?";
			}
			else{
				promptText = "select this field?";
			}
			break;			
		case "SELECT":
			promptText = "Pick an option from this list?";
			break;
		case "BUTTON":
			promptText = "Press this button?";
			break;
	}
	return promptText;
}

// check if user asked to close the <select> options displayer.
// function cancellingSelectDisplay(msg){
// 	var selectHelper = formFillerSession.get(FormConstants.SELECT_OPTIONS_DISPLAYER);
// 	if(selectHelper!=undefined){
// 		var userInput = msg.getSlot(FormConstants.MSG_USER_INPUT);
// 		userInput=userInput==undefined?undefined:userInput.value;
// 		var cancelWords = ["cancel","close"];
// 		if(isAValidCommand(cancelWords,userInput)){
// 			return true;
// 		}
// 	}
// 	return false;
// }

// check if it is a submit request
function isSubmitRequest(msg){
	return isAValidCommand(globalConstants.SUBMIT_KEYWORDS, msg.getSlot(FormConstants.MSG_CHOSEN_FORM_INDEX).value);
}

function formInputHandler(msg){
	if(!isActiveTab()){
		return;
	}
	// selectElementsToggleDisplay(document.getElementsByTagName("select")[0],true);
	msg = new VopMessage(msg,undefined);
	// if(cancellingSelectDisplay(msg)){
	// 	selectElementsToggleDisplay(undefined,false);
	// }
	console.log(msg);
	addSessionAttribute(msg, globalConstants.ASKER_KEY, FormConstants.PRIMARY_INTENT_NAME);
	// check if a form decided for input
	var isAValidNavRequest = validFormNavigationRequest(msg);
	if(formFillerSession.get(FormConstants.CURR_FORM_KEY)==undefined || isAValidNavRequest){
		console.log("on form ");
		console.log(formFillerSession.get(FormConstants.CURR_FORM_KEY));
		// HACK ALERT. Form nav requests and input nav requests are essentially same and there is no way of telling one from other.
		// So if form is undefined, or request is for 'submit' it is a form request, else it is an input request. 
		var form = formFillerSession.get(FormConstants.CURR_FORM_KEY);
		if(form==undefined || isSubmitRequest(msg)){
			console.log("handled by form picker");
			pickForm(msg);
		}
		
	}
	var form = formFillerSession.get(FormConstants.CURR_FORM_KEY);
	if(form==undefined){
		return;
	}
	console.log("all set to operate!");
	var inpElements = getInputElements(form);
	var askForInput = true;
	// console.log(inpElements);
	// loop through elements of chosen form.
	// For separate treatment of inputs, selects and buttons
	// var inputGroup = formFillerSession.get("input_group");
	var elementOffset = formFillerSession.get(FormConstants.INPUT_OFFSET_KEY);
	// If msg contains input for a input field.

	if(msg.getSlot(FormConstants.MSG_USER_INPUT)!=undefined && formFillerSession.get(FormConstants.INPUT_ACTIVE_KEY)!=undefined){
		askForInput = performFormInput(msg);
	}
	// if(inputGroup==undefined){
	// 	// get first non empty input group
	// 	for(group of Object.keys(inpElements)){
	// 		if(inpElements[group]!=undefined && inpElements[group].length>0){
	// 			inputGroup = group;
	// 			formFillerSession.add("input_group",inputGroup);
	// 			break;
	// 		}
	// 	}
	// }
	
	if(elementOffset==undefined){
		console.log(inpElements);
		var tmpCtr = 0;
		for(element of inpElements){
			if(isLegitInput(element)){				
				elementOffset=tmpCtr;
				formFillerSession.add(FormConstants.INPUT_OFFSET_KEY,elementOffset);	
				highlightElement(inpElements[elementOffset],"green");	
				break;
			}
			tmpCtr+=1;
		}
	}
	// When asking to confirm a input element and user said yes
	var inputYesHandler = function(msg,userReply){
		var chosenInputField = inpElements[elementOffset];
		console.log(chosenInputField);
		formFillerSession.add(FormConstants.INPUT_ACTIVE_KEY,chosenInputField);		
		if(chosenInputField.tagName=="SELECT"){
			selectElementsToggleDisplay(chosenInputField);
		}
		if(isRadio(chosenInputField) || isCheckBox(chosenInputField)){
			chosenInputField.checked=true;
		}
	};
	// When asking to confirm a input Element and user says no
	var inputNoHandler = function(msg,userReply,movementDirection = 1){
		unHighlightElement(inpElements[elementOffset]);
		var currOffset = elementOffset;
		elementOffset = (elementOffset+movementDirection)%inpElements.length;
		while(!isLegitInput(inpElements[elementOffset])){
			elementOffset = (elementOffset+movementDirection)%inpElements.length;
			if(elementOffset==currOffset){break;}
		}
		addSessionAttribute(msg,FormConstants.INPUT_OFFSET_KEY,elementOffset);
		formFillerSession.add(FormConstants.INPUT_OFFSET_KEY,elementOffset);
		highlightElement(inpElements[elementOffset],"green");
		formFillerSession.add(FormConstants.INPUT_ACTIVE_KEY,undefined);
		var promptText = getPromptText(inpElements[elementOffset]);	
		sendMessageToVop(msg,promptText,promptText);
		selectElementsToggleDisplay(undefined,false);
	};
	var inputPrevHandler = function(msg,userReply){
		inputNoHandler(msg,userReply,-1);
	};
	var inputNextHandler = function(msg,userReply){
		inputNoHandler(msg,userReply,1);
	};
	var cancelHandler = function(msg, userReply){
		var chosenElement = inpElements[elementOffset];
		console.log("cancelling");
		if(chosenElement==undefined){return;}
		if(chosenElement.tagName=="INPUT"){
			if(isRadio(chosenElement) || isCheckBox(chosenElement)){
				chosenElement.checked = false;
			}
			else{
				chosenElement.value="";
			}
		}
		selectElementsToggleDisplay(undefined,false);
	};
	var inputReplyHandlers = [
		{ name:"yes", handler:inputYesHandler, keywords: globalConstants.YES_KEYWORDS },
		{ name:"no", handler:inputNoHandler, keywords: globalConstants.NO_KEYWORDS },
		{ name:"next", handler:inputNextHandler, keywords: globalConstants.NEXT_KEYWORDS },
		{ name:"previous", handler:inputPrevHandler, keywords: globalConstants.PREV_KEYWORDS },
		{ name:"cancel", handler:cancelHandler, keywords: globalConstants.CANCEL_KEYWORDS }
	];
	if(askForInput){	
		var promptText = getPromptText(inpElements[elementOffset]);		
		ElementPicker(msg,inpElements,FormConstants.INPUT_OFFSET_KEY,FormConstants.MSG_CHOSEN_INPUT_INDEX,formFillerSession,inputReplyHandlers,true,"green",promptText);
	}
	console.log("input ready on ");
	console.log(inpElements[elementOffset]);
	// Ask for input on a form. If out of input fields ask for next form, else wait for submit command.
}

// handle yes or no messages from user.
function formResponseHandler(msg){
	msg = new VopMessage(msg, undefined);
	// the form wasn't looking for a response.
	if(msg.getSessionAttribute(globalConstants.ASKER_KEY).toLowerCase()!=FormConstants.PRIMARY_INTENT_NAME){
		return;
	}
	console.log("form handler");
	for(s of FormConstants.YES_NO_VARS){
		msg.addSlot(FormConstants[s], msg.getSlot("userResponse"));
	}
	formInputHandler(msg);
}

$('ready',function(){
	captureAllForms();
	router.registerRoute("form_input",formInputHandler);
	router.registerRoute("respond_intent", formResponseHandler);
});