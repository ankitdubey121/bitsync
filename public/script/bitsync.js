
function sidenav(){
  // document.getElementById("menu-icon").addEventListener("click", function () {
    document.getElementById("mySidenav").style.width = "250px";
}

document.getElementById("close-btn").addEventListener("click", function () {
  document.getElementById("mySidenav").style.width = "0";
});


/* To Deliver Message Popup*/

const showAlert = (color, message)=>{
  const alertContainer = document.getElementById('alertContainer');
  alertContainer.style.fontFamily='Arial, sans-serif';
  // Create the alert div
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', `alert-${color}`);

  // Create the icon span
  const iconSpan = document.createElement('span');
  iconSpan.classList.add('icon');

  // Set the icon based on the color
  if (color === 'success') {
    iconSpan.innerHTML = '&#10004;'; // Tick symbol
  } else if (color === 'error') {
    iconSpan.innerHTML = '&#10060;'; // Cross symbol
  } else if (color === 'warning') {
    iconSpan.innerHTML = '&#9888;'; // Caution symbol
  }

  // Create the close button
  const closeButton = document.createElement('span');
  closeButton.classList.add('close-button');
  closeButton.innerHTML = '&#10006;'; // Cross symbol
  closeButton.addEventListener('click', function() {
    alertDiv.remove(); // Remove the alert when the close button is clicked
  });

  // Append the elements to the alert div
  alertDiv.appendChild(iconSpan);
  alertDiv.appendChild(document.createTextNode(message));
  alertDiv.appendChild(closeButton);

  // Append the alert div to the container
  alertContainer.appendChild(alertDiv);

  setTimeout(function() {
    alertDiv.classList.add('show');
  }, 100);

  setTimeout(function() {
    alertDiv.classList.remove('show');
    setTimeout(function() {
      alertDiv.remove();
    }, 300); // Delay removal after animation completes
  }, 2500);
}




