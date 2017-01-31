var formFillerSession = new Session();

// Get all forms in a page
function captureAllForms(){
	var forms = $('form:visible');
	if(forms!=undefined && forms.length>0){
		formFillerSession.add("all_forms",forms);
	}
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

function formInputHandler(msg){
	msg = new VopMessage(msg,undefined);
	if(formFillerSession.get('current_form')==undefined){
		pickForm(msg);
		return;
	}
	console.log("all set to operate!");
	var form = formFillerSession.get('current_form');
	var inpElements = getInputElements(form);
	console.log(inpElements);
	// loop through elements of chosen form.
	// For separate treatment of inputs, selects and buttons
	var inputGroup = formFillerSession.get("input_group");
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
	// When asking to confirm a input element and user said yes
	var elementOffset = formFillerSession.get("input_element_index");
	if(elementOffset==undefined){
		console.log(inpElements[inputGroup]);
		var tmpCtr = 0;
		for(element of inpElements[inputGroup]){
			if(isLegitInput(element)){				
				elementOffset=tmpCtr;
				formFillerSession.add("input_element_index",0);		
				break;
			}
			tmpCtr+=1;
		}
	}
	// var inputYesHandler = function(msg,userReply){
	// 	var chosenInputField = inpElements[inputGroup][elementOffset];
	// 	console.log(chosenInputField);
	// 	formFillerSession.add("current_input_field",chosenInputField);
		
	// };
	// // When asking to confirm a input Element and user says no
	// var inputNoHandler = function(msg,userReply){
	// 	unHighlightElement(inpElements[inputGroup][elementOffset]);
	// 	var currOffset = elementOffset;
	// 	elementOffset = (elementOffset+1)%inpElements[inputGroup].length;
	// 	while(!isLegitInput(inpElements[inputGroup][elementOffset])){
	// 		elementOffset = (elementOffset+1)%inpElements[inputGroup].length;
	// 		if(elementOffset==currOffset){break;}
	// 	}
	// 	addSessionAttribute(msg,"input_element_index",elementOffset);
	// 	formFillerSession.add('input_element_index',elementOffset);
	// 	highlightElement(forms[elementOffset]);
	// 	sendMessageToVop(msg,"Perform input on element number "+(elementOffset+1)+"?","Answer in a yes or no");
	// };
	// var inputReplyHandlers = [
	// 	{ name:"yes", handler:inputYesHandler },
	// 	{ name:"no", handler:inputNoHandler }
	// ];
	// ElementPicker(msg,inpElements[inputGroup],"input_element_index","chooseInputIndex",formFillerSession,inputReplyHandlers,shouldHighlight,"green");
	console.log("input ready on ");
	console.log(inpElements[inputGroup][elementOffset]);
	// Ask for input on a form. If out of input fields ask for next form, else wait for submit command.
}

$('ready',function(){
	captureAllForms();
	router.registerRoute("form_input",formInputHandler);
});