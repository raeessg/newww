const defaultProfileImg = "images/Default Dp.png";

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  const day = ("0" + today.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

// Display current date in the specified HTML element and date picker
const displayCurrentDate = (date = getCurrentDate()) => {
  const dateElement = document.getElementById("current-date");
  const datePicker = document.getElementById("date-picker");
  if (dateElement) {
    dateElement.textContent = date;
  }
  if (datePicker) {
    datePicker.value = date; // Update date picker value
  }
};

// Get the local storage key for a given section and date
const getStorageKey = (section, date = getCurrentDate()) => {
  return `${section}-${date}`;
};

// Save attendance data for a given section and date
const saveAttendanceData = (
  section,
  presentCount,
  absentCount,
  studentStatus,
  date = getCurrentDate()
) => {
  const key = getStorageKey(section, date);
  const data = { present: presentCount, absent: absentCount, studentStatus };
  localStorage.setItem(key, JSON.stringify(data));
};

// Load attendance data for a given section and date
const loadAttendanceData = (section, date = getCurrentDate()) => {
  const key = getStorageKey(section, date);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : { present: 0, absent: 0, studentStatus: {} };
};

// Update the UI with the current attendance data
const updateAttendanceUI = (section, date = getCurrentDate()) => {
  const attendanceData = loadAttendanceData(section, date);
  const presentCount = attendanceData.present;
  const absentCount = attendanceData.absent;
  const totalStudents = presentCount + absentCount;
  const presentPercentage =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : 0;

  document.getElementById("present-count").innerText = presentCount;
  document.getElementById("absent-count").innerText = absentCount;
  document.querySelector(".ui-values").innerText = `${presentPercentage}%`;

  // Update the radio buttons based on saved studentStatus
  const studentStatus = attendanceData.studentStatus;
  Object.keys(studentStatus).forEach((id) => {
    const status = studentStatus[id];
    const radioButton = document.getElementById(id);
    if (radioButton) {
      radioButton.checked = status;
      // Update the color of the radio button based on its value
      if (radioButton.value === "value1") {
        radioButton.parentElement.classList.add("present");
        radioButton.parentElement.classList.remove("absent");
      } else if (radioButton.value === "value2") {
        radioButton.parentElement.classList.add("absent");
        radioButton.parentElement.classList.remove("present");
      }
    }
  });
};

// Update the attendance counts and save to local storage
const updateCounts = (section, date = getCurrentDate()) => {
  const presentCheckboxes = document.querySelectorAll(
    'input[type="radio"][value="value1"]:checked'
  );
  const absentCheckboxes = document.querySelectorAll(
    'input[type="radio"][value="value2"]:checked'
  );

  const presentCount = presentCheckboxes.length;
  const absentCount = absentCheckboxes.length;

  // Save the status of each radio button
  const studentStatus = {};
  document.querySelectorAll('input[type="radio"]').forEach((checkbox) => {
    studentStatus[checkbox.id] = checkbox.checked;
  });

  saveAttendanceData(section, presentCount, absentCount, studentStatus, date);
  updateAttendanceUI(section, date);
};

// Fetch JSON data and populate the second select element
const fetchDepartments = async () => {
  try {
    const response = await fetch("subject.json"); // Data is in the same folder
    const data = await response.json();
    return data.departments;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
};

// Populate subjects based on selected department
const populateSubjects = async () => {
  const departments = await fetchDepartments();
  const sectionSelect = document.getElementById("section");
  const subjectSelect = document.getElementById("subject");

  sectionSelect.addEventListener("change", () => {
    const selectedDepartment = sectionSelect.value;
    subjectSelect.innerHTML =
      '<option value="" disabled selected>SELECT SUBJECT</option>';

    if (departments[selectedDepartment]) {
      departments[selectedDepartment].forEach((subject) => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
      });
    }
  });
};

// Fetch user data and initialize the attendance system
const fetchUserData = async (subject, date = getCurrentDate()) => {
  try {
    const response = await fetch(`data/${subject}.json`); // Data is named after subject
    const users = await response.json();
    const container = document.getElementById("container");
    container.innerHTML = "";

    users.forEach((user, index) => {
      const profileImg = user.profileImg || defaultProfileImg;
      const userDiv = document.createElement("div");
      userDiv.className = "colomn";
      userDiv.innerHTML = `
          <img src="${profileImg}" alt="${user.name}'s Profile" />
          <p>${user.name}</p>
          <span class="roll-number">${user.rollNumber}</span>
          <input id="radio${subject}-${index}-1" type="radio" name="example${index}" value="value1" class="present-radio" />
          <input id="radio${subject}-${index}-2" type="radio" name="example${index}" value="value2" class="absent-radio" />
        `;
      container.appendChild(userDiv);
    });

    document.querySelectorAll('input[type="radio"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => updateCounts(subject, date));
    });

    updateAttendanceUI(subject, date);
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Handle subject change event
document.getElementById("subject").addEventListener("change", (event) => {
  const selectedSubject = event.target.value;
  fetchUserData(selectedSubject);
});

// Initialize the select options on page load
document.addEventListener("DOMContentLoaded", () => {
  displayCurrentDate(); // Display current date on page load
  populateSubjects();
  document
    .querySelector(".attendance-submit-btn button")
    .addEventListener("click", handleSubmitAttendance);

  // Set the default value of the date picker
  const datePicker = document.getElementById("date-picker");
  if (datePicker) {
    datePicker.value = getCurrentDate(); // Initialize date picker with the current date
  }
});

// Load user profile data from local storage
window.onload = function () {
  const userName = localStorage.getItem("userName");
  const userPhone = localStorage.getItem("userPhone");
  const profilePhoto = localStorage.getItem("profilePhoto");

  if (userName)
    document.getElementById("nav-profile-name").textContent = userName;
  if (userPhone) document.getElementById("nav-phone").textContent = userPhone; // Ensure you have an element with this id
  if (profilePhoto)
    document.getElementById("nav-profile-pic").src = profilePhoto;
};

// Show/hide div based on subject selection
document.getElementById("subject").addEventListener("change", function () {
  const hiddenDiv = document.getElementById("mySelect");
  hiddenDiv.style.display = this.value ? "block" : "none";
});

// Add event listener to the date picker to update the attendance date
document.getElementById("date-picker").addEventListener("change", (event) => {
  const selectedDate = event.target.value;
  displayCurrentDate(selectedDate);
  const selectedSubject = document.getElementById("subject").value;
  if (selectedSubject) {
    fetchUserData(selectedSubject, selectedDate);
  }
});

// Handle attendance submission and save user profile data
function handleSubmitAttendance() {
  const userName = document.getElementById("user-name").value;
  const userPhone = document.getElementById("user-phone").value;
  const profilePhotoInput = document.getElementById("profile-photo");
  const profilePhoto = profilePhotoInput.files[0];

  if (profilePhoto) {
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("userName", userName);
      localStorage.setItem("userPhone", userPhone);
      localStorage.setItem("profilePhoto", reader.result);
    };
    reader.readAsDataURL(profilePhoto);
  } else {
    localStorage.setItem("userName", userName);
    localStorage.setItem("userPhone", userPhone);
  }
}
