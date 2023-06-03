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
});

const fileInput = document.getElementById("file-input");
const sendbtn = document.getElementById("send-btn");
sendbtn.addEventListener("click", (event) => {
  // fileInput.addEventListener('change', (event)=>{
  const numFiles = fileInput.files.length;
  console.log(fileInput.files);
  console.log("Number of files selected:", numFiles);
  // if (numFiles > 1) {
  //   console.log(event.target);
  //   for (let i = 0; i < numFiles; i++) {
  //     const file = fileInput.files[i];
  //     const fileName = file.name;
  //     zip.file(fileName, file);
  //   }

  //     zip.generateAsync({ type: "blob" }).then((zipData) => {
  //       // Send the zip file to the receiver
  //       // You can use AJAX or WebSocket to send the zipData to the receiver
  //       // For example, using Fetch API for AJAX:
  //       console.log(zipData)
  //       fetch("/upload", {
  //         method: "POST",
  //         body: zipData,
  //       })
  //         .then((response) => {
  //           if (response.ok) {
  //             console.log("Zip file uploaded successfully");
  //           } else {
  //             console.error("Zip file upload failed");
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("An error occurred during zip file upload:", error);
  //         });
  //     });
  // } else {
  // Add each file to the form data
  const formData = new FormData();
  for (let i = 0; i < numFiles; i++) {
    const file = fileInput.files[i];
    const fileName = file.name;
    formData.append("files[]", file, fileName);
  }

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("File uploaded successfully");
      } else {
        console.error("File upload failed");
      }
    })
    .catch((error) => {
      console.error("An error occurred during file upload:", error);
    });
  // }
});

socket.on("room-created", (roomCode) => {
  const h2 = document.createElement("h2");
  h2.innerText = "Roomcode : " + roomCode;
  document.body.appendChild(h2);
});
