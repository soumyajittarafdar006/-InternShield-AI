"""
Prediction and Risk Assessment Engine for InternShield AI.
Combines Machine Learning NLP predictions with heuristic rule-based red flag analysis.
"""

import os
import joblib
import numpy as np

from .preprocess import clean_text, extract_suspicious_signals

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(CURRENT_DIR, "vectorizer.pkl")
ALL_MODELS_PATH = os.path.join(CURRENT_DIR, "all_models.pkl")

# Cached model instances
_MODEL = None
_VECTORIZER = None
_ALL_MODELS = None

def get_ml_pipeline():
    """Lazy load saved ML models and TF-IDF vectorizer."""
    global _MODEL, _VECTORIZER, _ALL_MODELS
    if _MODEL is None and os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            _MODEL = joblib.load(MODEL_PATH)
            _VECTORIZER = joblib.load(VECTORIZER_PATH)
            if os.path.exists(ALL_MODELS_PATH):
                _ALL_MODELS = joblib.load(ALL_MODELS_PATH)
        except Exception as e:
            print(f"Error loading ML artifacts: {e}")
            _MODEL = None
            _VECTORIZER = None
    return _MODEL, _VECTORIZER, _ALL_MODELS

def generate_recommendations(risk_level: str, signals: list) -> list:
    """Generate actionable safety recommendations tailored to the findings."""
    recs = [
        "Never pay any registration fee, security deposit, or documentation charge to secure an internship.",
        "Verify the company on official channels (LinkedIn company page, MCA/ROC company registry, or official website)."
    ]
    
    signal_ids = {s['id'] for s in signals}
    
    if "free_email_domain" in signal_ids:
        recs.append("Check recruiter's email domain: Legitimate corporate talent teams write from official @company.com domains, not free Gmail or Yahoo accounts.")
        
    if "sensitive_docs_requested" in signal_ids:
        recs.append("Never send copies of your Aadhaar card, PAN card, or bank passbook before receiving a verified offer letter and verifying the employer.")
        
    if "whatsapp_only_hiring" in signal_ids:
        recs.append("Avoid opportunities conducted solely over WhatsApp or Telegram without formal corporate HR tracking.")
        
    if "unrealistic_stipend" in signal_ids:
        recs.append("Benchmark the stipend with industry standards (e.g., Glassdoor, Levels.fyi) — unusually high pay for no skills is a frequent scam bait.")

    if risk_level == "High Risk":
        recs.insert(0, "DO NOT PROCEED: This posting exhibits critical fraud patterns. Report the listing to your college placement cell.")
    elif risk_level == "Medium Risk":
        recs.insert(0, "Exercise Caution: Request a video interview with a verified company email before accepting any offer or sharing documents.")
    else:
        recs.insert(0, "Low Risk detected, but always perform standard due diligence before signing agreements or joining.")
        
    return recs

def predict_internship(
    title: str = "",
    company: str = "",
    description: str = "",
    requirements: str = "",
    email: str = "",
    website: str = "",
    stipend: str = "",
    registration_fee: str = "",
    duration: str = "",
    full_text: str = "",
    model_name: str = "Logistic Regression"
) -> dict:
    """
    Main prediction function.
    Returns:
      - prediction: 'Real' or 'Fake'
      - risk_score: 0 to 100
      - risk_level: 'Low Risk', 'Medium Risk', 'High Risk'
      - is_demo_mode: bool
      - model_used: str
      - signals: list of detected warning cards
      - safety_recommendations: list of advice
      - explainability_keywords: list of model keywords matched in text
      - model_confidence: float percentage
    """
    model, vectorizer, all_models = get_ml_pipeline()
    is_demo_mode = (model is None or vectorizer is None)

    # 1. Extract suspicious heuristic signals
    signal_analysis = extract_suspicious_signals(
        title=title,
        company=company,
        description=description,
        requirements=requirements,
        email=email,
        website=website,
        stipend=stipend,
        fee=registration_fee,
        full_text=full_text
    )
    detected_signals = signal_analysis["signals"]
    heuristic_score_delta = signal_analysis["score_delta"]

    # 2. Prepare text for ML Model
    combined_raw = f"{title} {company} {description} {requirements} {stipend} {registration_fee} {full_text}"
    cleaned_input = clean_text(combined_raw)
    
    ml_fake_prob = 0.0
    ml_confidence = 0.0
    top_matched_keywords = []
    active_model_name = "Rule-Based Heuristic Engine (Demo Mode)"

    if not is_demo_mode:
        active_model = model
        if all_models and model_name in all_models:
            active_model = all_models[model_name]
            active_model_name = model_name
        else:
            active_model_name = "Logistic Regression"
            
        try:
            X_input = vectorizer.transform([cleaned_input])
            
            # Predict probabilities if supported, else decision function
            if hasattr(active_model, "predict_proba"):
                probs = active_model.predict_proba(X_input)[0]
                ml_fake_prob = float(probs[1]) # Probability of class 1 (Fake)
            elif hasattr(active_model, "decision_function"):
                decision = active_model.decision_function(X_input)[0]
                # Sigmoid approximation
                ml_fake_prob = float(1 / (1 + np.exp(-decision)))
            else:
                pred = active_model.predict(X_input)[0]
                ml_fake_prob = 0.90 if pred == 1 else 0.10

            ml_confidence = round(max(ml_fake_prob, 1 - ml_fake_prob) * 100, 1)

            # Feature explainability: Find which active TF-IDF vocabulary words in the input influenced the prediction
            feature_names = vectorizer.get_feature_names_out()
            feature_indices = X_input.nonzero()[1]
            
            if hasattr(model, "coef_"):
                coefs = model.coef_[0]
                matched_with_weights = []
                for idx in feature_indices:
                    term = feature_names[idx]
                    weight = float(coefs[idx])
                    matched_with_weights.append({
                        "word": term,
                        "weight": round(weight, 3),
                        "direction": "fake" if weight > 0 else "real"
                    })
                # Sort by absolute weight influence
                matched_with_weights.sort(key=lambda x: abs(x["weight"]), reverse=True)
                top_matched_keywords = matched_with_weights[:8]

        except Exception as e:
            print(f"Error during ML inference: {e}")
            is_demo_mode = True
            active_model_name = "Rule-Based Fallback Mode"

    # 3. Compute Composite Risk Score (0 - 100)
    # Critical red flag override: If registration/training fee is requested, minimum risk is 75 (High Risk)
    has_critical_fee = any(s['id'] == 'fee_requested' for s in detected_signals)
    has_sensitive_docs = any(s['id'] == 'sensitive_docs_requested' for s in detected_signals)

    if not is_demo_mode:
        # Base risk from ML model (0-100)
        base_ml_risk = ml_fake_prob * 100
        # Hybrid formula: 65% ML confidence + 35% Domain-specific heuristic red flags
        composite_risk = (0.65 * base_ml_risk) + (0.35 * max(0, min(100, 20 + heuristic_score_delta * 1.5)))
    else:
        # Fallback heuristic calculation
        composite_risk = max(10, min(95, 25 + heuristic_score_delta * 1.2))
        ml_confidence = 85.0

    # Ensure critical signals enforce strict risk floors
    if has_critical_fee:
        composite_risk = max(composite_risk, 82.0)
    if has_sensitive_docs and has_critical_fee:
        composite_risk = max(composite_risk, 94.0)

    # Clamp to [0, 100]
    final_risk_score = int(round(min(100.0, max(0.0, composite_risk))))

    # 4. Classify Risk Bands
    # 0 - 30: Low Risk (Real)
    # 31 - 60: Medium Risk (Suspicious / Manual verification required)
    # 61 - 100: High Risk (Fake / Scam)
    if final_risk_score <= 30:
        risk_level = "Low Risk"
        prediction = "Real"
        status_color = "green"
    elif final_risk_score <= 60:
        risk_level = "Medium Risk"
        prediction = "Real (With Caution)"
        status_color = "yellow"
    else:
        risk_level = "High Risk"
        prediction = "Fake"
        status_color = "red"

    # Generate customized safety recommendations
    recommendations = generate_recommendations(risk_level, detected_signals)

    return {
        "prediction": prediction,
        "risk_score": final_risk_score,
        "risk_level": risk_level,
        "status_color": status_color,
        "is_demo_mode": is_demo_mode,
        "model_used": active_model_name,
        "model_confidence": ml_confidence,
        "reasons": detected_signals,
        "safety_recommendations": recommendations,
        "top_keywords": top_matched_keywords,
        "metadata": {
            "title": title or "Untitled Internship",
            "company": company or "Unspecified Company",
            "recruiter_email": email or "Not provided",
            "stipend": stipend or "Not specified",
            "registration_fee": registration_fee or "None specified",
            "duration": duration or "Not specified"
        }
    }
