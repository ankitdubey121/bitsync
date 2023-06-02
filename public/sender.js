const socket = io('https://bitsync.onrender.com')

function generateUUID() {
var code = '';
for (var i = 0; i < 3; i++) {
    var segment = Math.floor(Math.random() * 256).toString(16);
    if (segment.length < 2) {
    segment = '0' + segment; // Pad with leading zero if necessary
    }
    code += segment + '-';
}
return code.slice(0, -1); // Remove the trailing dash
}  

const senderID = generateUUID()
console.log(senderID)
receiverID = ''
socket.emit('create-room', {senderID});

socket.on('init', (data) => {
    // sendFile()
    console.log("Inside init event and displaying receiver id")
    receiverID = data
    console.log(receiverID)
});

const fileInput = document.getElementById('file-input')
fileInput.addEventListener('change', (event)=>{
    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => {
    if (response.ok) {
      console.log('File uploaded successfully');
    } else {
      console.error('File upload failed');
    }
  })
  .catch(error => {
    console.error('An error occurred during file upload:', error);
  });

})

socket.on('room-created', (roomCode)=>{
    const h2 = document.createElement('h2');
    h2.innerText = "Roomcode : " + roomCode
    document.body.appendChild(h2)
})