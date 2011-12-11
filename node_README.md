To use, install node (http://nodejs.org/#download) 

(npm now included in node.js) and npm:  http://npmjs.org/  (curl http://npmjs.org/install.sh | sh) possibly using sudo. 

Then install express:

npm install express

into the top directory.  Add node_modules to global gitignore file. 


A helpful resource for AWS usage of this https://github.com/rsms/ec2-webapp/blob/master/INSTALL.md#readme

For MongoDB: 

npm install mongodb

Install mongodb from mongodb (download, unzip to favorite directory). Server starts with mongod, shell starts with mongo

Create a highscore record: 
db.highscores.insert({"score":100, "name":"default", "_id":"AAA","date":Date.now()})

