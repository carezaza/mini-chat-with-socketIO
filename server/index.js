const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIO = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = require("express")();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send("<h1>Server is running....</h1>");
});

const server = http.createServer(app);
const io = socketIO(server);

var users = [];

io.on("connection", (socket) => {
  var user = null;
  console.log("a user connected");

  socket.on("disconnect", () => {
    if (user) {
      users = users.filter((u) => u.id !== user.id);
      io.sockets.emit("get-users", users);
      io.sockets.emit("disconnect-message", {
        text: `${user.name} has disconnected`,
        who: user,
      });
      user = null;
    }

    console.log("a user disconnected");
  });

  const s = "ss";
  s.toLowerCase().trim();
  socket.on("request-join", (name) => {
    if (users.find((u) => u.name === name.toLowerCase().trim())) {
      socket.emit("response-join", { success: false, user: "" });
    } else {
      const id = uuidv4();
      users.push({ id, name: name.toLowerCase().trim() });
      user = { id, name };
      io.sockets.emit("join-message", {
        text: `${name} has joined.`,
        who: user,
      });
      io.sockets.emit("get-users", users);
      socket.emit("response-join", {
        success: true,
        your_user: { id, name },
      });
    }
  });

  socket.on("typing", (res) => {
    io.sockets.emit("typing-res", res);
  });

  socket.on("send-message", (res) => {
    io.sockets.emit("message-res", res);
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
