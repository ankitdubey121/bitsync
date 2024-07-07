const socket = io("http://localhost:3000");
// const socket = io("https://bitsync.onrender.com");

receiverID = "";
sendAllowed = false;

const joinBtn = document.getElementById("joinBtn");
const codeDiv = document.getElementById("roomCode");

// Handling the chatbox minimized
document.addEventListener("DOMContentLoaded", function () {
  const chatBoxParent = document.querySelector(".chatBoxParent");

  chatBoxParent.addEventListener("click", function (e) {
    // If the click is on an input, textarea, or button, don't toggle
    if (e.target.closest("input, textarea, button")) {
      return;
    }
    chatBoxParent.classList.toggle("minimized");
  });
});

codeDiv.addEventListener("keyup", handleInput);

function handleInput(e) {
  const maxInputLength = 8; // Maximum input length including -s
  let userInput = e.target.value;
  if (userInput.length > maxInputLength) {
    userInput = userInput.slice(0, maxInputLength); // Limit the input length
  }
  codeDiv.value = userInput;
}

joinBtn.addEventListener("click", () => {
  let val = "";
  const roomCodeInput = document.getElementById("roomCode");
  const roomcode = roomCodeInput.value;
  let formattedRoomCode = "";
  if (roomcode[2] == "-" && roomcode[5] == "-") {
    formattedRoomCode = roomcode;
  } else {
    const top = roomcode.slice(0, 2);
    const middle = roomcode.slice(2, 4);
    const bottom = roomcode.slice(4);
    val = top + "-" + middle + "-" + bottom;
    formattedRoomCode = val;
  }
  codeDiv.value = formattedRoomCode;
  socket.on("connect", () => {
    receiverID = socket.id;
  });

  socket.emit("join-room", { roomcode: formattedRoomCode, receiverID });
});

// Function to download all files in zip

function downloadZipFile() {
  var zip = new JSZip();
  var divElement = document.getElementById("files-container");
  var anchorTags = divElement.getElementsByTagName("a");

  var hrefs = Array.from(anchorTags).map(function (anchor) {
    return anchor.getAttribute("href");
  });

  var downloads = Array.from(anchorTags).map(function (download) {
    return download.getAttribute("download");
  });

  var promises = [];

  for (var i = 0; i < hrefs.length; i++) {
    (function (index) {
      var link = document.createElement("a");
      link.href = hrefs[index];
      link.download = downloads[index];
      link.style.display = "none";
      document.body.appendChild(link);
      document.body.removeChild(link);

      promises.push(
        fetch(link.href)
          .then(function (response) {
            return response.blob();
          })
          .then(function (blob) {
            zip.file(downloads[index], blob);
          })
      );
    })(i);
  }

  Promise.all(promises).then(function () {
    zip.generateAsync({ type: "blob" }).then(function (content) {
      var downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = "all_files.zip";
      downloadLink.click();
    });
  });
}

socket.on("init", (data) => {
  showAlert("success", "Joined room");
  const dashedInfo = document.getElementById("dashedInfo");
  dashedInfo.style.display = "none";
  sendAllowed = true;
  const receiverMain = document.getElementById("receiver-main");
  const displayCodeDiv = document.createElement("input");
  displayCodeDiv.disabled = true;
  displayCodeDiv.value = "Joined: " + codeDiv.value;
  displayCodeDiv.classList.add("r-code");
  displayCodeDiv.style.width = "50%";
  const joinBtn = document.getElementById("joinBtn");
  joinBtn.style.display = "none";
  codeDiv.style.display = "none";
  receiverMain.insertBefore(displayCodeDiv, joinBtn);
  senderSocketID = data.senderid;
  const load = document.getElementById("load-section");
  load.style.display = "flex";
});

socket.on("wrong-code", () => {
  showAlert("error", "Wrong code");
});

socket.on("not-allowed", () => {
  showAlert("warning", "Maximum limit reached. Can't join");
});

let countFiles = 0;
socket.on("file-transfer", (fileData) => {
  countFiles += 1;
  console.log(countFiles);
  const mimeType = fileData.mimeType;
  const blob = new Blob([fileData.data], { type: mimeType });
  const blobSize = (blob.size / (1024 * 1024)).toFixed(2);
  if (mimeType == "text/plain") {
    extension = "txt";
  } else {
    extension = mimeType.split("/")[1];
  }
  const fileCount = fileData.fileCount;
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${fileData.name}.${extension}`;
  downloadLink.innerText = `Download`;

  downloadLink.addEventListener("click", () => {
    setTimeout(() => {
      URL.revokeObjectURL(downloadLink.href);
    }, 100);
  });

  const tbody = document.getElementById("tbody");

  const tr = document.createElement("tr");
  tbody.appendChild(tr);
  fileData.name = fileData.name.slice(0, 15);
  const tdFileName = document.createElement("td");
  tdFileName.textContent = `${fileData.name}.${extension}`;
  tdFileName.classList.add("text-left");

  const tdFileSize = document.createElement("td");
  tdFileSize.textContent = blobSize + "MB";

  const tdAction = document.createElement("td");
  downloadLink.classList.add("btn", "btn-sm", "btn-secondary");
  tdAction.appendChild(downloadLink);

  tr.appendChild(tdFileName);
  tr.appendChild(tdFileSize);
  tr.appendChild(tdAction);

  const load = document.getElementById("load-section");
  load.style.opacity = "0";
  if (fileCount == countFiles && fileCount > 2) {
    const downloadRow = document.createElement("div");
    downloadRow.classList.add("row", "text-center");
    const downloadCol = document.createElement("div");
    downloadCol.classList.add("col-12", "text-center");
    const downloadAllBtn = document.createElement("a");
    downloadAllBtn.classList.add("btn", "btn-primary", "btn-sm", "text-white");
    downloadAllBtn.style.textDecoration = "none";
    downloadAllBtn.style.outline = "none";
    downloadAllBtn.innerText = "Download All";
    downloadCol.appendChild(downloadAllBtn);
    downloadRow.appendChild(downloadCol);
    const receiverMain = document.getElementById("receiver-main");
    receiverMain.append(downloadRow);
    downloadAllBtn.onclick = downloadZipFile;
  }
});

// Room left
socket.on("left", (data) => {
  if (senderSocketID == data) {
    showAlert("warning", "Sender left");
  }
});

var sendMsgBtn = document.getElementById("sendMsg");

sendMsgBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (sendAllowed) {
    var message = document.getElementById("message-input").value;
    let newMessageDiv = document.createElement("div");
    newMessageDiv.classList.add("message", "text-right");
    newMessageDiv.innerText = `${message}`;
    document
      .getElementsByClassName("chat-messages")[0]
      .appendChild(newMessageDiv); // Access the first element
    console.log(document.getElementsByClassName("chat-messages"));
    socket.emit("msgFromReceiver", { message });
    document.getElementById("message-input").value = "";
  } else {
    showAlert("warning", "Ask sender to join first");
  }
});

socket.on("msgFromSender", (data) => {
  console.log(data.message);
  let newMessageDiv = document.createElement("div");
  newMessageDiv.classList.add("message", "pl-2", "text-left", "bg-light");
  newMessageDiv.innerText = `${data.message}`;
  document
    .getElementsByClassName("chat-messages")[0]
    .appendChild(newMessageDiv); // Access the first element
  console.log(document.getElementsByClassName("chat-messages"));
  document.getElementsByClassName("typing-status").innerText = "";
});

socket.on("senderTyping", (data) => {
  if (data.typing) {
    document.getElementById("typing-status").innerText = "Sender is Typing";
  } else {
    document.getElementById("typing-status").innerText = "";
  }
});

document.getElementById("message-input").addEventListener("input", function () {
  if (sendAllowed) {
    let typingTimeout;
    console.log("Receiver is typing");
    socket.emit("receiverTyping", { typing: true });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("receiverTyping", { typing: false });
    }, 2000); // User is considered stopped typing after 2 seconds of inactivity
  }
});
