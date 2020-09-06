var http = require("http");
var Client = require("mysql2");
var url = require("url");

var pug = require("pug");
var qs = require("querystring");
var NodeSession = require("node-session");

var mainPug = "./index.pug";
var loginPug = "./login-form.pug";
var registerPug = "./register-form.pug";
var addSepatuPug = "./addSepatu.pug";
var editSepatuPug = "./editSepatu.pug";
var profilPug = "./profil.pug";

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
              msg: "User ID atau Password salah!",
            });
            response.end(template);
          }
        });
      });
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
              "id",
              (form["user_id"] = "user"),
              form["user_nama"],
              form["user_password"],
            ];

            var sql = `INSERT INTO users VALUES(?,?,?,md5(?
              ))`;

            db.query(sql, newRow, function (error, result) {
              if (error) {
                response.writeHead(302, { Location: "/register" });
                response.end();
                throw error;
              }

              // redirect ke form login
              response.writeHead(302, { Location: "/" });
              response.end();
            });
          });
          break;
        default:
          console.log("Metode tidak dikenali");
          break;
      }
    } else if (request.url === "/main") {
      if (!request.session.has("user_id")) {
        // redirect ke form login
        response.writeHead(302, { Location: "/" });
        response.end();
      }

      db.query("SELECT * FROM tb_sepatu", function (error, result) {
        if (error) {
          throw error;
        }
        var user_id = request.session.get("user_id");
        response.writeHead(200, { "Content-Type": "text/html" });

        var template = pug.renderFile(mainPug, {
          sepatus: result,
          user_id: user_id,
        });
        response.end(template);
      });
    } else if (request.url === "/add") {
      switch (request.method) {
        case "GET":
          var template = pug.renderFile(addSepatuPug);
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
              form["id"],
              form["merk"],
              form["warna"],
              form["ukuran"],
            ];

            var sql = "INSERT INTO tb_sepatu VALUES(?,?,?,?)";
            db.query(sql, newRow, function (error, result) {
              if (error) {
                throw error;
              }
              //   kode untuk direct ke root
              response.writeHead(302, { Location: "/main" });
              response.end();
            });
          });
          break;

        default:
          console.log("Metode tidak dikenali");
          break;
      }
    } else if (url.parse(request.url).pathname === "/edit") {
      switch (request.method) {
        case "GET":
          var id = qs.parse(url.parse(request.url).query).id;
          var sql = "SELECT * FROM tb_sepatu WHERE id = ?";
          db.query(sql, [id], function (error, result) {
            if (error) {
              throw error;
            }

            var template = pug.renderFile(editSepatuPug, { sepatu: result[0] });
            response.end(template);
          });
          break;
        case "POST":
          var body = "";

          request.on("data", function (data) {
            body += data;
          });

          request.on("end", function () {
            var form = qs.parse(body);
            var params = [
              form["merk"],
              form["warna"],
              form["ukuran"],
              form["id"],
            ];

            var sql = `
            UPDATE tb_sepatu
                SET
                    merk=?,
                    warna=?,
                    ukuran=?
                WHERE
                    id=?
            `;

            db.query(sql, params, function (error, result) {
              if (error) {
                throw error;
              }

              //   kode untuk direct ke root
              response.writeHead(302, { Location: "/main" });
              response.end();
            });
          });
          break;

        default:
          console.log("Metode tidak dikenali");
          break;
      }
    } else if (url.parse(request.url).pathname === "/delete") {
      var id = qs.parse(url.parse(request.url).query).id;
      var sql = "DELETE FROM tb_sepatu WHERE id = ?";
      db.query(sql, [id], function (error, result) {
        if (error) {
          throw error;
        }
        //   kode untuk direct ke root
        response.writeHead(302, { Location: "/main" });
        response.end();
      });
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
