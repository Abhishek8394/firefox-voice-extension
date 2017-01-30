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

function pickForm(msg){
	var forms = formFillerSession.get("all_forms");
	var currIndex = formFillerSession.get("asking_form_index");
	var userChosenIndex = msg.getSlot("chooseFormIndex");
	console.log(userChosenIndex);
	if(userChosenIndex==undefined){
		console.log("said nothing");
		addSessionAttribute(msg,"asking_form",currIndex);
		formFillerSession.add('asking_form_index',currIndex);
		highlightElement(forms[currIndex]);
		sendMessageToVop(msg,"Perform input on form number "+(currIndex+1)+"?","Answer in a yes or no");
		return;
	}
	switch(userChosenIndex.value){
		case "yes":
		console.log("said yes");
			formFillerSession.add("current_form",forms[currIndex]);
			formInputHandler(msg);
			break;
		case "no":
		console.log("said no");
			unHighlightElement(forms[currIndex]);
			currIndex = (currIndex+1)%forms.length;
			addSessionAttribute(msg,"asking_form",currIndex);
			formFillerSession.add('asking_form_index',currIndex);
			highlightElement(forms[currIndex]);
			sendMessageToVop(msg,"Perform input on form number "+(currIndex+1)+"?","Answer in a yes or no");
			break;		
	}
}

function getInputElements(form){
	// If the form we are trying to fill is still the one the input elements think they belong to, return that list. 
	// return cached copy of available input fields.
	if(formFillerSession.get("inputElementsList")!=undefined && formFillerSession.get("fillingFormId")!=undefined && 
		formFillerSession.get("fillingFormId")==formFillerSession.get("asking_form_index")){
		console.log("served from cache");
		return formFillerSession.get("inputElementsList");
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
	formFillerSession.add("inputElementsList",formsInput);
	formFillerSession.add("fillingFormId",formFillerSession.get("asking_form_index"));
	return formsInput;
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
	// Ask for input on a form. If out of input fields ask for next form, else wait for submit command.
}

$('ready',function(){
	captureAllForms();
	router.registerRoute("form_input",formInputHandler);
});