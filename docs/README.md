# Message Protocols
## Message Structure for content scripts to background
{
	eventType: "msg_from_local_content_script",
	from: undefined if optional,
	data:{actual message object}
	//actual message object needs to be defined
}

## Message among background scripts
{
	eventType:someIntent,
	data: some object // likely to change, intended to be same as one exchanged between voice engine and extension
}