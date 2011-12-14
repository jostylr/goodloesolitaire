Browserify is a require module system. It makes browser stuff like node. It has event emitter as well. 

Idea: split the current codebase into modules. The glue will be two event objects: gcd for logic and style for styling. 

e.g.  
gcd.emit('draw cards', ...)
gcd.on('draw cards', get from server, emit 'new cards' upon return)
gcd.on('new cards', gcd.emit('new cards', ...))
gcd.on('new cards', style.emit('remove backing'))


need to write a quick script for grabbing all .emit and .on lines and organizing them into a nice file. So auto documentation. 

