const defaultProfileImg = "Ellipse 6.png";

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
};

// Get the local storage key for a given section and date
const getStorageKey = (section) => {
    const currentDate = getCurrentDate();
    return `${section}-${currentDate}`;
};

// Save attendance data for a given section and date
const saveAttendanceData = (section, presentCount, absentCount, studentStatus) => {
    const key = getStorageKey(section);
    const data = { present: presentCount, absent: absentCount, studentStatus };
    localStorage.setItem(key, JSON.stringify(data));
};

// Load attendance data for a given section and date
const loadAttendanceData = (section) => {
    const key = getStorageKey(section);
    const data = localStorage.getItem(key);
    console.log(`Loading data for ${section}`);
    console.log('Retrieved Data:', data);
    return data ? JSON.parse(data) : { present: 0, absent: 0, studentStatus: {} };
};

// Update the UI with the current attendance data
const updateAttendanceUI = (section) => {
    const attendanceData = loadAttendanceData(section);
    const presentCount = attendanceData.present;
    const absentCount = attendanceData.absent;
    const totalStudents = presentCount + absentCount;
    const presentPercentage = totalStudents > 0 ? (presentCount / totalStudents * 100).toFixed(2) : 0;

    document.getElementById('present-count').innerText = presentCount;
    document.getElementById('absent-count').innerText = absentCount;
    document.querySelector('.ui-values').innerText = `${presentPercentage}%`;

    // Update the radio buttons based on saved studentStatus
    const studentStatus = attendanceData.studentStatus;
    Object.keys(studentStatus).forEach(id => {
        const status = studentStatus[id];
        const radioButton = document.getElementById(id);
        if (radioButton) {
            radioButton.checked = status;
            // Update the color of the radio button based on its value
            if (radioButton.value === "value1") {
                radioButton.parentElement.classList.add('present');
                radioButton.parentElement.classList.remove('absent');
            } else if (radioButton.value === "value2") {
                radioButton.parentElement.classList.add('absent');
                radioButton.parentElement.classList.remove('present');
            }
        }
    });
};

// Update the attendance counts and save to local storage
const updateCounts = (section) => {
    const presentCheckboxes = document.querySelectorAll('input[type="radio"][value="value1"]:checked');
    const absentCheckboxes = document.querySelectorAll('input[type="radio"][value="value2"]:checked');

    const presentCount = presentCheckboxes.length;
    const absentCount = absentCheckboxes.length;

    // Save the status of each radio button
    const studentStatus = {};
    document.querySelectorAll('input[type="radio"]').forEach(checkbox => {
        studentStatus[checkbox.id] = checkbox.checked;
    });

    console.log(`Saving data for ${section}`);
    console.log(`Present Count: ${presentCount}`);
    console.log(`Absent Count: ${absentCount}`);
    console.log('Student Status:', studentStatus);

    saveAttendanceData(section, presentCount, absentCount, studentStatus);
    updateAttendanceUI(section);
};

// Display saved data
const displaySavedData = (section) => {
    const attendanceData = loadAttendanceData(section);

    console.log(`Displaying saved data for ${section}`);
    console.log(`Present Count: ${attendanceData.present}`);
    console.log(`Absent Count: ${attendanceData.absent}`);
    console.log('Student Status:', attendanceData.studentStatus);

    const container = document.getElementById('saved-data');
    container.innerHTML = `
        <h2>Saved Data for ${section}</h2>
        <p>Present Count: ${attendanceData.present}</p>
        <p>Absent Count: ${attendanceData.absent}</p>
        <h3>Student Status:</h3>
        <ul>
            ${Object.entries(attendanceData.studentStatus).map(([id, status]) => `
                <li>${id}: ${status ? 'Present' : 'Absent'}</li>
            `).join('')}
        </ul>
    `;
};

// Initialize the system on page load
document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('section').value;
    if (section) {
        displaySavedData(section);
    }
});
