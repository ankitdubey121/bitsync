const express = require("express");
const multer = require("multer");
const app = express();
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, 'public')));

let senderSocketID;
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 3 * 1024 * 1024 * 1024 },
});
const folderPath = path.join(__dirname, "/uploads");
roomCode = "";
function clearFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    // Delete each file within the folder
    files.forEach((file) => {
      const filePath = `${folderPath}/${file}`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
        console.log("Deleted file:", filePath);
      });
    });
  });
}

app.use(bodyParser.text());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/receiver", (req, res) => {
  res.render("receiver");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sender", (req, res) => {
  res.render("sender");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/features", (req, res) => {
  res.render("features");
});

app.post("/sendChatMsg", (req, res) => {
  var message = req.body;
  console.log(message);
  res.sendStatus(200);
});

app.post("/upload", upload.array("files[]", 10), (req, res) => {
  const files = req.files;
  const fileCount = files.length;
  // Process each uploaded file
  files.forEach((file) => {
    const filePath = file.path;
    let mimeType = file.mimetype;
    console.log(mimeType);
    if (mimeType.includes("document")) {
      mimeType = "document/docx";
    }

    console.log(mimeType);

    let name = file.originalname;
    let pos = name.lastIndexOf(".");
    name = name.slice(0, pos);

    // Read the file data
    fs.readFile(filePath, (err, fileData) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      // Emit the file data to the receiver-side
      io.emit("file-transfer", {
        data: fileData,
        mimeType: mimeType,
        name: name,
        fileCount: fileCount,
      });
    });
  });

  res.sendStatus(200);
});

io.on("connection", (socket) => {
  socket.on("create-room", (data) => {
    console.log(`Room created Room ID : ${data.senderID}`);
    // created and joined the same room
    socket.join(data.senderID);
    roomCode = data.senderID;
    senderSocketID = socket.id;
    io.to(socket.id).emit("room-created", roomCode);
  });

  socket.on("msgFromSender", (data) => {
    // console.log("Message received from sender:", data.message);
    // Broadcast the message to receiver
    socket.broadcast.emit("msgFromSender", data);
  });

  socket.on("msgFromReceiver", (data) => {
    console.log("Message received from receiver:", data.message);

    // Broadcast the message to all clients (including the receiver)
    io.emit("msgFromReceiver", data);
  });

  socket.on("senderTyping", (data) => {
    // console.log(data);
    io.emit("senderTyping", data);
  });

  socket.on("receiverTyping", (data) => {
    // console.log(data);
    io.emit("receiverTyping", data);
  });

  socket.on("join-room", (data) => {
    // Joined the room created by the senderID
    if (data.roomcode == roomCode) {
      const numSocketsInRoom = io.sockets.adapter.rooms.get(data.roomcode).size;
      if (numSocketsInRoom >= 2) {
        // Reject the third socket from joining the room
        io.to(socket.id).emit("not-allowed");
      } else {
        io.to(socket.id).emit("init", {
          senderid: senderSocketID,
          receiverid: socket.id,
        });
        io.to(senderSocketID).emit("init", {
          senderid: senderSocketID,
          receiverid: socket.id,
        });
        socket.join(data.roomcode);
        console.log(`${socket.id} joined the room`);
        const socketsInRoom = io.sockets.adapter.rooms.get(data.roomcode);

        // Get the socket IDs of all sockets in the room
        const socketIDs = [];
        socketsInRoom.forEach((socket, socketID) => {
          socketIDs.push(socketID);
        });
        console.log(`Socket IDs in room ${data.roomcode}:`, socketIDs);
      }
    } else {
      console.log("Room code not matched");
      io.to(socket.id).emit("wrong-code");
    }
  });


  socket.on("disconnect", () => {
    io.to(roomCode).emit("left", socket.id);
    clearFolder(folderPath);
  });
});

http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
