const socket = io("http://localhost:3000");
const zip = new JSZip();
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
console.log(senderID);
receiverID = "";
socket.emit("create-room", { senderID });

socket.on("init", (data) => {
  // sendFile()
  console.log("Inside init event and displaying receiver id");
  receiverID = data;
  console.log(receiverID);
  alert('Receiver Joined');
});

const messageInfo = {
  success: 'File Uploaded Successfully',
  err: 'File Upload Failed',
  errExp: 'An error occurred during file upload'
};

const createMsgBox = (num,msg,color) =>{

  const messageBox = document.getElementById('message-box');
  messageBox.style.display='grid';
  const message = document.createElement('p');
  message.classList.add('message');
  message.style.backgroundColor = color;
  message.innerText = `${num} ${msg}`;
  messageBox.appendChild(message);
  console.log('created');
  // setTimeout(messageBox.style.display='none',3000);
  setTimeout(() => {
    messageBox.style.display='none';
  }, 3000);
}

const fileInput = document.getElementById("file-input");
const sendbtn = document.getElementById("send-btn");
sendbtn.addEventListener("click", (event) => {
  // fileInput.addEventListener('change', (event)=>{
  const file = fileInput.files;
  const numFiles = file.length;
  const sizeArray = [];
  let totalFileSize = 0;

  for(let i=0; i<numFiles; i++){
    totalFileSize+= file[i].size;
  }

  totalFileSize = (totalFileSize/(1024*1024*1024)).toFixed(2);

  console.log(totalFileSize);
  if(numFiles<11){
    if(totalFileSize<2){
      console.log(file);
      console.log("Number of files selected:", numFiles);
      const formData = new FormData();
      for (let i = 0; i < numFiles; i++) {
        const fileName = file[i].name;
        // const file = file[i];
        const fileSizeInMB = file[i].size/(1024 * 1024);
        sizeArray.push(fileSizeInMB.toFixed(2));
        formData.append("files[]", file[i], fileName, fileSizeInMB);
      }

      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log("File uploaded successfully " + sizeArray);
            createMsgBox(numFiles,'File(s) Sent','green');
            // setTimeout(createMsgBox(numFiles,'File(s) Sent','green'),1000);
          } else {
            createMsgBox(file.name,messageInfo.err, 'red');
          }
        })
        .catch((error) => {
          // createMsgBox('',messageInfo.errExp +': '+error, 'red');
          console.log(messageInfo.errExp+error);
        });
       }
  else{
    alert('File Size Exceeded!');
  }
  }
  else{
    alert('Maximum number of Files exceeded!');
  }
});

socket.on("room-created", (roomCode) => {
  const codeArea = document.createElement("textarea");
  const roomCodeDiv = document.getElementById('room-info');
  codeArea.id = 'copy-code';
  codeArea.classList.add('code');
  codeArea.rows = '1';
  codeArea.disabled = true;
  roomCodeDiv.appendChild(codeArea);
  codeArea.innerText = roomCode;
});

function copyText() {
  const copyCode = document.getElementById("copy-code").value;

  navigator.clipboard
    .writeText(copyCode)
    .then(() => {
      alert("Copied: " + copyCode);
    })
    .catch((error) => {
        console.error("Unable to copy text to clipboard:", error);
    });
}
