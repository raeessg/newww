from flask import Flask, request, jsonify
import cv2
import face_recognition
import pickle
import numpy as np

app = Flask(__name__)

# Load encoded data
with open('EncodeFile.p', 'rb') as file:
    encodeListKnownWithIds = pickle.load(file)
encodeListKnown, studentIds = encodeListKnownWithIds

@app.route('/detect', methods=['POST'])
def detect_faces():
    file = request.files['image']
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # Perform face detection
    face_locations = face_recognition.face_locations(img)
    face_encodings = face_recognition.face_encodings(img, face_locations)

    matches = []
    for encodeFace in face_encodings:
        results = face_recognition.compare_faces(encodeListKnown, encodeFace)
        matches.append(results)

    return jsonify({"matches": matches})

if __name__ == "__main__":
    app.run(debug=True)
