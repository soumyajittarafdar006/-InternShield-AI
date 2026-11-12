"""
Text Preprocessing and Suspicious Signal Extraction Module for InternShield AI.
"""

import re
import html

# Common free email domains that legitimate companies typically don't use for hiring
FREE_EMAIL_DOMAINS = {
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com',
    'ymail.com', 'mail.com', 'proton.me', 'protonmail.com', 'zoho.com',
    'icloud.com', 'aol.com', 'gmx.com', 'live.com'
}

# Suspicious urgency keywords
URGENCY_KEYWORDS = [
    r'urgent(?:ly)?\s+hiring', r'immediate(?:ly)?\s+join(?:ing)?',
    r'limited\s+seats?', r'offer\s+valid\s+(?:today|for\s+\d+\s+hours?)',
    r'apply\s+now\s+before\s+it\s+closes', r'direct\s+selection',
    r'no\s+interview\s+(?:needed|required)', r'spot\s+offer',
    r'hurry\s+up', r'guaranteed\s+(?:placement|job|selection)',
    r'instant\s+offer'
]

# Suspicious fee/payment keywords
FEE_KEYWORDS = [
    r'registration\s+fee', r'security\s+deposit', r'training\s+fee',
    r'processing\s+charges?', r'application\s+fee', r'pay\s+(?:nominal|small|refundable)\s+fee',
    r'refundable\s+(?:deposit|amount)', r'onboarding\s+fee', r'documentation\s+fee',
    r'material\s+cost', r'pay\s+(?:rs\.?|inr|\$|₹)\s*\d+', r'laptop\s+deposit'
]

# Sensitive documents requested too early
SENSITIVE_DOC_KEYWORDS = [
    r'aadhaar(?:\s+card)?', r'pan\s+card', r'bank\s+account\s+details',
    r'passbook', r'credit\s+card', r'debit\s+card', r'otp', r'atm\s+pin',
    r'cheque', r'blank\s+cheque'
]

# Unrealistic earnings / stipend promises
UNREALISTIC_STIPEND_KEYWORDS = [
    r'earn\s+(?:rs\.?|inr|\$|₹)?\s*\d{4,}\s*(?:daily|per\s+day|a\s+day)',
    r'earn\s+from\s+home\s+(?:rs\.?|inr|\$|₹)?\s*[3-9]\d{4,}',
    r'part\s*time\s*earn\s*\d{4,}', r'no\s+skills?\s+required.*earn',
    r'typing\s+job.*earn', r'data\s+entry.*(?:30000|40000|50000)'
]

# WhatsApp-only hiring channels
WHATSAPP_HIRING_KEYWORDS = [
    r'send\s+(?:cv|resume)\s+on\s+whatsapp', r'whatsapp\s+(?:your\s+resume|us\s+at)',
    r'contact\s+via\s+whatsapp\s+only', r'whatsapp\s+number\s*:\s*\+?\d+'
]

def clean_text(text: str) -> str:
    """Clean text by removing HTML entities, URLs, special characters, and extra spaces."""
    if not text:
        return ""
    text = str(text)
    text = html.unescape(text)
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Remove email addresses from raw text for general n-gram NLP cleaning
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' ', text)
    # Remove extra punctuation but keep alphabets, numbers, and basic spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    # Lowercase and normalize whitespace
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_domain_from_email(email: str) -> str:
    """Extract domain from email address."""
    if not email:
        return ""
    email = str(email).strip().lower()
    match = re.search(r'@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', email)
    return match.group(1) if match else ""

def is_free_email_domain(email: str) -> bool:
    """Check if the email uses a known free public email provider."""
    domain = extract_domain_from_email(email)
    return domain in FREE_EMAIL_DOMAINS

def extract_suspicious_signals(
    title: str = "",
    company: str = "",
    description: str = "",
    requirements: str = "",
    email: str = "",
    website: str = "",
    stipend: str = "",
    fee: str = "",
    full_text: str = ""
) -> dict:
    """
    Inspect all input fields and text for red-flag patterns.
    Returns a dictionary of detected flags, explanations, and risk weights.
    """
    combined_raw = f"{title} {company} {description} {requirements} {stipend} {fee} {full_text}"
    cleaned = combined_raw.lower()
    
    signals = []
    suspicious_score_contribution = 0
    
    # 1. Registration / Security Fee (Critical Red Flag - Real internships never charge)
    has_explicit_fee = False
    fee_val_clean = str(fee).strip().lower()
    if fee_val_clean and fee_val_clean not in {'0', 'no', 'none', 'nil', 'free', 'n/a', 'na'}:
        has_explicit_fee = True
        
    fee_matches = [k for k in FEE_KEYWORDS if re.search(k, cleaned)]
    if has_explicit_fee or fee_matches:
        signals.append({
            "id": "fee_requested",
            "title": "Registration or Training Fee Detected",
            "severity": "CRITICAL",
            "weight": 35,
            "explanation": "Legitimate employers never demand registration fees, security deposits, or training charges from interns.",
            "evidence": f"Found fee mentions or specified fee: '{fee}'" if has_explicit_fee else "Text contains payment/deposit terms."
        })
        suspicious_score_contribution += 35

    # 2. Free Recruiter Email Provider
    if email:
        domain = extract_domain_from_email(email)
        if domain in FREE_EMAIL_DOMAINS:
            signals.append({
                "id": "free_email_domain",
                "title": "Free Public Email Used by Recruiter",
                "severity": "HIGH",
                "weight": 20,
                "explanation": f"Recruiter is using a free email provider (@{domain}). Genuine corporate recruiters hire through verified company domains.",
                "evidence": f"Email address: {email}"
            })
            suspicious_score_contribution += 20
        elif domain:
            # Custom domain looks positive
            signals.append({
                "id": "corporate_email_domain",
                "title": "Corporate Email Domain Detected",
                "severity": "POSITIVE",
                "weight": -10,
                "explanation": f"The recruiter is using a corporate domain (@{domain}), which is typical for established organisations.",
                "evidence": f"Email domain: {domain}"
            })
            suspicious_score_contribution -= 10

    # 3. Sensitive Personal Documents Requested Early
    sensitive_matches = [k for k in SENSITIVE_DOC_KEYWORDS if re.search(k, cleaned)]
    if sensitive_matches:
        signals.append({
            "id": "sensitive_docs_requested",
            "title": "Sensitive Identity / Banking Info Demanded",
            "severity": "HIGH",
            "weight": 25,
            "explanation": "Requesting Aadhaar, PAN card, or bank credentials before an offer or verified onboarding indicates identity theft risk.",
            "evidence": f"Identified sensitive terms: {', '.join(sensitive_matches[:3])}"
        })
        suspicious_score_contribution += 25

    # 4. WhatsApp-Only Hiring
    whatsapp_matches = [k for k in WHATSAPP_HIRING_KEYWORDS if re.search(k, cleaned)]
    if whatsapp_matches:
        signals.append({
            "id": "whatsapp_only_hiring",
            "title": "Informal WhatsApp-Only Application Channel",
            "severity": "MEDIUM",
            "weight": 15,
            "explanation": "Recruiting exclusively via direct WhatsApp messages without formal application tracking is typical of scam campaigns.",
            "evidence": "Job text invites candidatures strictly via personal WhatsApp."
        })
        suspicious_score_contribution += 15

    # 5. High Pressure & Urgency Language
    urgency_matches = [k for k in URGENCY_KEYWORDS if re.search(k, cleaned)]
    if urgency_matches:
        signals.append({
            "id": "urgency_pressure",
            "title": "Artificial Urgency & Pressure Tactics",
            "severity": "MEDIUM",
            "weight": 12,
            "explanation": "Phrases like 'limited seats', 'instant offer', or 'direct selection without interview' pressure students to act without verifying.",
            "evidence": f"Detected urgency phrases: {', '.join(urgency_matches[:3])}"
        })
        suspicious_score_contribution += 12

    # 6. Unrealistic Stipend Claims
    stipend_matches = [k for k in UNREALISTIC_STIPEND_KEYWORDS if re.search(k, cleaned)]
    stipend_num = 0
    if stipend:
        nums = re.findall(r'\d+', str(stipend).replace(',', ''))
        if nums:
            stipend_num = int(nums[0])
            
    if stipend_matches or stipend_num >= 60000:
        signals.append({
            "id": "unrealistic_stipend",
            "title": "Unrealistically High Stipend Claim",
            "severity": "MEDIUM",
            "weight": 15,
            "explanation": "Excessively high stipends for freshers/no-experience roles ('earn 50k+/mo typing') are classic clickbait scam hooks.",
            "evidence": f"Reported stipend: {stipend or 'Unrealistic terms in description'}"
        })
        suspicious_score_contribution += 15

    # 7. Short, Vague, or Missing Job Description
    combined_desc = f"{description} {full_text}".strip()
    words = combined_desc.split()
    if len(words) < 25 and len(words) > 0:
        signals.append({
            "id": "vague_description",
            "title": "Extremely Short or Vague Job Description",
            "severity": "LOW",
            "weight": 10,
            "explanation": "Scam postings often lack specific role deliverables, structured requirements, or company background.",
            "evidence": f"Description contains only {len(words)} words."
        })
        suspicious_score_contribution += 10
    elif len(words) >= 60:
        # Detailed structured descriptions lean genuine
        signals.append({
            "id": "structured_description",
            "title": "Comprehensive Description Provided",
            "severity": "POSITIVE",
            "weight": -5,
            "explanation": "The posting contains detailed responsibilities and structured role specifications.",
            "evidence": f"Description length: {len(words)} words."
        })
        suspicious_score_contribution -= 5

    # 8. Missing Company Website or Verification Profile
    if not website or website.strip().lower() in {'none', 'no', 'n/a', 'na', ''}:
        signals.append({
            "id": "missing_website",
            "title": "No Verified Company Website Provided",
            "severity": "LOW",
            "weight": 8,
            "explanation": "Legitimate businesses have public websites, official domain names, and active career pages.",
            "evidence": "Website field was left empty."
        })
        suspicious_score_contribution += 8
    else:
        signals.append({
            "id": "website_present",
            "title": "Company Website Link Provided",
            "severity": "POSITIVE",
            "weight": -5,
            "explanation": "A company website was supplied for cross-checking.",
            "evidence": f"Provided URL: {website}"
        })
        suspicious_score_contribution -= 5

    # 9. Excessive Capitalization or Spammy Punctuation
    caps_count = sum(1 for c in combined_raw if c.isupper())
    total_letters = sum(1 for c in combined_raw if c.isalpha())
    caps_ratio = (caps_count / total_letters) if total_letters > 20 else 0
    if caps_ratio > 0.40 or combined_raw.count('!!!') > 1 or combined_raw.count('$$$') > 0:
        signals.append({
            "id": "spammy_formatting",
            "title": "Aggressive All-Caps / Spammy Formatting",
            "severity": "LOW",
            "weight": 8,
            "explanation": "Frequent exclamation marks and all-caps headings are common in fraudulent bulk spam messages.",
            "evidence": f"High capitalization ratio: {int(caps_ratio*100)}%"
        })
        suspicious_score_contribution += 8

    return {
        "signals": signals,
        "score_delta": suspicious_score_contribution
    }
