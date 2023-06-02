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
receiverID = ''



const joinBtn = document.getElementById('joinBtn')


joinBtn.addEventListener('click', ()=>{
    let senderID = document.getElementById('roomCode').value
    socket.on('connect', ()=>{
        receiverID = socket.id;
    })
    socket.emit('join-room', {senderID, receiverID});
})

socket.on('wrong-code', ()=>{
    alert('Wrong code')   
})

socket.on('not-allowed', ()=>{
    alert("Maximum limit reached. Can't join")
})
 

socket.on('file-transfer', (fileData) => {
    // Get the MIME type from the received file data
    const mimeType = fileData.mimeType;
    console.log(mimeType);
    // // Create a Blob object from the file data and MIME type
    const blob = new Blob([fileData.data], { type: mimeType });
  
    // // Get the file extension based on the MIME type
    const extension = mimeType.split('/')[1];

    // // Create a temporary download link to download the file
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${fileData.name}.${extension}`; // Set desired filename with the appropriate extension
    downloadLink.click()
  });
  