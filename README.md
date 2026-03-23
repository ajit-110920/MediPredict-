# 🩺 MediPredict – Healthcare Predictive Analytics System

A full-stack machine learning application that predicts diabetes risk using patient health data and provides real-time analytics through an interactive dashboard.

---

## 🚀 Project Overview

MediPredict is an end-to-end healthcare analytics system designed to:

* Predict whether a patient is likely to have diabetes
* Provide data-driven insights using interactive dashboards
* Store prediction history for future analysis

This project integrates **Machine Learning, Web Development, Data Visualization, and Database Management** into a single system.

---

## 🌟 Key Features

### 🤖 AI Prediction Engine

* Logistic Regression model trained on healthcare dataset
* Real-time prediction via Flask API
* Probability-based classification with optimized threshold

### 📊 Analytics Dashboard

* Built using Power BI
* Visualizes:

  * Patient distribution (Diabetic vs Healthy)
  * Glucose level trends
  * Age distribution
  * BMI vs Glucose correlation

### 🗄️ Database Integration

* MySQL database stores:

  * Patient inputs
  * Prediction results
  * Timestamp

### 🌐 Web Application

* Flask-based backend
* HTML/CSS frontend
* Interactive form for prediction

---

## 🏗️ System Architecture

```
User Input (Web UI)
        ↓
Flask API (Backend)
        ↓
ML Model (Logistic Regression)
        ↓
Prediction Output
        ↓
MySQL Database (Storage)
        ↓
Power BI Dashboard (Visualization)
```

---

## 🛠️ Tech Stack

### 🔹 Machine Learning

* Python
* Scikit-learn
* Pandas, NumPy

### 🔹 Backend

* Flask

### 🔹 Frontend

* HTML, CSS, JavaScript

### 🔹 Visualization

* Power BI

### 🔹 Database

* MySQL

### 🔹 Tools

* Git & GitHub
* VS Code

---

## 📊 Machine Learning Details

* Model: Logistic Regression
* Problem Type: Binary Classification
* Target: Diabetes (0 = No, 1 = Yes)

### ✔ Key Improvements

* Handled missing values (0 → median)
* Feature scaling using StandardScaler
* Threshold tuning to improve recall (healthcare-focused)

### 📈 Final Performance

| Metric    | Value |
| --------- | ----- |
| Accuracy  | ~76%  |
| Precision | ~59%  |
| Recall    | ~77%  |
| F1 Score  | ~0.66 |
| AUC       | ~0.86 |

👉 Model optimized for **higher recall** to reduce missed diabetic cases.

---

## 📸 Project Screenshots

### 🔹 1. Prediction Web Interface

![Prediction UI](./screenshots/prediction_ui.png)

### 🔹 2. Power BI Dashboard

![Dashboard](./screenshots/dashboard.png)

### 🔹 3. Database Records (MySQL)

![Database](./screenshots/database.png)

---

## 📂 Project Structure

```
MediPredict/
│
├── app.py                      # Flask application
├── modelForPrediction.pickle   # Trained ML model
├── standardScalar.pickle       # Scaler
├── diabetes.csv                # Dataset
├── cleaned_data.csv            # Processed dataset
├── requirements.txt
│
├── templates/                  # HTML files
├── static/                     # CSS/JS
├── screenshots/                # Images for README
│
└── notebooks/
    └── EDA_and_Model.ipynb
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repo-link>
cd MediPredict
```

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Setup Database (MySQL)

```sql
CREATE DATABASE healthcare_db;

CREATE TABLE patient_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregnancies INT,
    glucose FLOAT,
    bmi FLOAT,
    age INT,
    outcome INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5️⃣ Run Application

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000/
```

---

## 🧠 Key Insights from Analysis

* High glucose levels strongly indicate diabetes
* BMI > 30 significantly increases risk
* Age contributes but is not a sole predictor
* Combination of BMI + Glucose is highly predictive

---

## 👥 Team Members

* Ajit Bhandekar
* Harsh Palkrutwar
* Dhanesh Thite

---

## 🎯 Future Improvements

* Add multi-disease prediction (Heart, Liver, Kidney)
* Deploy on AWS (EC2 + RDS)
* Add authentication system
* Improve model using advanced algorithms

---

## 📌 Conclusion

MediPredict demonstrates how machine learning can be integrated with web technologies and dashboards to build a real-world healthcare decision support system.

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
