// const socket = io("http://localhost:3000");
const socket = io("https://bitsync.onrender.com");

receiverID = "";

const joinBtn = document.getElementById("joinBtn");
const codeDiv = document.getElementById('roomCode');

codeDiv.addEventListener('keyup', (e)=>{
  let userInput = e.target.value
  if(userInput.length == 2 || userInput.length == 5){
    userInput += "-"
  }
  if(userInput.length > 8){
    newValue = userInput.slice(0, 8)
    codeDiv.value = newValue
  }
  else{
    codeDiv.value = userInput
  }
})

joinBtn.addEventListener("click", () => {
  let senderID = document.getElementById("roomCode").value;
  socket.on("connect", () => {
    receiverID = socket.id;
  });
  socket.emit("join-room", { senderID, receiverID });
});


socket.on('init',()=>{
  showAlert('success', "Joined room")
  const receiverMain = document.getElementById('receiver-main');
  const displayCodeDiv = document.createElement('input');
  displayCodeDiv.disabled = true;
  displayCodeDiv.value = 'Joined: '+codeDiv.value;
  displayCodeDiv.classList.add('r-code');
  displayCodeDiv.style.width = '50%';
  const joinBtn = document.getElementById('joinBtn');
  joinBtn.style.display = 'none';
  codeDiv.style.display = 'none';
  receiverMain.insertBefore(displayCodeDiv, joinBtn);

  const load = document.getElementById('load-section');
  load.style.display = 'flex';
});


socket.on("wrong-code", () => {
  // alert("Wrong code");
  showAlert('error',"Wrong code");
});

socket.on("not-allowed", () => {
  // alert("Maximum limit reached. Can't join");
  showAlert('warning',"Maximum limit reached. Can't join");
  
});

socket.on("file-transfer", (fileData) => {
  const mimeType = fileData.mimeType;
  const blob = new Blob([fileData.data], { type: mimeType });
  const blobSize = (blob.size/(1024*1024)).toFixed(2);
  console.log(blobSize);
  const extension = mimeType.split("/")[1];
  const fileCount = fileData.fileCount;
  const filesContainer = document.getElementById("files-container");
  
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${fileData.name}.${extension}`;
  downloadLink.innerText = `Download`;

  downloadLink.addEventListener("click", () => {
    setTimeout(()=>{
      URL.revokeObjectURL(downloadLink.href);
    },100);
  });

  // filesContainer.style.display = block;
  const tbody = document.getElementById('tbody');
  

  // for(let i=1; i<=fileCount; i++){
    const tr = document.createElement('tr');
    tbody.appendChild(tr);

    const tdFileName = document.createElement('td');
    tdFileName.textContent = `${fileData.name}.${extension}`;
    tdFileName.classList.add('text-left');

    const tdFileSize = document.createElement('td');
    tdFileSize.textContent = blobSize+'MB';

    const tdAction = document.createElement('td');
    // downloadLink.classList.add('btn','btn-secondary');
    downloadLink.id = 'download-btn';
    tdAction.appendChild(downloadLink);

    tr.appendChild(tdFileName);
    tr.appendChild(tdFileSize);
    tr.appendChild(tdAction);

    const load = document.getElementById('load-section');
    load.style.opacity = '0';
  // }

  // filesContainer.appendChild(downloadLink);
  // filesContainer.appendChild(document.createElement('br'))
});


// Room left

socket.on('left', (data)=>{
  if(socket.id != data){
    showAlert('warning', "Sender left")
  }
})