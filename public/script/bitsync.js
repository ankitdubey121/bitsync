
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

document.getElementById('mySlider').addEventListener('click', function() {
  this.classList.toggle('active');
});



// Function to toggle dark mode
function toggleDarkMode() {
  var body = document.querySelector('body');
  body.classList.toggle('dark-mode');

  // Store the state of dark mode in localStorage
  var isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

// Check the stored state of dark mode and apply it on page load
document.addEventListener('DOMContentLoaded', function() {
  var isDarkMode = localStorage.getItem('darkMode');
  var body = document.querySelector('body');
  const toggleSwitch = document.querySelector('#toggleSwitch');

  if (isDarkMode === 'true') {
    toggleSwitch.checked = true;
    body.classList.add('dark-mode');
  }
});









