export.commands = function (response, jsdata) {
	return response.end(JSON.stringify(jsdata)); 
}