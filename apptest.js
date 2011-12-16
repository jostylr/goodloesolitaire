http = require('http');

cli = http.createClient(3000, 'localhost');

request = cli.request('GET', '/', { 
	'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  host: 'goodloesolitaire.com',
  accept: '*/*',
  'accept-encoding': 'deflate, gzip',
  range: 'bytes=0-300',
  connection: 'close' 
});

request.end();
request.on('response',  function (response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
  console.log('BODY: ' + chunk);
  });
});


req2 = cli.request('GET', '/', { 
	'user-agent': 'AppEngine-Google; (+http://code.google.com/appengine; appid: opengraph-in-test)',
  host: 'goodloesolitaire.com',
  'accept-encoding': 'gzip' 
});

req2.end();
req2.on('response',  function (response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    //console.log('BODY: ' + chunk);
  });
});


