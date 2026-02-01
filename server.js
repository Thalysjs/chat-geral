const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });

const messagesFile = "messages.json";

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([]));
}

function loadMessages() {
  return JSON.parse(fs.readFileSync(messagesFile));
}

function saveMessage(msg) {
  const messages = loadMessages();
  messages.push(msg);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

app.get("/history", (req, res) => {
  res.json(loadMessages());
});

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.json({
    fileName: file.originalname,
    filePath: "/uploads/" + file.filename
  });
});

io.on("connection", socket => {
  socket.on("chat message", msg => {
    saveMessage(msg);
    io.emit("chat message", msg);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
