let datasetStats = null;
let radarChart = null;
let populationChart = null;
let glucoseIndicatorChart = null;
let ageDistributionChart = null;
let correlationChart = null;

const COLORS = {
    primary: '#2563eb', // Blue
    success: '#10b981', // Teal/Green (Healthy)
    danger: '#ef4444',  // Red/Orange (Diabetic)
    muted: '#64748b'
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initial fetch of dataset stats
    await refreshStats();

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');

            if (tabId === 'dashboard') {
                renderAdvancedDashboard();
            }
        });
    });
});

async function refreshStats() {
    try {
        const response = await fetch('/api/stats');
        datasetStats = await response.json();
        if (datasetStats.success) {
            updateSummaryCards(datasetStats);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

function updateSummaryCards(data) {
    document.getElementById('totalRecords').textContent = data.count;
    document.getElementById('avgGlucose').textContent = Math.round(data.averages.Glucose);
}

document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const btnText = submitBtn.querySelector('.btn-text');
    const resultCard = document.getElementById('resultCard');

    submitBtn.disabled = true;
    loader.style.display = 'block';
    btnText.textContent = 'Analysing...';
    resultCard.classList.add('hidden');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            displayResult(result, data);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
        btnText.textContent = 'Analyze Medical Data';
    }
});

function displayResult(result, inputData) {
    const resultCard = document.getElementById('resultCard');
    const statusDiv = document.getElementById('predictionStatus');
    const textP = document.getElementById('predictionText');
    const probFill = document.getElementById('probFill');
    const probValue = document.getElementById('probValue');

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    statusDiv.textContent = result.prediction;
    statusDiv.className = 'prediction-status ' + (result.prediction === 'Diabetic' ? 'diabetic' : 'non-diabetic');
    
    textP.textContent = result.prediction === 'Diabetic' 
        ? "High risk detected. Immediate medical consultation is advised."
        : "Low risk detected. Continue with regular health checkups and a balanced diet.";

    if (result.probability !== null) {
        const probPct = (result.probability * 100).toFixed(1);
        probValue.textContent = probPct + '%';
        probFill.style.width = probPct + '%';
        probFill.style.backgroundColor = result.probability > 0.6 ? 'var(--danger)' : (result.probability > 0.3 ? '#f59e0b' : 'var(--success)');
    }

    renderRadarChart(inputData);
    generateMedicalAdvice(inputData, result.prediction);
}

function renderRadarChart(inputData) {
    if (!datasetStats) return;

    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChart) radarChart.destroy();

    const labels = ['Glucose', 'Blood Pressure', 'Insulin', 'BMI', 'Age'];
    const userData = [inputData.glucose, inputData.bloodPressure, inputData.insulin, inputData.bmi, inputData.age];
    const avgData = [
        datasetStats.averages.Glucose,
        datasetStats.averages.BloodPressure,
        datasetStats.averages.Insulin,
        datasetStats.averages.BMI,
        datasetStats.averages.Age
    ];

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your Metrics',
                data: userData,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: COLORS.primary,
                pointBackgroundColor: COLORS.primary,
            }, {
                label: 'Dataset Average',
                data: avgData,
                fill: true,
                backgroundColor: 'rgba(100, 116, 139, 0.2)',
                borderColor: COLORS.muted,
                pointBackgroundColor: COLORS.muted,
            }]
        },
        options: {
            scales: { r: { suggestMin: 0 } }
        }
    });
}

function renderAdvancedDashboard() {
    if (!datasetStats) return;

    // 1. Population Pie Chart
    const popCtx = document.getElementById('populationChart').getContext('2d');
    if (populationChart) populationChart.destroy();
    populationChart = new Chart(popCtx, {
        type: 'pie',
        data: {
            labels: datasetStats.outcome_distribution.labels,
            datasets: [{
                data: datasetStats.outcome_distribution.data,
                backgroundColor: [COLORS.success, COLORS.danger],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // 2. Glucose Indicator Bar Chart
    const gluCtx = document.getElementById('glucoseIndicatorChart').getContext('2d');
    if (glucoseIndicatorChart) glucoseIndicatorChart.destroy();
    glucoseIndicatorChart = new Chart(gluCtx, {
        type: 'bar',
        data: {
            labels: datasetStats.glucose_comparison.labels,
            datasets: [{
                label: 'Avg Glucose (mg/dL)',
                data: datasetStats.glucose_comparison.data,
                backgroundColor: [COLORS.success, COLORS.danger],
                borderRadius: 8
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 3. Age Distribution Area Chart
    const ageCtx = document.getElementById('ageDistributionChart').getContext('2d');
    if (ageDistributionChart) ageDistributionChart.destroy();
    ageDistributionChart = new Chart(ageCtx, {
        type: 'line',
        data: {
            labels: datasetStats.age_distribution.labels,
            datasets: [{
                label: 'Patient Frequency',
                data: datasetStats.age_distribution.data,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: COLORS.primary,
                tension: 0.4
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { 
                x: { title: { display: true, text: 'Age' } },
                y: { beginAtZero: true }
            }
        }
    });

    // 4. Correlation Study Scatter Plot
    const corrCtx = document.getElementById('correlationChart').getContext('2d');
    if (correlationChart) correlationChart.destroy();
    
    const healthyPoints = datasetStats.scatter_data
        .filter(d => d.Outcome === 0)
        .map(d => ({ x: d.BMI, y: d.Glucose }));
    const diabeticPoints = datasetStats.scatter_data
        .filter(d => d.Outcome === 1)
        .map(d => ({ x: d.BMI, y: d.Glucose }));

    correlationChart = new Chart(corrCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Healthy',
                data: healthyPoints,
                backgroundColor: COLORS.success + '88' // Semi-transparent
            }, {
                label: 'Diabetic',
                data: diabeticPoints,
                backgroundColor: COLORS.danger + '88'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'BMI' } },
                y: { title: { display: true, text: 'Glucose' } }
            }
        }
    });
}

function generateMedicalAdvice(data, prediction) {
    const adviceList = document.getElementById('adviceList');
    adviceList.innerHTML = '';
    
    const bmi = parseFloat(data.bmi);
    const glucose = parseFloat(data.glucose);
    const bp = parseFloat(data.bloodPressure);

    const tips = [];
    if (bmi >= 30) tips.push("Your BMI indicates obesity. Focus on a calorie-controlled diet.");
    else if (bmi >= 25) tips.push("Your BMI is in the overweight range.");
    
    if (glucose > 140) tips.push("Elevated glucose levels detected.");
    if (bp > 90) tips.push("Blood pressure is higher than ideal.");
    
    if (prediction === 'Diabetic') {
        tips.push("Schedule a HbA1c test for a more accurate long-term average.");
    }

    if (tips.length === 0) tips.push("All parameters look healthy. Keep it up!");

    tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        adviceList.appendChild(li);
    });
}
