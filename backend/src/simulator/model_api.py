# backend/src/simulator/model_api.py
from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# Robust path
model_path = os.path.join(os.path.dirname(__file__), 'random_forest_model.pkl')
print('Loading model from:', model_path)

# Load the model
model = joblib.load(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = [float(value) for key, value in data.items() if key != 'label']

    prediction = model.predict([features])[0]

    return jsonify({'prediction': int(prediction)})

if __name__ == '__main__':
    app.run(port=5000)
