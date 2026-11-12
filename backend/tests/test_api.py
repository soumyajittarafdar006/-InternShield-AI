"""
Comprehensive API and Pipeline Verification Test for InternShield AI
"""

import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app

def run_tests():
    print("=" * 60)
    print("InternShield AI - Automated Backend & Model Verification Test")
    print("=" * 60)
    
    client = app.test_client()

    # 1. Test Health
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    health = res.get_json()
    print(f"[PASS] Health Check: {health['service']} (v{health['version']})")
    print(f"  Model Loaded: {health['model_loaded']}, Vectorizer: {health['vectorizer_loaded']}")
    assert health['model_loaded'], "Primary ML Model is not loaded!"

    # 2. Test Model Performance
    res = client.get('/api/model-performance')
    assert res.status_code == 200, f"Model performance failed with {res.status_code}"
    perf = res.get_json()
    print("\n[PASS] Model Performance Metrics:")
    for model_name, stats in perf['models'].items():
        print(f"  * {model_name:24s}: Accuracy = {stats['accuracy']}%, Fake Recall = {stats['recall_fake']}%, F1 = {stats['f1_fake']}%")
    
    # 3. Test High-Risk Fake Internship Detection
    scam_payload = {
        "title": "Online Form Filling & Data Entry Intern",
        "company": "Quick Earn Pvt Ltd",
        "description": "Earn 5000 daily from home. Guaranteed selection without interview. Pay Rs 1500 refundable security deposit.",
        "fee": "1500",
        "email": "quickearn2026@gmail.com",
        "stipend": "75000"
    }
    res = client.post('/api/analyze', json=scam_payload)
    assert res.status_code == 200, f"Analyze fake failed with {res.status_code}"
    fake_res = res.get_json()
    print("\n[PASS] Test Case 1: Fraudulent Job Detection")
    print(f"  Prediction:   {fake_res['prediction']}")
    print(f"  Risk Score:   {fake_res['risk_score']}/100 ({fake_res['risk_level']})")
    print(f"  Red Flags:    {len(fake_res['reasons'])} detected")
    for r in fake_res['reasons']:
        print(f"    - [{r['severity']}] {r['title']}")
    assert fake_res['risk_score'] >= 61, f"Expected High Risk (>60) for scam payload, got {fake_res['risk_score']}"
    assert fake_res['prediction'] == "Fake", f"Expected 'Fake', got {fake_res['prediction']}"

    # 4. Test Low-Risk Real Internship Detection
    real_payload = {
        "title": "Software Engineering Intern - Summer 2026",
        "company": "TechCorp Solutions Inc.",
        "description": "Work with distributed systems engineers on microservices and cloud infrastructure. Mentorship, weekly tech talks, and project presentations are core parts of the internship.",
        "requirements": "Pursuing B.Tech/BS in Computer Science. Proficiency in Python, Java, or C++. Familiarity with REST APIs, Git, and relational databases.",
        "fee": "0",
        "email": "university-hiring@techcorp.com",
        "website": "https://techcorp-solutions.example.com",
        "stipend": "45000"
    }
    res = client.post('/api/analyze', json=real_payload)
    assert res.status_code == 200, f"Analyze real failed with {res.status_code}"
    real_res = res.get_json()
    print("\n[PASS] Test Case 2: Genuine Job Detection")
    print(f"  Prediction:   {real_res['prediction']}")
    print(f"  Risk Score:   {real_res['risk_score']}/100 ({real_res['risk_level']})")
    print(f"  Reasons/Logs: {len(real_res['reasons'])} item(s)")
    assert real_res['risk_score'] <= 35, f"Expected Low Risk (<=35) for real payload, got {real_res['risk_score']}"

    # 5. Test History Persistence
    res = client.get('/api/history')
    assert res.status_code == 200, f"History fetch failed with {res.status_code}"
    hist = res.get_json()
    print(f"\n[PASS] History Persistence Check: {hist['total_records']} total records saved.")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! BACKEND PIPELINE FULLY FUNCTIONAL.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
