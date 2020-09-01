var http = require("http");
var pug = require("pug");
var qs = require("querystring");
require("bootstrap/dist/css/boostrap.css");

var server = http.createServer(function (request, response) {
  response.writeHead(200, { "Content-Type": "text/html" });

  var template = pug.renderFile("./index.pug");
  response.end(template);
});
server.listen(3000);
