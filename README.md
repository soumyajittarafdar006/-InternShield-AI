# InternShield AI – AI-Based Fake Internship Detection Platform

> **"Your AI Shield Against Fake Internships."**

InternShield AI is an intelligent, full-stack, AI-powered platform designed to protect college students from fraudulent recruitment postings, registration fee scams, and identity harvesting attacks. Engineered using Natural Language Processing (NLP) and supervised Machine Learning on the EMSCAD benchmark dataset.

---

## 🌟 Key Features

1. **AI Fake Internship Detection**: Analyzes linguistic patterns, n-grams, and context using TF-IDF and supervised learning models (Logistic Regression, Naive Bayes, Random Forest, SVM).
2. **Registration Fee Detection**: Automatically detects fee demands, security deposits, and training charges—an immediate critical red flag.
3. **Suspicious Email Inspection**: Identifies free public email domains (e.g., `@gmail.com`, `@yahoo.com`) used by recruiters impersonating corporate teams.
4. **Unrealistic Stipend Detection**: Flags unrealistic earnings claims (e.g., "Earn ₹50,000/month part-time data entry with no experience").
5. **Interactive Risk Gauge (0–100)**: Visual animated gauge categorizing offers into **Low Risk (0–30)**, **Medium Risk (31–60)**, and **High Risk (61–100)**.
6. **Explainable AI Reasoning**: Highlights detected warning cards with severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `POSITIVE`) and vocabulary coefficients.
7. **Actionable Safety Recommendations**: Context-aware guidance for students to verify recruiters and secure their personal information.
8. **Executive PDF Report Export**: Instant client-side generation of formal verification reports for placement cells.
9. **Analytics Dashboard**: Tracks real vs. fraudulent submission distributions and historical trends via Recharts.
10. **Benchmark ML Performance Page**: Displays real-world Accuracy, Precision, Recall, F1-Score, interactive Confusion Matrix, and model comparison across 4 algorithms.

---

## 🏗️ System Architecture

```
                          ┌─────────────────────────────┐
                          │   InternShield AI Frontend  │
                          │   (React.js 19 + Vite 8)    │
                          │ Tailwind CSS, Recharts, jsPDF│
                          └──────────────┬──────────────┘
                                         │ HTTP REST JSON
                                         ▼
                          ┌─────────────────────────────┐
                          │     Flask REST API Server   │
                          │    (Python 3.14 / CORS)     │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    NLP Preprocessing      │                   │   Heuristic Rule Engine   │
   │  - Lowercase, HTML clean  │                   │ - Registration fee check  │
   │  - Domain extractor       │                   │ - Free mail detection     │
   │  - TF-IDF Vectorizer      │                   │ - Document harvest alerts │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 ▼                                               │
   ┌───────────────────────────┐                                 │
   │   Trained ML Models       │                                 │
   │ - Logistic Regression     │                                 │
   │ - Naive Bayes             │                                 │
   │ - Random Forest           │                                 │
   │ - Support Vector Machine  │                                 │
   └─────────────┬─────────────┘                                 │
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                          ┌─────────────────────────────┐
                          │   Risk Scorer & Explainer   │
                          │ - Composite Score (0 to 100)│
                          │ - Risk Band Classification  │
                          │ - Actionable Advice Engine  │
                          └─────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend:
- **Framework**: React.js 19 with Vite 8
- **Styling**: Tailwind CSS v4, custom glassmorphism design system
- **Icons**: Lucide React
- **Visualizations**: Recharts (Pie & Bar charts), SVG Animated Circular Gauge
- **Animations**: Framer Motion
- **Report Generation**: jsPDF

### Backend & Machine Learning:
- **Language**: Python 3.14 / 3.11+
- **Web Framework**: Flask 3.1 with Flask-CORS
- **NLP / Feature Extraction**: Scikit-Learn `TfidfVectorizer` (1–2 n-grams, sublinear TF)
- **Machine Learning Algorithms**:
  1. **Logistic Regression** (Primary Default – balanced weights, high explainability)
  2. **Multinomial Naive Bayes**
  3. **Random Forest Classifier**
  4. **Support Vector Machine (Calibrated LinearSVC)**
- **Serialization**: Joblib

---

## 📊 Dataset & Benchmark Performance

- **Dataset**: Built upon the Employment Scam Aegean Dataset (EMSCAD) / Kaggle Real and Fake Job Posting format.
- **Evaluation Split**: 80:20 Stratified Train-Test split.
- **Focus**: Fake-class Recall and F1-Score are prioritized to prevent harmful false negatives.

### Model Comparison Table (Unseen Test Set):

| Algorithm | Accuracy | Fake Recall (Catch Rate) | Fake Precision | Fake F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **97.87%** | **100.00%** | **95.45%** | **97.67%** | **Primary Engine** |
| **Multinomial Naive Bayes** | 100.00% | 100.00% | 100.00% | 100.00% | Evaluated |
| **Random Forest** | 96.81% | 100.00% | 93.33% | 96.55% | Evaluated |
| **Support Vector Machine** | 100.00% | 100.00% | 100.00% | 100.00% | Evaluated |

*All metrics are calculated and verified using `backend/tests/test_api.py`.*

---

## 🚀 Getting Started

### Prerequisites:
- Python 3.10+ (Python 3.14 supported)
- Node.js v18+ and npm

---

### Step 1: Backend Setup & Running

```bash
# Navigate to the backend directory
cd backend

# Install required Python packages
python -m pip install -r requirements.txt

# (Optional) Re-train the models if needed
python model/train_model.py

# Run the automated backend test suite
python tests/test_api.py

# Start the Flask REST API server (runs on http://localhost:5000)
python app.py
```

---

### Step 2: Frontend Setup & Running

Open a second terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The application will be live at:
👉 **`http://localhost:5173`**

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health status and ML model availability check |
| `/api/analyze` | `POST` | Inspects internship payload; returns prediction, risk score, signals, and advice |
| `/api/history` | `GET` | Retrieves recent scan history logs |
| `/api/model-performance` | `GET` | Returns verified accuracy, precision, recall, F1, confusion matrices, and feature weights |
| `/api/train` | `POST` | Triggers retraining of all 4 ML models on benchmark dataset |

### Example Analysis Request (`POST /api/analyze`):
```json
{
  "title": "Online Form Filling & Data Entry Intern",
  "company": "Quick Earn Services",
  "description": "Earn Rs 50,000 per month working 2 hours daily from home. 100% guaranteed selection without interview.",
  "email": "quickearn2026@gmail.com",
  "stipend": "50000",
  "registration_fee": "1200",
  "model_name": "Logistic Regression"
}
```

### Example Analysis Response:
```json
{
  "prediction": "Fake",
  "risk_score": 87,
  "risk_level": "High Risk",
  "status_color": "red",
  "model_used": "Logistic Regression",
  "model_confidence": 98.2,
  "reasons": [
    {
      "id": "fee_requested",
      "title": "Registration or Training Fee Detected",
      "severity": "CRITICAL",
      "explanation": "Legitimate employers never demand registration fees or security deposits.",
      "evidence": "Specified fee: '1200'"
    },
    {
      "id": "free_email_domain",
      "title": "Free Public Email Used by Recruiter",
      "severity": "HIGH",
      "explanation": "Recruiter uses @gmail.com instead of verified corporate domain.",
      "evidence": "Email: quickearn2026@gmail.com"
    }
  ]
}
```

---

## 🔒 Security, Ethics & Responsibility

- **Student Privacy First**: No sensitive personal identity numbers (Aadhaar, PAN, bank passwords) are stored or uploaded.
- **Explainable Advisory**: Results are presented as probabilistic risk assessments and educational warning signs, never as final legal verdicts.
- **Fail-Safe Offline Mode**: If the Flask backend is unreachable, the frontend automatically activates a client-side heuristic fallback engine with zero downtime.

---

## 🎓 Academic Attribution

- **Project**: AI-Based Fake Internship Detection Platform
- **Report Reference**: 2nd Year / Capstone College Engineering Project by Sayanti (Nov 2026)
- **Primary Domain**: Natural Language Processing & Cybersecurity in Student Recruitment
