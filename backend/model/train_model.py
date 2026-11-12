"""
Model Training and Comparison Pipeline for InternShield AI.
Trains and compares Logistic Regression, Naive Bayes, Random Forest, and SVM.
Saves the primary model, vectorizer, and evaluation metrics.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

# Add parent directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
sys.path.append(CURRENT_DIR)
sys.path.append(BACKEND_DIR)

from preprocess import clean_text
from dataset.build_dataset import build_corpus, DATASET_PATH

MODEL_DIR = CURRENT_DIR
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")
ALL_MODELS_PATH = os.path.join(MODEL_DIR, "all_models.pkl")

def prepare_feature_text(row):
    """Combines all fields into a single rich text feature for NLP."""
    parts = [
        str(row.get('title', '')),
        str(row.get('company_profile', '')),
        str(row.get('description', '')),
        str(row.get('requirements', '')),
        str(row.get('benefits', '')),
        f"email_domain_{row.get('recruiter_email', '')}",
        f"stipend_amount_{row.get('stipend', '')}",
        f"registration_fee_{row.get('registration_fee', '')}"
    ]
    raw = " ".join([p for p in parts if p and p != 'nan'])
    return clean_text(raw)

def train_and_evaluate():
    print("=" * 60)
    print("InternShield AI - Machine Learning Training Pipeline")
    print("=" * 60)
    
    # Check dataset existence
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}. Generating benchmark corpus...")
        df = build_corpus(multiplier=25)
    else:
        print(f"Loading dataset from {DATASET_PATH}...")
        df = pd.read_csv(DATASET_PATH)
        
    print(f"Dataset loaded: {len(df)} total samples.")
    fake_count = int(df['fraudulent'].sum())
    real_count = len(df) - fake_count
    print(f"Class distribution: Real = {real_count} ({real_count/len(df)*100:.1f}%), Fake = {fake_count} ({fake_count/len(df)*100:.1f}%)")

    # Combine text and clean
    df['processed_text'] = df.apply(prepare_feature_text, axis=1)
    
    X = df['processed_text']
    y = df['fraudulent'].astype(int)

    # 80:20 Train-Test split with stratification
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Split: Training samples = {len(X_train_raw)}, Testing samples = {len(X_test_raw)}")

    # TF-IDF Feature Extraction
    print("\nExtracting features using TF-IDF (1-2 ngrams, max_features=5000)...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english',
        sublinear_tf=True
    )
    X_train = vectorizer.fit_transform(X_train_raw)
    X_test = vectorizer.transform(X_test_raw)
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)} features.")

    # Algorithms to train and compare
    models_to_train = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        "Naive Bayes": MultinomialNB(alpha=0.5),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=15, class_weight='balanced', random_state=42),
        "Support Vector Machine": CalibratedClassifierCV(LinearSVC(class_weight='balanced', random_state=42, max_iter=2000))
    }

    results = {}
    fitted_models = {}

    for name, clf in models_to_train.items():
        print(f"\nTraining {name}...")
        clf.fit(X_train, y_train)
        fitted_models[name] = clf
        
        y_pred = clf.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        # Fake class is 1
        p_fake, r_fake, f1_fake, _ = precision_recall_fscore_support(y_test, y_pred, average=None, labels=[0, 1])
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average='macro')
        
        cm = confusion_matrix(y_test, y_pred, labels=[0, 1]) # [[TN, FP], [FN, TP]]
        tn, fp, fn, tp = cm.ravel()
        
        print(f"  Accuracy:  {acc * 100:.2f}%")
        print(f"  Precision (Fake): {p_fake[1] * 100:.2f}%")
        print(f"  Recall (Fake):    {r_fake[1] * 100:.2f}% (Crucial metric for fraud detection)")
        print(f"  F1-Score (Fake):  {f1_fake[1] * 100:.2f}%")
        print(f"  Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
        
        results[name] = {
            "accuracy": round(float(acc) * 100, 2),
            "precision_fake": round(float(p_fake[1]) * 100, 2),
            "recall_fake": round(float(r_fake[1]) * 100, 2),
            "f1_fake": round(float(f1_fake[1]) * 100, 2),
            "precision_real": round(float(p_fake[0]) * 100, 2),
            "recall_real": round(float(r_fake[0]) * 100, 2),
            "f1_real": round(float(f1_fake[0]) * 100, 2),
            "macro_f1": round(float(f1_macro) * 100, 2),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            }
        }

    # Extract Top Predictive Features from Logistic Regression
    logreg = fitted_models["Logistic Regression"]
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefs = logreg.coef_[0]
    
    top_fake_idx = np.argsort(coefs)[-15:][::-1]
    top_real_idx = np.argsort(coefs)[:15]
    
    top_fake_keywords = [{"keyword": str(feature_names[i]), "weight": round(float(coefs[i]), 3)} for i in top_fake_idx]
    top_real_keywords = [{"keyword": str(feature_names[i]), "weight": round(float(abs(coefs[i])), 3)} for i in top_real_idx]

    # Save primary model (Logistic Regression) & Vectorizer
    joblib.dump(fitted_models["Logistic Regression"], MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(fitted_models, ALL_MODELS_PATH)
    print(f"\nSaved primary model to {MODEL_PATH}")
    print(f"Saved vectorizer to {VECTORIZER_PATH}")

    # Save metrics metadata for API consumption
    metadata = {
        "status": "trained",
        "primary_model": "Logistic Regression",
        "dataset_info": {
            "total_samples": len(df),
            "real_samples": real_count,
            "fake_samples": fake_count,
            "train_size": len(X_train_raw),
            "test_size": len(X_test_raw),
            "split_ratio": "80:20 Stratified",
            "feature_count": len(vectorizer.vocabulary_)
        },
        "models": results,
        "explainability": {
            "top_fake_signals": top_fake_keywords,
            "top_real_signals": top_real_keywords
        }
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation metrics to {METRICS_PATH}")
    print("=" * 60)
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
