import os
import pickle
import numpy as np
import cv2
import face_recognition
import cvzone
from datetime import datetime
import json

# Define paths
students_db_path = 'students_data.json'  # Local database for student info and attendance data
students_images_path = 'students_images/'  # Folder for storing student images

# Create folders if they don't exist
os.makedirs(students_images_path, exist_ok=True)

# Load encoded student data
print("Loading Encode File ...")
with open('EncodeFile.p', 'rb') as file:
    encodeListKnownWithIds = pickle.load(file)
encodeListKnown, studentIds = encodeListKnownWithIds
print("Encode File Loaded")

cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)

imgBackground = cv2.imread('Resources/background.png')

# Load the local student data from JSON file
def load_student_data():
    if os.path.exists(students_db_path):
        with open(students_db_path, 'r') as f:
            return json.load(f)
    return {}

def save_student_data(student_data):
    with open(students_db_path, 'w') as f:
        json.dump(student_data, f, indent=4)

student_data = load_student_data()

# Start scanning
while True:
    success, img = cap.read()
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    imgBackground[162:162 + 480, 55:55 + 640] = img

    if faceCurFrame:
        for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)

            matchIndex = np.argmin(faceDis)

            if matches[matchIndex]:
                id = studentIds[matchIndex]
                print(f"Match found for ID: {id}")
                studentInfo = student_data.get(str(id), None)
                if studentInfo:
                    # Parse last attendance time
                    last_attendance_time = studentInfo.get('last_attendance_time', None)
                    if last_attendance_time:
                        datetimeObject = datetime.strptime(last_attendance_time, "%Y-%m-%d %H:%M:%S")
                    else:
                        datetimeObject = datetime.min  # Set to earliest possible time if not found

                    # Calculate seconds elapsed
                    secondsElapsed = (datetime.now() - datetimeObject).total_seconds()

                    # Clear the right-side message area
                    imgBackground[44:44 + 633, 808:808 + 414] = np.zeros((633, 414, 3), dtype=np.uint8)

                    # If attendance is marked recently, display message
                    if secondsElapsed <= 30:
                        cv2.putText(imgBackground, f"Marked for ID {id}", (850, 200), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255,0), 2)
                    else:
                        # Mark attendance
                        studentInfo['total_attendance'] += 1
                        studentInfo['last_attendance_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        student_data[str(id)] = studentInfo
                        save_student_data(student_data)

                        # Display message on screen for attendance marked
                        text = "Already marked"
                        cv2.putText(imgBackground, text, (850, 200), cv2.FONT_HERSHEY_COMPLEX, 0.8, (0, 255, 0), 2)

                    # Break from the loop after displaying message for that ID
                    break  # This will stop further checking once a match is found

    # Show the background with the updated message
    cv2.imshow("Face Attendance", imgBackground)

    # Wait for 3 seconds to display the message without updating the camera feed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Exiting application...")
        break

# Release the camera and close any open windows
cap.release()
cv2.destroyAllWindows()