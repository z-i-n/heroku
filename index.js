var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');

console.log(process.env.PORT);
//app.set('port', (8000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
