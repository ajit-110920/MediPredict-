from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

# Load core files
model_path = 'modelForPrediction.pickle'
scaler_path = 'standardScalar.pickle'
csv_path = 'diabetes.csv'

with open(model_path, 'rb') as f:
    model = pickle.load(f)

with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

# Load dataset for analytics
df = pd.read_csv(csv_path)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    # Outcome distribution
    outcome_counts = df['Outcome'].value_counts().to_dict()
    
    # Glucose averages by outcome
    glucose_means = df.groupby('Outcome')['Glucose'].mean().to_dict()
    
    # Age distribution
    age_counts = df['Age'].value_counts().sort_index().to_dict()
    age_labels = list(age_counts.keys())
    age_values = list(age_counts.values())
    
    # Scatter data (BMI vs Glucose)
    scatter_data = df[['BMI', 'Glucose', 'Outcome']].to_dict(orient='records')
    
    return jsonify({
        'success': True,
        'averages': df.mean().to_dict(),
        'count': len(df),
        'outcome_distribution': {
            'labels': ['Healthy', 'Diabetic'],
            'data': [int(outcome_counts.get(0, 0)), int(outcome_counts.get(1, 0))]
        },
        'glucose_comparison': {
            'labels': ['Healthy', 'Diabetic'],
            'data': [float(glucose_means.get(0, 0)), float(glucose_means.get(1, 0))]
        },
        'age_distribution': {
            'labels': [int(a) for a in age_labels],
            'data': [int(v) for v in age_values]
        },
        'scatter_data': scatter_data
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.json
        features = [
            float(data['pregnancies']),
            float(data['glucose']),
            float(data['bloodPressure']),
            float(data['skinThickness']),
            float(data['insulin']),
            float(data['bmi']),
            float(data['dpf']),
            float(data['age'])
        ]
        
        # Reshape and scale features
        features_arr = np.array([features])
        scaled_features = scaler.transform(features_arr)
        
        # Prediction
        prediction = model.predict(scaled_features)
        result = "Diabetic" if prediction[0] == 1 else "Non-Diabetic"
        
        return jsonify({
            'success': True,
            'prediction': result,
            'probability': float(model.predict_proba(scaled_features)[0][1]) if hasattr(model, "predict_proba") else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)
