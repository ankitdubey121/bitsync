const socket = io("http://localhost:3000");

function generateUUID() {
  var code = "";
  for (var i = 0; i < 3; i++) {
    var segment = Math.floor(Math.random() * 256).toString(16);
    if (segment.length < 2) {
      segment = "0" + segment; // Pad with leading zero if necessary
    }
    code += segment + "-";
  }
  return code.slice(0, -1); // Remove the trailing dash
}
receiverID = "";

const joinBtn = document.getElementById("joinBtn");

joinBtn.addEventListener("click", () => {
  let senderID = document.getElementById("roomCode").value;
  socket.on("connect", () => {
    receiverID = socket.id;
  });
  socket.emit("join-room", { senderID, receiverID });
});

socket.on("wrong-code", () => {
  alert("Wrong code");
});

socket.on("not-allowed", () => {
  alert("Maximum limit reached. Can't join");
});

socket.on("file-transfer", (fileData) => {
  const mimeType = fileData.mimeType;
  const blob = new Blob([fileData.data], { type: mimeType });
  const extension = mimeType.split("/")[1];
  const filesContainer = document.getElementById("files-container");
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${fileData.name}.${extension}`;
  downloadLink.innerText = `${fileData.name}`;

  downloadLink.addEventListener("click", () => {
    URL.revokeObjectURL(downloadLink.href);
  });

  filesContainer.appendChild(downloadLink);
  filesContainer.appendChild(document.createElement('br'))
});
