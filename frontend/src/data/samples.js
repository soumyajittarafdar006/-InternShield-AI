/**
 * Pre-configured sample internship offers for testing and live demonstration.
 */

export const SAMPLE_OFFERS = [
  {
    id: "fake-data-entry",
    name: "🔴 Online Data Entry Deposit Scam",
    badge: "High Risk Scam",
    badgeColor: "red",
    data: {
      title: "Part Time Online Data Entry & Form Filling Intern",
      company: "QuickEarn Digital Services",
      description: "Earn Rs 45,000 to 75,000 per month working 2 hours daily from home! 100% Guaranteed selection without interview! Limited seats available hurry up! Daily payout directly into your GooglePay/PhonePe account. No technical skills or prior experience needed. Just copy paste and submit forms online. Students, freshers all eligible.",
      requirements: "Smartphone or laptop with active internet. Must deposit a refundable security registration fee of Rs. 1,499 before receiving work software license and portal credentials.",
      email: "recruiter.fastdataentry2026@gmail.com",
      website: "",
      stipend: "65000",
      registration_fee: "1499",
      duration: "3 Months",
      full_text: "URGENT HIRING!! Part Time Online Data Entry & Form Filling Intern. Earn Rs 45000 to 75000 per month working 2 hours daily from home!! 100% Guaranteed selection without interview! Limited seats available hurry up! Daily payout into your bank account. Must deposit refundable security registration fee of Rs. 1,499. Contact hr.recruiter.dataentry2026@gmail.com"
    }
  },
  {
    id: "fake-mnc-placement",
    name: "🔴 Guaranteed MNC Placement Bait",
    badge: "High Risk Scam",
    badgeColor: "red",
    data: {
      title: "Google / Amazon Certified Software Developer Intern",
      company: "Top Placement Partners Global",
      description: "Congratulations! You have been shortlisted for Direct Corporate Internship with 100% guaranteed placement in Top MNC companies like Google, Microsoft, Amazon. Selected candidates will be given letter of offer immediately. No interview or coding test required. Only 10 seats remaining for your college branch! Apply immediately within 24 hours.",
      requirements: "Candidate must pay a mandatory one-time training and onboarding portal documentation fee of ₹3,999 to confirm reservation. Fee is 100% refundable after 1st month stipend payout. Also send Aadhaar Card and PAN card on WhatsApp.",
      email: "campus.hiring.placement.mnc@yahoo.com",
      website: "http://mnc-careers-freejobportal.xyz",
      stipend: "60000",
      registration_fee: "3999",
      duration: "6 Months",
      full_text: "Congratulations! Direct Corporate Internship with guaranteed placement in Google and Amazon. No interview required. Pay mandatory training fee ₹3,999. Send Aadhaar and PAN on WhatsApp. Email: campus.hiring.placement.mnc@yahoo.com"
    }
  },
  {
    id: "real-techcorp-swe",
    name: "🟢 TechCorp Software Engineer Intern",
    badge: "Genuine Opportunity",
    badgeColor: "green",
    data: {
      title: "Software Engineering Intern - Summer 2026",
      company: "TechCorp Solutions Inc.",
      description: "We are seeking motivated undergraduate students pursuing Computer Science or related fields for our 12-week summer internship program. Interns will collaborate directly with senior distributed systems engineers building resilient microservices. Mentorship, weekly tech talks, and project presentations are core parts of the internship.",
      requirements: "Pursuing BS/B.Tech in Computer Science or related discipline. Experience with Python, Java, or C++. Familiarity with REST APIs, Git version control, and relational databases. Strong problem-solving and algorithmic thinking.",
      email: "university-hiring@techcorp.com",
      website: "https://techcorp-solutions.example.com",
      stipend: "45000",
      registration_fee: "0",
      duration: "3 Months (Summer)",
      full_text: "TechCorp Solutions is seeking a Software Engineering Intern for Summer 2026. Work on distributed systems and microservices. Competitive stipend INR 45,000/month, dedicated 1:1 mentor. No fees charged. Apply via university-hiring@techcorp.com"
    }
  },
  {
    id: "real-pixelcraft-frontend",
    name: "🟢 PixelCraft React Frontend Intern",
    badge: "Genuine Opportunity",
    badgeColor: "green",
    data: {
      title: "Frontend Web Developer Intern (React & TypeScript)",
      company: "PixelCraft Studio",
      description: "Join our frontend engineering team as an intern. You will develop responsive UI components using React, Tailwind CSS, and Framer Motion. You will participate in daily standups, code reviews, and design handoff sessions with our product design team.",
      requirements: "Proficiency in JavaScript (ES6+), React.js, HTML5, CSS3. Experience with component-driven architecture and Tailwind CSS is a plus. Good understanding of cross-browser compatibility and web performance optimization.",
      email: "talent@pixelcraftstudio.io",
      website: "https://pixelcraftstudio.io",
      stipend: "30000",
      registration_fee: "0",
      duration: "6 Months",
      full_text: "PixelCraft Studio is hiring a Frontend Web Developer Intern (React & TypeScript). Monthly stipend ₹30,000, remote work options, pre-placement interview (PPI) opportunity. Email: talent@pixelcraftstudio.io, website: https://pixelcraftstudio.io"
    }
  },
  {
    id: "borderline-whatsapp",
    name: "🟡 Unverified WhatsApp Social Intern",
    badge: "Medium Risk / Caution",
    badgeColor: "yellow",
    data: {
      title: "Social Media Outreach Intern",
      company: "Viral Growth Agency",
      description: "Assist our marketing team in creating reels and sharing posts across university community groups. Quick response required. Candidates must have an active Instagram account.",
      requirements: "Basic video editing skills on Canva or CapCut. Good communication. Send samples directly over WhatsApp.",
      email: "growthagency.contact@gmail.com",
      website: "",
      stipend: "15000",
      registration_fee: "0",
      duration: "1 Month",
      full_text: "Viral Growth Agency seeks Social Media Outreach Intern. Stipend ₹15,000. Send portfolio on WhatsApp. Uses free gmail recruiter address."
    }
  }
];

export const DEMO_HISTORY_SEED = [
  {
    id: "hist-001",
    created_at: "2026-11-12 11:20:15",
    title: "Part Time Online Data Entry & Form Filling Intern",
    company: "QuickEarn Digital Services",
    prediction: "Fake",
    risk_score: 88,
    risk_level: "High Risk",
    model_used: "Logistic Regression (TF-IDF)"
  },
  {
    id: "hist-002",
    created_at: "2026-11-12 10:15:42",
    title: "Software Engineering Intern - Summer 2026",
    company: "TechCorp Solutions Inc.",
    prediction: "Real",
    risk_score: 18,
    risk_level: "Low Risk",
    model_used: "Logistic Regression (TF-IDF)"
  },
  {
    id: "hist-003",
    created_at: "2026-11-11 16:45:00",
    title: "Google / Amazon Certified Software Developer Intern",
    company: "Top Placement Partners Global",
    prediction: "Fake",
    risk_score: 94,
    risk_level: "High Risk",
    model_used: "Logistic Regression (TF-IDF)"
  },
  {
    id: "hist-004",
    created_at: "2026-11-11 14:02:11",
    title: "Frontend Web Developer Intern (React & TypeScript)",
    company: "PixelCraft Studio",
    prediction: "Real",
    risk_score: 12,
    risk_level: "Low Risk",
    model_used: "Logistic Regression (TF-IDF)"
  },
  {
    id: "hist-005",
    created_at: "2026-11-10 09:30:25",
    title: "Social Media Outreach Intern",
    company: "Viral Growth Agency",
    prediction: "Real (With Caution)",
    risk_score: 48,
    risk_level: "Medium Risk",
    model_used: "Logistic Regression (TF-IDF)"
  }
];
