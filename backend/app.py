"""
InternShield AI - Flask REST API Backend
Provides AI detection endpoints, model metrics, analysis history,
and domain intelligence (DNS, live-site and domain-age checks).
"""

import os
import re
import sys
import json
import uuid
import socket
import ipaddress
import datetime

# Ensure backend directory is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import requests
import whois
from flask import Flask, request, jsonify
from flask_cors import CORS

from model.predict import predict_internship, get_ml_pipeline
from model.train_model import train_and_evaluate, METRICS_PATH

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")

def load_history():
    """Load analysis history from disk."""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(history_list):
    """Save analysis history to disk."""
    try:
        # Keep maximum 50 recent records
        trimmed = history_list[:50]
        with open(HISTORY_FILE, "w") as f:
            json.dump(trimmed, f, indent=2)
    except Exception as e:
        print(f"Error saving history: {e}")

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status and ML model availability."""
    model, vectorizer, _ = get_ml_pipeline()
    metrics_available = os.path.exists(METRICS_PATH)
    
    return jsonify({
        "status": "healthy",
        "service": "InternShield AI Detection Engine",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "metrics_available": metrics_available,
        "primary_algorithm": "Logistic Regression (TF-IDF)",
        "version": "1.0.0"
    }), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_internship():
    """
    Analyzes an internship posting or offer letter.
    Accepts JSON payload with structured fields or unstructured text.
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "error": "Invalid request. Please provide a JSON body with internship details."
            }), 400

        # Extract fields with safe fallbacks
        title = data.get("title", "").strip()
        company = data.get("company", "").strip()
        description = data.get("description", "").strip()
        requirements = data.get("requirements", "").strip()
        email = data.get("email", "").strip()
        website = data.get("website", "").strip()
        stipend = data.get("stipend", "").strip()
        registration_fee = data.get("registration_fee", data.get("fee", "")).strip()
        duration = data.get("duration", "").strip()
        full_text = data.get("full_text", "").strip()
        model_name = data.get("model_name", "Logistic Regression")

        # Minimum input validation: either full_text or title/description must have some content
        has_content = any([title, description, full_text, company])
        if not has_content:
            return jsonify({
                "error": "Please provide an internship title, description, or paste the offer text."
            }), 422

        # Run AI detection pipeline
        result = predict_internship(
            title=title,
            company=company,
            description=description,
            requirements=requirements,
            email=email,
            website=website,
            stipend=stipend,
            registration_fee=registration_fee,
            duration=duration,
            full_text=full_text,
            model_name=model_name
        )

        # Build history entry
        record_id = str(uuid.uuid4())
        created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        history_item = {
            "id": record_id,
            "created_at": created_at,
            "title": title or (full_text[:40] + "..." if full_text else "Pasted Internship Offer"),
            "company": company or "Not Specified",
            "prediction": result["prediction"],
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "model_used": result["model_used"]
        }

        # Update persistent history
        current_history = load_history()
        current_history.insert(0, history_item)
        save_history(current_history)

        result["analysis_id"] = record_id
        result["timestamp"] = created_at
        return jsonify(result), 200

    except Exception as e:
        print(f"Exception during analysis: {e}")
        return jsonify({
            "error": "An error occurred while evaluating the internship.",
            "details": str(e)
        }), 500

# ---------------------------------------------------------------------------
# Domain intelligence: email-to-website match + domain age (WHOIS)
# ---------------------------------------------------------------------------
DOMAIN_RE = re.compile(r"^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")

def _is_public_host(host):
    """Block lookups that would resolve to private/internal addresses (SSRF guard)."""
    try:
        for info in socket.getaddrinfo(host, None):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return False
        return True
    except Exception:
        return False

@app.route("/api/domain-check", methods=["GET"])
def domain_check():
    """
    Checks a recruiter's email domain:
      - does it resolve in DNS?
      - does a live website answer on it?
      - how old is the registration (WHOIS creation date)?
    """
    domain = (request.args.get("domain") or "").lower().strip()
    if not DOMAIN_RE.match(domain):
        return jsonify({"error": "Invalid domain."}), 400

    # Is the internet reachable at all? If not, report "unknown", never "does not exist".
    try:
        socket.gethostbyname("dns.google")
    except socket.gaierror:
        return jsonify({"dns_resolves": None, "site_live": None, "age_days": None,
                        "created": None, "registrar": None}), 200

    # DNS
    try:
        socket.gethostbyname(domain)
        dns_ok = True
    except socket.gaierror:
        dns_ok = False

    # Live website (None = unknown, e.g. timeout on a slow connection)
    live = False
    if dns_ok and _is_public_host(domain):
        timed_out = False
        for host in (domain, "www." + domain):
            try:
                r = requests.get(f"https://{host}", timeout=5, allow_redirects=True,
                                 headers={"User-Agent": "InternShieldAI-DomainCheck/1.0"})
                if r.status_code < 500:
                    live = True
                    break
            except requests.Timeout:
                timed_out = True
            except requests.RequestException:
                continue
        if not live and timed_out:
            live = None

    # Domain age
    age_days = created = registrar = None
    try:
        w = whois.whois(domain)
        c = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        if c:
            created = c.date().isoformat()
            age_days = max(0, (datetime.datetime.now() - c.replace(tzinfo=None)).days)
        registrar = w.registrar
    except Exception as e:
        print(f"WHOIS lookup failed for {domain}: {e}")

    return jsonify({
        "dns_resolves": dns_ok,
        "site_live": live,
        "age_days": age_days,
        "created": created,
        "registrar": registrar
    }), 200

@app.route("/api/history", methods=["GET"])
def get_history():
    """Retrieve recent analysis history."""
    history = load_history()
    return jsonify({
        "total_records": len(history),
        "history": history
    }), 200

@app.route("/api/model-performance", methods=["GET"])
def get_model_performance():
    """
    Returns actual machine learning performance metrics,
    confusion matrix, and feature importances.
    """
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
            return jsonify(metrics_data), 200
        except Exception as e:
            return jsonify({"error": f"Failed reading metrics: {str(e)}"}), 500
    else:
        # Prompt explicitly mandates:
        # "Do not invent performance metrics. Show actual metrics after training and testing.
        # Until then, display placeholders such as 'Model not trained yet'."
        return jsonify({
            "status": "not_trained",
            "message": "Model not trained yet. Run train_model.py or trigger POST /api/train."
        }), 404

@app.route("/api/train", methods=["POST"])
def trigger_training():
    """Trigger retraining of models on benchmark dataset."""
    try:
        metrics = train_and_evaluate()
        return jsonify({
            "message": "Models trained successfully.",
            "metrics": metrics
        }), 200
    except Exception as e:
        return jsonify({"error": f"Training failed: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting InternShield AI Backend on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)