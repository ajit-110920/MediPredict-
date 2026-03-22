from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd
import os
import mysql.connector # Added for Database

app = Flask(__name__)

# --- DATABASE CONFIGURATION ---
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",      # Change this to your AWS RDS endpoint later
        user="root",           # Your MySQL username
        password="root123", # Your MySQL password
        database="healthcare_db" # The database name you created
    )

# Load core files
model_path = 'modelForPrediction.pickle'
scaler_path = 'standardScalar.pickle'
csv_path = 'diabetes.csv'

with open(model_path, 'rb') as f:
    model = pickle.load(f)

with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

df = pd.read_csv(csv_path)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    # Fill any missing values with 0 so JSON doesn't break
    local_df = df.fillna(0)

    # Outcome distribution
    outcome_counts = local_df['Outcome'].value_counts().to_dict()

    # Glucose averages by outcome
    glucose_means = local_df.groupby('Outcome')['Glucose'].mean().to_dict()

    # Age distribution
    age_counts = local_df['Age'].value_counts().sort_index().to_dict()
    age_labels = list(age_counts.keys())
    age_values = list(age_counts.values())
    
    # Scatter data (BMI vs Glucose)
    scatter_data = local_df[['BMI', 'Glucose', 'Outcome']].to_dict(orient='records')

    # FIXED: jsonify and the bracket must be on the same line!
    return jsonify({
        'success': True,
        'averages': local_df.mean().to_dict(),
        'count': len(local_df),
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
        
        # ML Logic
        features_arr = np.array([features])
        scaled_features = scaler.transform(features_arr)
        prediction = model.predict(scaled_features)
        
        # Result logic
        numeric_result = int(prediction[0])
        result_text = "Diabetic" if numeric_result == 1 else "Non-Diabetic"
        
        # --- SAVE TO DATABASE ---
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """INSERT INTO patient_predictions 
                       (pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi, dpf, age, outcome) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(query, (
                features[0], features[1], features[2], features[3], 
                features[4], features[5], features[6], features[7], numeric_result
            ))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as db_err:
            print(f"Database Error: {db_err}") # Don't stop the app if DB fails

        return jsonify({
            'success': True,
            'prediction': result_text,
            'probability': float(model.predict_proba(scaled_features)[0][1]) if hasattr(model, "predict_proba") else None
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
