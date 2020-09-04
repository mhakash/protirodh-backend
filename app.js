const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const socketio = require("socket.io");

const app = express();
const server = require("http").createServer(app);
const io = socketio(server);

const userRoute = require("./src/routers/user");
const postRoute = require("./src/routers/post");

const users = {};

dotenv.config();
require("./src/db/db");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

app.get("/api/chat", (req, res) => {
  res.json({
    id: 12345,
  });
});

io.on("connection", (socket) => {
  //console.log("a new user connected");
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }
  socket.emit("yourID", socket.id);
  io.sockets.emit("allUsers", users);

  socket.on("join", ({ name }) => {
    console.log(name);
    socket.join("1234");
  });

  socket.on("message", (message, callback) => {
    console.log(message);
    socket.to("1234").emit("sendMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete users[socket.id];
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
    });
  });
  socket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

const port = process.env.PORT || 7000;
server.listen(port, () => {
  console.log("server started at port " + port);
});
