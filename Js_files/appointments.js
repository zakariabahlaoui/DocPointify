// Initialize the calendar on page load
window.onload = function () {
  initializeCalendar();
};

// Function to add an appointment
function addAppointment(event) {
  event.preventDefault();

  const patientName = document.getElementById("patientNameInput").value.trim();
  const appointmentDateTime = document.getElementById(
    "appointmentDateTime"
  ).value;

  if (!patientName) {
    alert("Please enter the patient's name.");
    return;
  }

  const newAppointment = {
    id: Date.now(),
    name: patientName,
    dateTime: appointmentDateTime,
  };

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(newAppointment);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  initializeCalendar();
  document.getElementById("appointmentForm").reset();
}

// Function to delete an appointment
function deleteAppointment(appointmentId, event) {
  event.stopPropagation();

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments = appointments.filter(
    (appointment) => appointment.id !== appointmentId
  );
  localStorage.setItem("appointments", JSON.stringify(appointments));
  initializeCalendar();
}

// Function to format time for display
function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Function to initialize the calendar
function initializeCalendar() {
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.name,
    start: new Date(appointment.dateTime),
    extendedProps: {
      appointmentId: appointment.id,
      time: appointment.dateTime,
    },
  }));

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: events,
    eventContent: function (arg) {
      const appointmentId = arg.event.extendedProps.appointmentId;
      const time = formatTime(arg.event.start);
      return {
        html: `
          <div class="appointment-container">
            <div class="appointment-info">
              <span class="appointment-name" 
                onclick="showPatientInfo('${arg.event.title}')"
                style="cursor: pointer; color: blue; text-decoration: underline;"
              >
                ${arg.event.title}
              </span>
              <span class="appointment-time">${time}</span>
            </div>
            <button 
              class="delete-button" 
              onclick="deleteAppointment(${appointmentId}, event)"
              title="Delete appointment"
            >×</button>
          </div>
        `,
      };
    },
  });

  calendar.render();
}

// Function to display patient information
function showPatientInfo(patientName) {
  const appointmentDisplay = document.getElementById("appointmentDisplay");
  const entries = JSON.parse(localStorage.getItem("entries")) || [];

  // Find the patient in local storage
  const patient = entries.find(
    (entry) => entry.input1.toLowerCase() === patientName.toLowerCase()
  );

  if (patient) {
    // Display patient information
    appointmentDisplay.innerHTML = `
      <strong>Patient Name:</strong> ${patient.input1}
      <strong>Phone:</strong> ${patient.input2}
      <strong>Address:</strong> ${patient.input3}<br>
      <strong>Note:</strong> ${patient.input4}
      <strong>ID:</strong> ${patient.id || "Not Available"}<br>
    `;
  } else {
    // If no patient information is found
    appointmentDisplay.innerHTML = `
      <strong>Patient Name:</strong> ${patientName}<br>
      <em>No additional information found for this patient.</em>
    `;
  }
}

function searchPatients() {
  const input = document.getElementById("patientNameInput").value.toLowerCase();
  const searchResults = document.getElementById("searchResults");
  const entries = JSON.parse(localStorage.getItem("entries")) || [];

  // Clear previous search results
  searchResults.innerHTML = "";

  if (input.trim() === "") {
    searchResults.style.display = "none";
    return;
  }

  // Filter entries based on the input
  const filteredEntries = entries.filter((entry) =>
    entry.input1.toLowerCase().includes(input)
  );

  // Display the filtered results
  if (filteredEntries.length > 0) {
    filteredEntries.forEach((entry) => {
      const resultItem = document.createElement("div");
      resultItem.textContent = entry.input1; // Display patient name
      resultItem.style.padding = "5px";
      resultItem.style.cursor = "pointer";
      resultItem.addEventListener("click", () => selectPatient(entry.input1));
      searchResults.appendChild(resultItem);
    });
    searchResults.style.display = "block";
  } else {
    searchResults.style.display = "none";
  }
}

// Function to select a patient from the search results
function selectPatient(name) {
  const patientNameInput = document.getElementById("patientNameInput");
  patientNameInput.value = name;
  document.getElementById("searchResults").style.display = "none";
}

// Attach event listener to the form
document.getElementById("appointmentForm").onsubmit = addAppointment;
