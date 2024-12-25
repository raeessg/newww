from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)

# Enable CORS
CORS(app)

# Adjust the path to the main.py file
SCRIPT_PATH = os.path.join(os.getcwd(), "main.py")

@app.route('/run_face_detection', methods=['GET'])
def run_face_detection():
    try:
        # Execute main.py using the full path
        subprocess.run(['python', SCRIPT_PATH], check=True)
        return jsonify({"message": "Face detection completed successfully!"}), 200
    except subprocess.CalledProcessError:
        return jsonify({"message": "Error running face detection."}), 500

if __name__ == '__main__':
    app.run(debug=True)
