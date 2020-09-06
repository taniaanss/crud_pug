var http = require("http");
var Client = require("mysql2");

var pug = require("pug");
var qs = require("querystring");
var url = require("url");

var loginPug = "./login-form.pug";
var registerPug = "./register-form.pug";

// membuat objek koneksi
var db = Client.createConnection({
  host: "localhost",
  user: "tania_istar",
  password: "123",
  database: "crud",
});

var server = http.createServer(function (request, response) {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    var template = pug.renderFile(registerPug);
    response.end(template);
  } else if (request.url === "/register") {
    switch (request.method) {
      case "GET":
        var template = pug.renderFile(registerPug);
        response.end(template);
        break;
      case "POST":
        var body = "";

        request.on("data", function (data) {
          body += data;
        });

        request.on("end", function () {
          var form = qs.parse(body);
          var newRow = [
            form["user_id"],
            form["user_nama"],
            form["user_password"],
          ];

          var sql = `INSERT INTO users VALUES(?,?,?)`;

          db.query(sql, newRow, function (error, result) {
            if (error) {
              console.log(error);
              response.writeHead(302, { Location: "/" });
              response.end();
              throw error;
            }

            //   redirect ke login
            response.writeHead(200, { "Content-Type": "text/html" });
            var template = pug.renderFile(loginPug, {
              msg: "Akun berhasil dibuat!",
            });
            response.end(template);
          });
        });
        break;
      default:
        console.log("Metode tidak dikenali");
        break;
    }
  } else if (request.url === "/login") {
    response.writeHead(200, { "Content-Type": "text/html" });
    // redirect ke halaman login
    var template = pug.renderFile(loginPug);
    response.end(template);
  }
});

server.listen(3000);
