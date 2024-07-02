var express = require("express");
var multer = require("multer");
var app = express();
var ejs = require('ejs');
var fs = require("fs");
var path = require("path");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var senderSocketID;
var upload = multer({
    dest: "uploads/",
    limits: { fileSize: 3 * 1024 * 1024 * 1024 },
});
var folderPath = path.join(__dirname, "/uploads");
var roomCode = "";
function clearFolder(folderPath) {
    fs.readdir(folderPath, function (err, files) {
        if (err) {
            console.error("Error reading folder:", err);
            return;
        }
        // Delete each file within the folder
        files.forEach(function (file) {
            var filePath = "".concat(folderPath, "/").concat(file);
            fs.unlink(filePath, function (err) {
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
app.get("/receiver", function (req, res) {
    res.render("receiver");
});
app.get("/", function (req, res) {
    res.render("index");
});
app.get("/sender", function (req, res) {
    res.render("sender");
});
app.get('/index', function (req, res) {
    res.render("index");
});
app.get("/about", function (req, res) {
    res.render("about");
});
app.get("/features", function (req, res) {
    res.render("features");
});
app.post("/upload", upload.array("files[]", 10), function (req, res) {
    var files = req.files;
    var fileCount = files.length;
    // Process each uploaded file
    files.forEach(function (file) {
        var filePath = file.path;
        var mimeType = file.mimetype;
        console.log(mimeType);
        if (mimeType.includes("document")) {
            mimeType = "document/docx";
        }
        console.log(mimeType);
        var name = file.originalname;
        var pos = name.lastIndexOf(".");
        name = name.slice(0, pos);
        // Read the file data
        fs.readFile(filePath, function (err, fileData) {
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
io.on("connection", function (socket) {
    socket.on("create-room", function (data) {
        console.log("Room created Room ID : ".concat(data.senderID));
        // created and joined the same room
        socket.join(data.senderID);
        roomCode = data.senderID;
        senderSocketID = socket.id;
        io.to(socket.id).emit("room-created", roomCode);
    });
    socket.on("join-room", function (data) {
        // Joined the room created by the senderID
        if (data.roomcode == roomCode) {
            var numSocketsInRoom = io.sockets.adapter.rooms.get(data.roomcode).size;
            if (numSocketsInRoom >= 2) {
                // Reject the third socket from joining the room
                io.to(socket.id).emit("not-allowed");
            }
            else {
                io.to(socket.id).emit('init', { senderid: senderSocketID, receiverid: socket.id });
                io.to(senderSocketID).emit('init', { senderid: senderSocketID, receiverid: socket.id });
                socket.join(data.roomcode);
                console.log("".concat(socket.id, " joined the room"));
                var socketsInRoom = io.sockets.adapter.rooms.get(data.roomcode);
                // Get the socket IDs of all sockets in the room
                var socketIDs_1 = [];
                socketsInRoom.forEach(function (socket, socketID) {
                    socketIDs_1.push(socketID);
                });
                console.log("Socket IDs in room ".concat(data.roomcode, ":"), socketIDs_1);
            }
        }
        else {
            console.log("Room code not matched");
            io.to(socket.id).emit("wrong-code");
        }
    });
    socket.on("file-upload", function (data) {
        console.log(data);
        socket.in(roomCode).emit("file-receive", data.file);
    });
    socket.on("disconnect", function () {
        io.to(roomCode).emit('left', socket.id);
        clearFolder(folderPath);
    });
});
http.listen(3000, function () {
    console.log("Server is running on port 3000");
});
