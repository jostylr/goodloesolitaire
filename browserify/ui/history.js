/*globals $, module, console*/

var emptyTable, addRow;

module.exports = function (gcd, ui) {
	gcd.on("clear history", emptyTable);
	
	ui.on("add history", addRow);
	
};

emptyTable = function () {
	$('#history table tbody').empty();
};

addRow = function (info) {
	$('#history table tbody').prepend("<tr><td>"+info.num+".</td><td>"+
		   info.score+"</td><td><span "+info.deltalabel+"</span></td><td class='left'>"+
		   info.hand+"</td><td>"+info.call+"</td></tr>"
		);		
};