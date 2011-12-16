/*globals $, module, console*/

var emptyTable, addRow, assembleShortHandCall;

module.exports = function (gcd, ui) {
	gcd.on("clear history", emptyTable);
	
	ui.on("add history", addRow);
	
};

emptyTable = function () {
	$('#history table tbody').empty();
};

addRow = function (info) {
	var shc = assembleShortHandCall(info.hand); 
	$('#history table tbody').prepend("<tr><td>"+info.num+".</td><td>"+
		   info.score+"</td><td><span "+info.deltalabel+"</span></td><td class='left'>"+
		   info.hand+"</td><td>"+info.call+"</td></tr>"
		);		
};

assembleShortHandCall = function (hand) {
	var i, n, c, shc; 
	n = hand.length; 
	shc = '';
	for (i= 0; i <n; i += 1) {
		c = hand[i];
		if (c[0] === "new") {
			shc += " <strong>"+c[1] +c[2]+"</strong> ";					
		} else {
			shc += " " + c[1] + c[2] + " ";								
		}
	}
	return shc; 
};