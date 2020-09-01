var http = require("http");
var Client = require("mysql2");
var pug = require("pug");
var qs = require("querystring");
var NodeSession = require("node-session");

var mainPug = "./halaman-utama.pug";
var loginPug = "./login-form.pug";

// membuat objek koneksi
var db = Client.createConnection({
  host: "localhost",
  user: "tania_istar",
  password: "123",
  database: "crud",
});

// membuat session
var session = new NodeSession({
  secret: "Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD",
});

var server = http.createServer(function (request, response) {
  session.startSession(request, response, function () {
    if (request.url === "/") {
      response.writeHead(200, { "Content-Type": "text/html" });
      var template = pug.renderFile(loginPug);
      response.end(template);
    } else if (request.url === "/login" && request.method === "POST") {
      var body = "";

      request.on("data", function (data) {
        body += data;
      });

      request.on("end", function () {
        var form = qs.parse(body);
        var params = [form["user_id"], form["user_password"]];

        var sql = `SELECT COUNT(*) AS cnt FROM users WHERE user_id = ? AND user_password = md5(?)`;

        db.query(sql, params, function (error, result) {
          if (error) {
            throw error;
          }
          var n = result[0]["cnt"];
          console.log(`Nilai n adalah ${n}`);
          if (n > 0) {
            // login berhasil
            request.session.put("user_id", params[0]);
            // redirect ke halaman utama
            response.writeHead(302, { Location: "/main" });
            response.end();
          } else {
            response.writeHead(200, { "Content-Type": "text/html" });
            var template = pug.renderFile(loginPug, {
              msg: "user id atau password salah",
            });
            response.end(template);
          }
        });
      });
    } else if (request.url === "/main") {
      if (!request.session.has("user_id")) {
        // redirect ke form login
        response.writeHead(302, { Location: "/" });
        response.end();
      }

      var user_id = request.session.get("user_id");
      response.writeHead(200, { "Content-Type": "text/html" });
      // menampilkan ke halaman utama
      var template = pug.renderFile(mainPug, { user_id: user_id });
      response.end(template);
    } else if (request.url === "/logout") {
      if (request.session.has("user_id")) {
        request.session.forget("user_id");
      }

      // redirect ke login
      response.writeHead(302, { Location: "/" });
      response.end();
    } else {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end("Halaman tidak ditemukan");
    }
  });
});

server.listen(3000);
