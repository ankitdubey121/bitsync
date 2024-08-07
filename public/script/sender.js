// const socket = io("http://localhost:3000");
const socket = io("https://bitsync.onrender.com");
let notificationCount = 0;

const zip = new JSZip();
let sendAllowed = false;
sizeArray = [];
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

const senderID = generateUUID();
receiverID = "";
socket.emit("create-room", { senderID });

socket.on("init", (data) => {
  // sendFile()
  receiverID = data.receiverid;
  // alert('Receiver Joined');
  showAlert("success", "Receiver Joined");
  sendAllowed = true;
});

// Handling the chatbox minimized
document.addEventListener("DOMContentLoaded", function () {
  const chatBoxParent = document.querySelector(".chatBoxParent");
  let typingTimeout;
  chatBoxParent.addEventListener("click", function (e) {
    // If the click is on an input, textarea, or button, don't toggle
    if (e.target.closest("input, textarea, button")) {
      return;
    }
    chatBoxParent.classList.toggle("minimized");
    const notificationCountElement = document.getElementById('notificationCount')
    notificationCountElement.style.display = "none"
    notificationCount = 0;
  });
  
});

function getTotalFileSize(files) {
  let totalFileSize = 0;
  const numFiles = files.length;

  for (let i = 0; i < numFiles; i++) {
    totalFileSize += files[i].size;
  }

  if (totalFileSize > 1024 * 1024 * 1024) {
    return (totalFileSize / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  } else if (totalFileSize > 1024 * 1024) {
    return (totalFileSize / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (totalFileSize / 1024).toFixed(2) + " KB";
  }
}

function checkFileSize(file) {
  let totalFileSize = 0;
  const numFiles = file.length;
  for (let i = 0; i < numFiles; i++) {
    totalFileSize += file[i].size;
    sizeArray.push(file[i].size);
  }
  return totalFileSize / (1024 * 1024 * 1024).toFixed(2);
}

const fileInput = document.getElementById("file-input");
const sendbtn = document.getElementById("send-btn");
sendbtn.addEventListener("click", () => {
  if (!sendAllowed && fileInput.files.length == 0) {
    showAlert("error", "Select files");
  }
});

fileInput.addEventListener("change", (e) => {
  if (sendAllowed) {
    const file = e.target.files;
    const numFiles = file.length;
    const totalSize = getTotalFileSize(file); /* mb ya fir gb */
    const totalFileSizeInGB = checkFileSize(file); /* GB */
    if (numFiles < 11 && totalFileSizeInGB < 2) {
      showAlert("success", `${numFiles} file(s) uploaded | ${totalSize}`);
      sendbtn.onclick = () => {
            sendFiles(file);
          }
    } else {
      showAlert("warning", "Limit Exceeded!");
    }
  } else {
    showAlert("warning", "Ask receiver to join");
  }
});

const fileDropArea = document.getElementById("drop-area");
const dropFeedback = document.getElementById("dropFeedback");
// Event listeners for drag and drop events
fileDropArea.addEventListener("dragenter", handleDragEnter);
fileDropArea.addEventListener("dragover", handleDragOver);
fileDropArea.addEventListener("dragleave", handleDragLeave);
fileDropArea.addEventListener("drop", handleDrop);

function handleDragEnter(e) {
  e.preventDefault();
}
function handleDragOver(e) {
  e.preventDefault();
  dropFeedback.classList.add("drag-over");
}
function handleDragLeave(e) {
  e.preventDefault();
  dropFeedback.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  dropFeedback.classList.remove("drag-over");
  handleFiles(e.dataTransfer.files);
}

function handleFileInputChange(e) {
  handleFiles(e.target.files);
}

function handleFiles(files) {
  // Handle the files here as you did before
  const numFiles = files.length;
  const totalSize = getTotalFileSize(files);
  const totalFileSizeInGB = checkFileSize(files);

  if (numFiles < 11 && totalFileSizeInGB < 2) {
    showAlert("success", `${numFiles} file(s) uploaded | ${totalSize}`);
    if (sendAllowed) {
      sendbtn.onclick = () => {
        sendFiles(files);
      };
    } else {
      showAlert("warning", "Ask receiver to join");
    }
  } else {
    showAlert("warning", "Limit Exceeded!");
  }
}

function sendFiles(file) {
  // const file = fileInput.files;
  const numFiles = file.length;
  const sizeArray = [];
  let totalFileSize = 0;

  totalFileSize = checkFileSize(file);

  if (numFiles < 11) {
    if (totalFileSize < 2) {
      const startTime = performance.now();
      sendbtn.innerText = "Sending";
      sendbtn.disabled = true;
      const formData = new FormData();
      for (let i = 0; i < numFiles; i++) {
        const fileName = file[i].name;
        // const file = file[i];
        const fileSizeInMB = file[i].size / (1024 * 1024);
        sizeArray.push(fileSizeInMB);
        formData.append("files[]", file[i], fileName, fileSizeInMB);
      }

      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            sendbtn.innerText = "Send ▶";
            sendbtn.disabled = false;
            const endTime = performance.now();

            // Calculate elapsed time in milliseconds
            const elapsedTime = endTime - startTime;
            const tempFile = formData.get("files[]", 2);
            const tempSize = tempFile.size / (1024 * 1024);
            // Convert elapsed time to seconds
            const elapsedSeconds = elapsedTime / 1000;
            // Speed to send the file in Mbps
            const tempSpeed = (tempSize / elapsedSeconds).toFixed(2);
            showAlert(
              "success",
              `${numFiles} file(s) sent in ${elapsedSeconds.toFixed(2)}s ⚡️`
            );
            console.log(
              `${numFiles} file(s) sent in ${elapsedSeconds.toFixed(
                2
              )}s ⚡️ | Avg speed : ${tempSpeed}mb/s`
            );
            fileInput.value = "";
          } else {
            showAlert("error", "Sending Unsuccessful");
          }
        })
        .catch((error) => {
          showAlert("error", "Error: " + error);
        });
    } else {
      // alert('File Size Exceeded!');
      showAlert("warning", "File Size Exceeded!");
    }
  } else {
    // alert('Maximum number of Files exceeded!');
    showAlert("warning", "Maximum number of Files exceeded!");
  }
}

socket.on("room-created", (roomCode) => {
  const codeArea = document.createElement("textarea");
  const roomCodeDiv = document.getElementById("room-info");
  codeArea.id = "copy-code";
  codeArea.classList.add("code");
  codeArea.rows = "1";
  codeArea.disabled = true;
  roomCodeDiv.appendChild(codeArea);
  codeArea.innerText = roomCode;
});

function copyText() {
  const copyCode = document.getElementById("copy-code").value;

  navigator.clipboard
    .writeText(copyCode)
    .then(() => {
      // alert("Copied: " + copyCode);
      showAlert("success", "Copied: " + copyCode);
    })
    .catch((error) => {
      showAlert("error", "Unable to copy text to clipboard:", error);
    });
}

// Receiver left
socket.on("left", (data) => {
  if (data == receiverID) {
    showAlert("warning", "Receiver left");
    sendAllowed = false;
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
    // console.log(document.getElementsByClassName("chat-messages"));
    socket.emit("msgFromSender", { message });
    document.getElementById("message-input").value = "";
  } else {
    showAlert("warning", "Ask receiver to join first");
  }
});

socket.on("msgFromReceiver", (data) => {
  let newMessageDiv = document.createElement("div");
  newMessageDiv.classList.add("message", "pl-2", "text-left", "bg-light");
  newMessageDiv.innerText = `${data.message}`;
  document
    .getElementsByClassName("chat-messages")[0]
    .appendChild(newMessageDiv); // Access the first element
  // console.log(document.getElementsByClassName("chat-messages"));
  const notificationSound = document.getElementById("notificationSound");
  notificationSound.play().catch(error => {
    console.error("Error playing sound: ", error)});
  isMinimized = document.getElementById('chatButton').classList.contains('minimized')
  if(isMinimized){
    notificationCount++;
    const notificationCountElement = document.getElementById('notificationCount')
    notificationCountElement.innerText = notificationCount;
    notificationCountElement.style.display = "inline-block"
    notificationCountElement.style.backgroundColor = 'green'
  }
});

document.getElementById("message-input").addEventListener("input", function () {
  if (sendAllowed) {
    let typingTimeout;
    // console.log("sender is typing");
    socket.emit("senderTyping", { typing: true });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("senderTyping", { typing: false });
    }, 2000); // User is considered stopped typing after 2 seconds of inactivity
  }
});

socket.on("receiverTyping", (data) => {
  if (data.typing) {
    document.getElementById("typing-status").innerText = "Receiver is Typing";
  } else {
    document.getElementById("typing-status").innerText = "";
  }
});
