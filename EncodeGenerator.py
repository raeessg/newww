import cv2
import face_recognition
import pickle
import os

# Folder where student images are stored
folderPath = 'Images'
# Ensure the folder exists
if not os.path.exists(folderPath):
    os.makedirs(folderPath)

imgList = []
studentIds = []

# Fetching all the images from the 'Images' folder
pathList = os.listdir(folderPath)
print(pathList)

# Reading the images and extracting student IDs
for path in pathList:
    img = cv2.imread(os.path.join(folderPath, path))
    if img is not None:
        imgList.append(img)
        studentIds.append(os.path.splitext(path)[0])  # Student ID is derived from image filename without extension
    else:
        print(f"Error reading image: {path}")

# Function to find encodings for the given images
def findEncodings(imagesList):
    encodeList = []
    for img in imagesList:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(img)
        if encodings:
            encodeList.append(encodings[0])  # Append the first encoding if found
        else:
            print("No face found in image.")
    return encodeList

# Encoding the student images
print("Encoding Started ...")
encodeListKnown = findEncodings(imgList)
encodeListKnownWithIds = [encodeListKnown, studentIds]
print("Encoding Complete")

# Saving the encodings to a file locally
filePath = 'EncodeFile.p'  # Local path for storing encodings
with open(filePath, 'wb') as file:
    pickle.dump(encodeListKnownWithIds, file)
print("File Saved Successfully")
