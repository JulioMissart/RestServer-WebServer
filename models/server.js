const express = require("express");
const cors = require("cors");
const { createServer } = require('http');
const { dbConnection } = require("../database/config");
const fileUpload = require('express-fileupload');
const { socketController } = require("../sockets/controller");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = createServer( this.app );
    this.io = require('socket.io')(this.server);

    this.paths = {
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      search: "/api/search",
      uploads: "/api/uploads",
      users: "/api/users",
    };

    // Database connection
    this.dbConnect();

    // Middlewares
    this.middlewares();

    // App routes
    this.routes();

    // Sockets
    this.sockets();
  }

  async dbConnect() {
    await dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // body read & parse
    this.app.use(express.json());

    // public directory as default path "/"
    this.app.use(express.static("public"));

    // Fileupload
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
  }

  routes() {
    this.app.use(this.paths.auth, require("../routes/auth")); // step 2 - path definition
    this.app.use(this.paths.categories, require("../routes/categories"));
    this.app.use(this.paths.uploads, require("../routes/uploads"));
    this.app.use(this.paths.products, require("../routes/products"));
    this.app.use(this.paths.search, require("../routes/search"));
    this.app.use(this.paths.users, require("../routes/users")); // path definition
  }

  sockets() {

    this.io.on("connection", (socket) => socketController(socket, this.io));
  }


  listen() {
    this.server.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

module.exports = Server;
