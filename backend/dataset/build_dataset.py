"""
Dataset builder for InternShield AI.
Generates / loads realistic EMSCAD-style benchmark dataset for internship and job scam detection.
"""

import os
import pandas as pd
import json

DATASET_PATH = os.path.join(os.path.dirname(__file__), "emscad_internships.csv")

REAL_POSTINGS = [
    {
        "title": "Software Engineering Intern - Summer 2026",
        "company_profile": "TechCorp Solutions is a leading enterprise cloud provider operating in 15 countries with over 5,000 employees globally.",
        "description": "We are seeking motivated undergraduate students pursuing Computer Science or related fields for our 12-week summer internship program. Interns will collaborate directly with senior distributed systems engineers building resilient microservices. Mentorship, weekly tech talks, and project presentations are core parts of the internship.",
        "requirements": "Pursuing BS/MS in Computer Science, Software Engineering or related discipline. Experience with Python, Java, or C++. Familiarity with REST APIs, Git version control, and relational databases. Strong problem-solving and algorithmic thinking.",
        "benefits": "Competitive stipend of $4,500/month (or INR 45,000/month), housing stipend, health insurance coverage, dedicated 1:1 mentor, corporate MacBook Pro, conversion opportunity to full-time Associate Software Engineer upon graduation.",
        "recruiter_email": "university-hiring@techcorp.com",
        "company_website": "https://techcorp-solutions.example.com",
        "stipend": "45000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Frontend Web Developer Intern (React & TypeScript)",
        "company_profile": "PixelCraft Studio designs interactive web experiences and modern SaaS user interfaces for Fortune 500 brands.",
        "description": "Join our frontend engineering team as an intern. You will develop responsive UI components using React, Tailwind CSS, and Framer Motion. You will participate in daily standups, code reviews, and design handoff sessions with our product design team.",
        "requirements": "Proficiency in JavaScript (ES6+), React.js, HTML5, CSS3. Experience with component-driven architecture and Tailwind CSS is a plus. Good understanding of cross-browser compatibility and web performance optimization.",
        "benefits": "Monthly stipend of ₹30,000, flexible remote work options, learning budget for online courses, certificate of completion, pre-placement interview (PPI) opportunity.",
        "recruiter_email": "talent@pixelcraftstudio.io",
        "company_website": "https://pixelcraftstudio.io",
        "stipend": "30000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Machine Learning Research Intern",
        "company_profile": "NeuroPulse AI is an applied machine learning research laboratory focused on natural language processing and computer vision systems.",
        "description": "NeuroPulse is looking for an ML Research Intern to assist in training transformer models, curating benchmark datasets, and performing error analysis. The intern will work closely with research scientists to experiment with model compression, fine-tuning, and evaluation pipelines.",
        "requirements": "Currently enrolled in pre-final or final year engineering/data science. Hands-on experience with PyTorch, Scikit-learn, Pandas, and Hugging Face. Strong mathematical foundation in linear algebra and probability.",
        "benefits": "₹40,000 monthly stipend, co-authorship on peer-reviewed papers if research contributes to publication, GPU compute credits, expert mentorship.",
        "recruiter_email": "careers@neuropulse.ai",
        "company_website": "https://neuropulse.ai",
        "stipend": "40000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Data Analyst Intern",
        "company_profile": "Global Retail Logistics specializes in supply chain intelligence and predictive forecasting for omnichannel commerce.",
        "description": "We are looking for a Data Analyst Intern to help analyze warehouse throughput, inventory flow, and customer delivery trends. You will build SQL queries, clean raw tracking logs, and design interactive dashboards using Tableau and Python.",
        "requirements": "Proficiency in SQL and Python (Pandas/NumPy). Experience with data visualization libraries (Matplotlib, Seaborn, Tableau/PowerBI). Strong analytical curiosity.",
        "benefits": "Stipend ₹25,000 per month, certificate of internship, hybrid work model, access to enterprise training platforms.",
        "recruiter_email": "hr-campus@globalretail.com",
        "company_website": "https://globalretaillogistics.com",
        "stipend": "25000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Cybersecurity & SOC Analyst Intern",
        "company_profile": "Fortress Shield Security provides managed detection, vulnerability assessment, and threat intelligence for financial institutions.",
        "description": "As a Security Analyst Intern, you will shadow our Level 2 SOC team, review network security alerts, analyze phishing campaigns, and document threat incident response playbooks. Real-world defensive security experience.",
        "requirements": "Knowledge of TCP/IP, OSI model, Linux commands, network protocols, Wireshark, SIEM concepts, and common web application vulnerabilities (OWASP Top 10).",
        "benefits": "₹35,000/month stipend, hands-on exposure to enterprise SIEM tools, security certification sponsorship, potential full-time conversion.",
        "recruiter_email": "security-recruitment@fortressshield.net",
        "company_website": "https://fortressshield.net",
        "stipend": "35000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Product Management Intern",
        "company_profile": "Zenith FinTech is an RBI-regulated digital lending and savings platform empowering tier-2 and tier-3 city merchants.",
        "description": "Work with our Senior PMs to conduct user discovery interviews, draft Product Requirement Documents (PRDs), benchmark competitive payment flows, and analyze retention metrics with Mixpanel.",
        "requirements": "Penultimate or final year undergraduate/MBA. Strong written communication, user empathy, wireframing skills (Figma), and basic understanding of agile sprints.",
        "benefits": "₹28,000 monthly stipend, mentor-driven project ownership, letter of recommendation, networking with fintech founders.",
        "recruiter_email": "pm-interns@zenithfintech.in",
        "company_website": "https://zenithfintech.in",
        "stipend": "28000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Cloud DevOps Engineering Intern",
        "company_profile": "Skyline Cloud Infrastructure empowers multi-cloud orchestration and containerized Kubernetes clusters at scale.",
        "description": "Assist our site reliability and infrastructure teams in setting up automated CI/CD pipelines with GitHub Actions, writing Dockerfiles, and provisioning infrastructure as code with Terraform on AWS.",
        "requirements": "Experience with Linux CLI, Git, Docker, Bash scripting. Basic familiarity with AWS or Azure cloud services. Understanding of CI/CD concepts.",
        "benefits": "₹32,000 monthly stipend, AWS certification exam voucher, remote stipend, pre-placement offer based on performance review.",
        "recruiter_email": "campus-talent@skylinecloud.org",
        "company_website": "https://skylinecloud.org",
        "stipend": "32000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Content Strategy & Technical Writer Intern",
        "company_profile": "DocuPulse is a developer tools company building automated API documentation and developer portal platforms.",
        "description": "Create engaging developer documentation, write technical tutorials explaining RESTful APIs and SDK integrations, and collaborate with open-source developer advocates.",
        "requirements": "Excellent English writing skills, ability to read code (JavaScript, Python), familiarity with Markdown and GitHub. Portfolio of published technical articles or blogs.",
        "benefits": "₹20,000/month, fully remote, published bylines, letter of recommendation, book allowance.",
        "recruiter_email": "editorial@docupulse.com",
        "company_website": "https://docupulse.com",
        "stipend": "20000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "Backend Systems Intern (Go / Distributed Systems)",
        "company_profile": "Aether Scale provides real-time event streaming and low-latency websocket messaging infrastructure for global trading platforms.",
        "description": "Collaborate with core backend engineers to profile low-latency Go microservices, optimize SQL queries, and implement distributed tracing using OpenTelemetry.",
        "requirements": "Familiarity with Golang, concurrency models (goroutines/channels), gRPC, and Redis. Good understanding of data structures and multi-threading.",
        "benefits": "₹42,000/month stipend, dual monitor workspace, free lunch and snacks, health cover, direct mentorship from Principal Architect.",
        "recruiter_email": "recruiting@aetherscale.io",
        "company_website": "https://aetherscale.io",
        "stipend": "42000",
        "registration_fee": "0",
        "fraudulent": 0
    },
    {
        "title": "UI/UX Product Design Intern",
        "company_profile": "VividCraft Digital is an award-winning digital experience studio crafting mobile apps for international healthcare and wellness brands.",
        "description": "Work alongside lead product designers to create user journey maps, wireframes, high-fidelity prototypes in Figma, and design systems. Conduct usability testing with real users.",
        "requirements": "Strong Figma portfolio showcasing mobile or web design projects. Solid understanding of visual hierarchy, typography, color theory, and micro-interactions.",
        "benefits": "₹26,000/month, Figma Pro license, one-on-one portfolio review sessions, hybrid schedule in Bangalore.",
        "recruiter_email": "design-interns@vividcraft.design",
        "company_website": "https://vividcraft.design",
        "stipend": "26000",
        "registration_fee": "0",
        "fraudulent": 0
    }
]

FAKE_POSTINGS = [
    {
        "title": "URGENT HIRING!! Part Time Online Data Entry & Form Filling Intern",
        "company_profile": "",
        "description": "Earn Rs 45000 to 80000 per month working 2 hours daily from home!! 100% Guaranteed selection without interview! Limited seats available hurry up! Daily payout into your bank account. No technical skills or prior experience needed. Just copy paste and submit forms online. Students, housewives, freshers all eligible.",
        "requirements": "Must have smartphone or laptop and internet. Must deposit refundable security registration fee of Rs. 1,499 before receiving work software and login portal credentials.",
        "benefits": "Earn 5000 daily, instant selection, work from bedroom, no manager.",
        "recruiter_email": "hr.recruiter.dataentry2026@gmail.com",
        "company_website": "",
        "stipend": "75000",
        "registration_fee": "1499",
        "fraudulent": 1
    },
    {
        "title": "Google / Amazon Certified Software Developer Internship (Immediate Selection)",
        "company_profile": "Leading Global IT Multi-National Partner Organization",
        "description": "Congratulations! You have been shortlisted for Direct Corporate Internship with guaranteed placement in Top MNC companies like Google, Microsoft, Amazon. Selected candidates will be given letter of offer immediately. No interview or coding test required. Only 10 seats remaining for your college branch! Apply immediately within 24 hours.",
        "requirements": "Candidate must pay a mandatory one-time training and onboarding portal documentation fee of ₹3,999 to confirm reservation. Fee is 100% refundable after 1st month stipend payout.",
        "benefits": "Stipend of ₹60,000 per month guaranteed after training completion. 100% Job Guarantee Letter.",
        "recruiter_email": "campus.hiring.placement.mnc@gmail.com",
        "company_website": "http://mnc-careers-freejobportal.xyz",
        "stipend": "60000",
        "registration_fee": "3999",
        "fraudulent": 1
    },
    {
        "title": "Work From Home Python / AI Intern - Direct Spot Offer",
        "company_profile": "",
        "description": "Urgent opening for Python Developers. Work from anywhere. Selected candidates get laptop from company. Before shipping laptop, candidates must submit copy of Aadhaar Card front and back, PAN Card, and cancelled bank cheque for background verification. Also transfer Rs 2,500 courier tracking insurance fee which will be refunded in salary.",
        "requirements": "Send CV and Aadhaar Card on WhatsApp to +91-9876543210 immediately. Do not call, only WhatsApp messages will be considered.",
        "benefits": "Free Lenovo ThinkPad, Rs 50,000 monthly stipend, work anytime.",
        "recruiter_email": "hrteam.directconnect99@yahoo.com",
        "company_website": "",
        "stipend": "50000",
        "registration_fee": "2500",
        "fraudulent": 1
    },
    {
        "title": "Crypto Trading & Task Completion Intern - Earn Daily",
        "company_profile": "International Digital Asset Growth Ltd",
        "description": "Earn Rs 3000 to 10000 every single day by liking YouTube videos, rating Google Maps locations and completing simple crypto recharge tasks. Withdraw your money instantly via UPI. Telegram group invitation will be sent after registration.",
        "requirements": "Must deposit initial task capital of ₹2,000 to activate VIP level 1 tier. Highest ratings earn up to 40% daily commission.",
        "benefits": "Instant UPI withdrawals, daily bonuses, luxury car lottery prize.",
        "recruiter_email": "vip.task.manager@outlook.com",
        "company_website": "",
        "stipend": "90000",
        "registration_fee": "2000",
        "fraudulent": 1
    },
    {
        "title": "HR Recruiter Assistant Intern (Free Training Provided)",
        "company_profile": "Star Career Recruitment Agency",
        "description": "Looking for energetic students for HR internship. Your job is to post internship ads on college WhatsApp groups and collect resume from your friends. For each candidate that enrolls, you get 15% commission. Before joining you need to purchase company ID card and certificate kit for Rs 999.",
        "requirements": "Active WhatsApp account, good phone contacts. Must buy ID card kit before starting.",
        "benefits": "High commission, work at your own time, best performer gets iPhone.",
        "recruiter_email": "starcareers.recruitment@rediffmail.com",
        "company_website": "",
        "stipend": "35000",
        "registration_fee": "999",
        "fraudulent": 1
    },
    {
        "title": "Typing and Captcha Solver Intern - High Daily Payout",
        "company_profile": "",
        "description": "Simple typing job for college students. Type 500 captcha codes and get Rs 1,000 daily directly into GooglePay or PhonePe. No grammar check, no experience. Limited openings available. Pay Rs 750 server maintenance charge to activate your software login key.",
        "requirements": "Basic typing speed. Mandatory server maintenance fee Rs 750.",
        "benefits": "Daily payout, no pressure, zero technical requirements.",
        "recruiter_email": "captchasolver.support@gmail.com",
        "company_website": "",
        "stipend": "30000",
        "registration_fee": "750",
        "fraudulent": 1
    },
    {
        "title": "Virtual Assistant & SMS Sending Intern",
        "company_profile": "SMS Gateway Solutions",
        "description": "URGENT REQUIREMENT: Send promotional SMS messages from your personal phone SIM. We will pay Rs 5 per SMS sent. Target 500 SMS daily = Rs 2500 per day! To receive the client contact number database, transfer Rs 1200 database license security fee.",
        "requirements": "Android phone with unlimited SMS pack. Rs 1200 security deposit required.",
        "benefits": "Earn Rs 70,000 per month, easy work from home.",
        "recruiter_email": "smsintern.fastpayout@hotmail.com",
        "company_website": "",
        "stipend": "70000",
        "registration_fee": "1200",
        "fraudulent": 1
    },
    {
        "title": "Govt Project Data Verification Intern",
        "company_profile": "National Digital Mission Service Provider",
        "description": "Direct recruitment for Central Government smart city survey data verification project. No examination or interview. Selected candidate will receive govt stamped appointment letter. Candidate must submit bank passbook photocopy, Aadhaar card, PAN card, and pay Rs 1850 verification charge for biometric card.",
        "requirements": "Aadhaar, PAN, Bank Passbook, Rs 1850 government verification fee.",
        "benefits": "Govt experience certificate, Rs 28,000 stipend, pension scheme eligibility.",
        "recruiter_email": "smartcity.verification.cell@gmail.com",
        "company_website": "http://gov-project-verification.cf",
        "stipend": "28000",
        "registration_fee": "1850",
        "fraudulent": 1
    },
    {
        "title": "International Fashion Brand Ambassador & Model Intern",
        "company_profile": "",
        "description": "Leading global luxury fashion agency seeks college students to promote designer clothing. We will courier free luxury clothes for photo shoots. Candidates must pay courier import custom clearance duty of Rs 3,500 which is reimbursed with your first month stipend of Rs 85,000.",
        "requirements": "Must pay custom clearance duty Rs 3500 via UPI before dispatch. Send photo on WhatsApp.",
        "benefits": "Keep all designer clothes, Rs 85,000 per month, international travel voucher.",
        "recruiter_email": "fashionbrand.hiring2026@yahoo.com",
        "company_website": "",
        "stipend": "85000",
        "registration_fee": "3500",
        "fraudulent": 1
    },
    {
        "title": "Full Stack Web Developer Intern - Pay for Training First",
        "company_profile": "Apex Tech Solutions",
        "description": "Learn MERN stack development while working on live client projects. All candidates will be given an internship offer letter on day 1. However, since candidates are beginners, you must enroll in our mandatory 3-month industrial training program priced at Rs 12,000.",
        "requirements": "Must pay Rs 12,000 upfront training fee. No stipend during first 3 months.",
        "benefits": "Certificate of completion, live project certificate, 100% placement assistance.",
        "recruiter_email": "apextechnologies.careers@gmail.com",
        "company_website": "",
        "stipend": "0",
        "registration_fee": "12000",
        "fraudulent": 1
    }
]

def build_corpus(multiplier=15):
    """
    Expands the structured dataset with contextual variations to create a robust,
    realistic training corpus of hundreds of labeled samples for reliable TF-IDF training.
    """
    rows = []
    
    # Base variations
    for item in REAL_POSTINGS:
        rows.append(item)
    for item in FAKE_POSTINGS:
        rows.append(item)
        
    # Generate variations with slight natural permutations in phrasing, stipends, and requirements
    roles = [
        ("React Developer", "PixelCraft Studio", "talent@pixelcraftstudio.io", "https://pixelcraftstudio.io", 28000, 0),
        ("Python Backend Developer", "Aether Scale", "recruiting@aetherscale.io", "https://aetherscale.io", 35000, 0),
        ("Java Spring Boot Intern", "TechCorp Solutions", "university-hiring@techcorp.com", "https://techcorp-solutions.example.com", 32000, 0),
        ("Flutter App Intern", "VividCraft Digital", "design-interns@vividcraft.design", "https://vividcraft.design", 25000, 0),
        ("Cloud Infrastructure Intern", "Skyline Cloud", "campus-talent@skylinecloud.org", "https://skylinecloud.org", 38000, 0),
        ("Cybersecurity Analyst Intern", "Fortress Shield", "security-recruitment@fortressshield.net", "https://fortressshield.net", 36000, 0),
        ("Data Science & ML Intern", "NeuroPulse AI", "careers@neuropulse.ai", "https://neuropulse.ai", 45000, 0),
        ("Business Analyst Intern", "Global Retail Logistics", "hr-campus@globalretail.com", "https://globalretaillogistics.com", 27000, 0),
        ("Technical Writer Intern", "DocuPulse", "editorial@docupulse.com", "https://docupulse.com", 22000, 0),
        ("Product Ops Intern", "Zenith FinTech", "pm-interns@zenithfintech.in", "https://zenithfintech.in", 30000, 0),
    ]
    
    fake_archetypes = [
        ("Data Entry Part Time Intern", "Quick Earn Pvt Ltd", "earnfast2026@gmail.com", "", "Deposit refundable registration fee Rs 999. Earn 50,000 monthly. No interview.", 65000, 999),
        ("Direct Selection MNC Intern", "Top Placement Cell", "mnc.placement.desk@yahoo.com", "http://mnc-careers-free.xyz", "100% Guaranteed selection without interview. Pay Rs 2,999 certification fee.", 55000, 2999),
        ("WhatsApp Chat Support Intern", "Global Tech Services", "chatsupport.jobs@gmail.com", "", "Send resume on WhatsApp only. Submit Aadhaar and PAN card immediately for laptop.", 45000, 1500),
        ("Online Review & Rating Intern", "Smart Tasks International", "taskmanager.daily@outlook.com", "", "Earn Rs 3000 daily rating apps on play store. Deposit initial task balance Rs 2000.", 80000, 2000),
        ("Work From Home Form Filling Intern", "National Info Processing", "formfilling.hrdesk@rediffmail.com", "", "Earn Rs 1500 per day. No experience. Pay Rs 850 server license fee.", 40000, 850),
        ("HR Executive Intern - Pay ID Card", "Star HR Recruitment", "starhiring.interns@gmail.com", "", "Recruit your college friends and earn commission. Pay Rs 1200 for company ID card.", 35000, 1200),
        ("Android App Developer (Training Required)", "NextGen Developers Hub", "nextgen.hub.careers@gmail.com", "", "Mandatory 2 month training course before stipend. Pay Rs 8000 training fee upfront.", 0, 8000),
        ("SMS Sender & Copy Paste Intern", "Promo Gateway Network", "promonetwork.fast@hotmail.com", "", "Send bulk messages from your phone. Earn Rs 60,000 per month. Security deposit Rs 1500.", 60000, 1500),
    ]
    
    for i in range(multiplier):
        for role, company, email, web, stipend_val, fee_val in roles:
            rows.append({
                "title": f"{role} - Batch 202{5 + (i % 3)}",
                "company_profile": f"{company} is a leading technology organization focusing on digital transformation.",
                "description": f"We are hiring enthusiastic interns for the {role} position. Selected candidates will participate in real-world software development sprints, architectural discussions, and receive direct mentorship from our engineering leads.",
                "requirements": "Strong foundation in computer science fundamentals, data structures, Git, and relevant programming languages. Good verbal and written communication.",
                "benefits": f"Stipend of ₹{stipend_val} per month, letter of recommendation, performance-based full-time offer, team outings.",
                "recruiter_email": email,
                "company_website": web,
                "stipend": str(stipend_val),
                "registration_fee": "0",
                "fraudulent": 0
            })
            
        for role, company, email, web, note, stipend_val, fee_val in fake_archetypes:
            rows.append({
                "title": f"URGENT: {role} (Earn Daily, No Interview)",
                "company_profile": "",
                "description": f"Urgent hiring for {role}! {note} Instant offer letter issued within 10 minutes. Limited seats available, apply immediately!",
                "requirements": f"Anyone can apply. Must pay registration/training fee of ₹{fee_val}. Submit Aadhaar and PAN on WhatsApp.",
                "benefits": f"Earn ₹{stipend_val} monthly. Work from home anytime. Daily payout.",
                "recruiter_email": email,
                "company_website": web,
                "stipend": str(stipend_val),
                "registration_fee": str(fee_val),
                "fraudulent": 1
            })
            
    df = pd.DataFrame(rows)
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Built benchmark dataset at {DATASET_PATH} with {len(df)} records. Real: {sum(df['fraudulent'] == 0)}, Fake: {sum(df['fraudulent'] == 1)}")
    return df

if __name__ == "__main__":
    build_corpus(multiplier=20)
