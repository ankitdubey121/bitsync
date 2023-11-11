const express = require("express");
const multer = require("multer");
const app = express();
const ejs = require('ejs');
const fs = require("fs");
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http);


let senderSocketID:string = ""

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 3 * 1024 * 1024 * 1024 },
});

const folderPath = path.join(__dirname, "/uploads");


let roomCode:string = "";

function clearFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    // Delete each file within the folder
    files.forEach((file) => {
      const filePath:string = `${folderPath}/${file}`;

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

app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get("/receiver", (req, res) => {
  res.render("receiver");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sender", (req, res) => {
  res.render("sender");
});

app.get('/index',(req,res)=>{
  res.render("index");
});


app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/features", (req, res) => {
  res.render("features");
});

app.post("/upload", upload.array("files[]", 10), (req, res) => {
  const files = req.files;
  const fileCount:number = files.length;
  // Process each uploaded file
  files.forEach((file) => {
    const filePath = file.path;
    let mimeType = file.mimetype;
    console.log(mimeType)
    if (mimeType.includes("document")) {
      mimeType = "document/docx";
    }

    console.log(mimeType);

    let name:string = file.originalname;
    let pos:number = name.lastIndexOf(".");
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

  socket.on("join-room", (data) => {
    // Joined the room created by the senderID
    if (data.roomcode == roomCode) {
      const numSocketsInRoom = io.sockets.adapter.rooms.get(data.roomcode).size;
      if (numSocketsInRoom >= 2) {
        // Reject the third socket from joining the room
        io.to(socket.id).emit("not-allowed");
      } else {
        io.to(socket.id).emit('init', {senderid: senderSocketID, receiverid: socket.id})
        io.to(senderSocketID).emit('init', {senderid: senderSocketID, receiverid: socket.id})
        socket.join(data.roomcode);
        console.log(`${socket.id} joined the room`);
        const socketsInRoom = io.sockets.adapter.rooms.get(data.roomcode);

        // Get the socket IDs of all sockets in the room
        const socketIDs:any = [];
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

  socket.on("file-upload", (data) => {
    console.log(data);
    socket.in(roomCode).emit("file-receive", data.file);
  });

  socket.on("disconnect", () => {
    io.to(roomCode).emit('left', socket.id);
    clearFolder(folderPath);
  });
});

http.listen(3000, () => {
  console.log("Server is running on port 3000");
});
