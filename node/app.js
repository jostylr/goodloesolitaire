var http = require('http');

var commands = require('./commands');

var server = http.createServer(function(request, response) {
	try { 
		if ( request.method === 'POST' ) {
			// the body of the POST is JSON payload.  It is raw, not multipart encoded.
			//format [idData, command, data, command, data,...]
			var data = '';
			var jsdata
			request.addListener('data', function(chunk) { data += chunk; });
			request.addListener('end', function() {
				jsdata = JSON.parse(data);
				response.writeHead(200, {'content-type': 'text/json' });
				commands(response, jsdata));  // other require as arguments? 
			});
		} else {
			response.writeHead(404);
			response.end('bad method');
		}
	} catch ( e ) {
		response.writeHead(500, {'content-type': 'text/plain' });
		response.write('ERROR:' + e);
		response.end('\n');
	}
});

server.listen(4000);