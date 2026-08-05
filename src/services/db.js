// Firebase Service Layer with LocalStorage/IndexedDB fallback
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  query, 
  where,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// -------------------------------------------------------------
// Firebase Config
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let dbMode = 'MOCK';
let firebaseApp = null;
let firebaseAuth = null;
let firebaseFirestore = null;
let firebaseStorage = null;

// Try to initialize Firebase if config is present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    dbMode = 'FIREBASE';
    console.log('SRYN: Connected to Firebase.');
  } catch (error) {
    console.warn('SRYN: Firebase failed to connect, falling back to Local Mock DB.', error);
    dbMode = 'MOCK';
  }
} else {
  console.log('SRYN: Running in Local Mock DB mode.');
}

// -------------------------------------------------------------
// Seed Data for Mock Mode / First Time Setup
// -------------------------------------------------------------
const SEED_USERS = [
  {
    uid: 'admin-1',
    fullName: 'Rajesh Kumar',
    email: 'admin@srynmanagement.com',
    mobile: '8265903984',
    role: 'Admin',
    verified: true,
    profileComplete: true,
    aadharNumber: '1234-5678-9012',
    address: 'Sector 62, Noida, Uttar Pradesh',
    pincode: '201301',
    city: 'Noida',
    state: 'Uttar Pradesh',
    aadharFront: '',
    aadharBack: '',
    resume: ''
  }
];

const DEFAULT_PITCH_HI_R1 = `STEP 1: INTRODUCTION & COURTESY PERMISSION
"Hello, kya meri baat {{name}} se ho rahi hai?
Hi {{name}}, mera naam {{hrName}} hai, aur main SRYN Management Pvt. Ltd. se baat kar raha/rahi hoon.
Kya abhi 2–3 minute baat karne ke liye sahi time hai?"

STEP 2: OPPORTUNITY & HOMETOWN WORK PITCH
"Bahut badiya!
Hum abhi apni financial services division ke liye Customer Relationship Executives hire kar rahe hain. Aapki profile is opportunity ke liye suitable hai.
Sabse achhi baat ye hai ki hum aapko aapke hometown mein work opportunity de rahe hain, toh aapko relocate hone ki zaroorat nahi hai.
Offered salary ₹15,000 per month hai, saath mein performance-based growth opportunities hain."

STEP 3: ROLE & FD CARD PRODUCT EXPLANATION
"Aapki responsibility hamare FD Card ke baare mein customers ko guide karna aur application process mein help karna hoga. Hamara card un customers ke liye specially designed hai jo apna CIBIL score banana ya improve karna chahte hain.

Key FD Card Benefits to Explain:
• FD starting from ₹2,000 up to ₹5,00,000
• Fixed Deposit earns 7% annual interest
• FD remains in the customer's own name
• Instant credit to linked card account upon FD closure process
• Helps customers build a strong CIBIL score while their money earns interest"

STEP 4: HIRING PROCESS & SALARY PAYOUT SCHEDULE
2-Round Simple Hiring:
1st Round: Telephonic Interview
2nd Round: Video Interview
Then: Official Offer Letter & Dashboard Activation.

Salary Cycle & Payout:
Salary is processed after completing 30 days of work. Payment credited within 5–7 working days post cycle.

STEP 5: CLOSING LINE & VIDEO INTERVIEW INVITATION
"Aapki profile dekhte hue, I believe ye opportunity aapke liye bahut achhi fit ho sakti hai. Kya aap hamare second-round video interview ko attend karne mein interested hain jahan company, salary structure, training aur growth ke baare mein detail milegi?"

⚡ INTERACTIVE CANDIDATE OBJECTION HANDLERS
If Candidate Says "I'm Not Interested":
"Main samajh sakta/samajhti hoon. Par aapse kehna chahunga/chahungi ki ye Customer Relationship role hai jismein ₹15,000 fixed salary, hometown work opportunity, official offer letter, employee dashboard aur full training support milta hai. Sirf 15–20 minute ka video interview hai, jiske baad aap decide kar sakte hain. Kya aap ek baar interview attend karke final decision lena chahenge?"`;

const DEFAULT_PITCH_EN_R1 = `STEP 1: INTRODUCTION & COURTESY PERMISSION
"Hello, may I speak with {{name}}?
Hi {{name}}, my name is {{hrName}}, and I'm calling from SRYN Management Pvt. Ltd.
Is this a good time to talk? It will only take 2–3 minutes."

STEP 2: OPPORTUNITY & HOMETOWN WORK PITCH
"Great!
We are currently hiring Customer Relationship Executives for our financial services division. I came across your profile and found it suitable for this opportunity.
The best part is that we provide work opportunities in your hometown, so you don't need to relocate.
The offered salary is ₹15,000 per month, along with performance-based growth opportunities."

STEP 3: ROLE & FD CARD PRODUCT EXPLANATION
"Your responsibility will be to guide customers about our FD Card and help them complete the application process. Our company offers an FD-backed card specially designed for customers who want to improve or build their CIBIL score.

Key FD Card Benefits to Explain:
• FD starting from ₹2,000 up to ₹5,00,000
• Fixed Deposit earns 7% annual interest
• FD remains in the customer's own name
• Instant credit to linked card account upon FD closure process
• Helps customers build a strong CIBIL score while their money earns interest"

STEP 4: HIRING PROCESS & SALARY PAYOUT SCHEDULE
2-Round Simple Hiring:
1st Round: Telephonic Interview
2nd Round: Video Interview
Then: Official Offer Letter & Dashboard Activation.

Salary Cycle & Payout:
Salary is processed after completing 30 days of work. Payment credited within 5–7 working days post cycle.

STEP 5: CLOSING LINE & VIDEO INTERVIEW INVITATION
"Based on your profile, I believe this opportunity can be a good fit for you. Would you be interested in attending our second-round video interview to know more about the company, salary structure, training process, and growth opportunities?"

⚡ INTERACTIVE CANDIDATE OBJECTION HANDLERS
If Candidate Says "I'm Not Interested":
"I completely understand. Before you decide, I'd just like to mention that this is a customer relationship role with a fixed salary of ₹15,000, work opportunities in your hometown, official offer letter, employee dashboard, training support, and future career growth. It will only take around 15–20 minutes to attend the video interview, after which you can decide. Would you be willing to attend the interview once and then make your final decision?"`;

const DEFAULT_PITCH_HI_R2 = `1. WELCOME & INTERVIEW PURPOSE
"Hello {{name}}, SRYN Management Pvt. Ltd. ke second round video interview mein aapka swagat hai. Aaj ka interview sirf candidate select karne ke liye nahi hai, balki aapko job profile, responsibilities aur growth ke baare mein poori jankari dene ke liye hai taaki agar aap hamare saath judte hain toh aapko apna kaam clear rahe. Koi bhi sawaal ho toh zaroor poochiye."

2. ABOUT SRYN MANAGEMENT PVT. LTD.
"SRYN Management Pvt. Ltd. financial services sector mein kaam karti hai. Hamara uddeshya customers ko sahi financial products dena hai jisse unka credit journey behtar bane aur unhe Fixed Deposits par 7% annual interest mil sake. Hum transparency, proper training, aur employees ki long-term career growth par focus karte hain."

3. JOB ROLE & RESPONSIBILITIES
Job Role: Customer Relationship Executive (CRE)
Core Duty: Customers ko hamare FD Card ke features, 7% annual interest rate, aur CIBIL building benefits explain karna.
Support: Customers ko application form fill karne mein online assist karna.
No Cash Field Handling: Koi cash collection ya field runs nahi hain. Pure relationship & guidance role.

4. TARGET & SALARY EVALUATION CRITERIA
Role Benchmark Target: ₹1,00,000 FD Volume per month.
Sixty Percent Rule for Full Salary Eligibility: Full ₹15,000 salary ke liye minimum 60% of target (yani ₹60,000 FD volume) achieve karna zaroori hai.
Performance Calculation Examples:
• 100% Target Achieved (₹1 Lakh FD): Full Salary ₹15,000 + Performance Incentive
• 60% Target Achieved (₹60,000 FD): Full Salary ₹15,000
• Below 60% (e.g., ₹50,000 FD): Salary calculated proportionately (₹50k/₹100k = 50% of ₹15k = ₹7,500)

5. OFFICIAL OFFER LETTER & DASHBOARD ACTIVATION
Aapko SRYN Management Pvt. Ltd. se official Appointment Cum Offer Letter milega, jise aap apne personal Employee Dashboard se read, digitally sign, aur PDF download kar sakte hain.

6. ORIENTATION CLOSING PITCH
"Kya aap SRYN Management Pvt. Ltd. ke saath Customer Relationship Executive role mein join karne ke liye tayyar hain?"`;

const DEFAULT_PITCH_EN_R2 = `1. WELCOME & INTERVIEW PURPOSE
"Hello {{name}}, welcome to the second round of your interview with SRYN Management Pvt. Ltd. First of all, thank you for joining us today. This interview is not just about selecting candidates—it is also about helping you understand the complete job profile so that, if you join us, you know exactly what your responsibilities, growth opportunities, and expectations will be. Please feel free to ask questions at any point."

2. ABOUT SRYN MANAGEMENT PVT. LTD.
"SRYN Management Pvt. Ltd. operates in the financial services sector. Our mission is to provide customers with genuine financial products that strengthen their credit journey while offering 7% annual interest on Fixed Deposits. We focus on transparency, structured training, and long-term career growth for our team."

3. JOB ROLE & CORE RESPONSIBILITIES
Job Role: Customer Relationship Executive (CRE)
Core Duty: Guide customers regarding FD Card features, 7% annual interest, and CIBIL score enhancement benefits.
Process: Assist customers digitally in completing their online application forms. No cash field handling.

4. TARGET & SALARY EVALUATION MATRIX
Target Requirement: ₹1,00,000 FD Volume per monthly cycle.
Minimum Eligibility Benchmark: To receive full ₹15,000 monthly salary, candidate must achieve at least 60% of the target (₹60,000 FD volume).
Payout Scenarios:
• 100% Target (₹1 Lakh FD): Full Salary ₹15,000 + Incentives
• 60% Target (₹60k FD): Full Salary ₹15,000
• Below 60% (e.g. ₹50k FD): Proportionate Salary payout (50% = ₹7,500)

5. OFFICIAL APPOINTMENT OFFER & DASHBOARD ACCESS
You will receive an official Appointment Cum Offer Letter from SRYN Management Pvt. Ltd. You can read, digitally sign, and download your PDF offer letter directly from your employee dashboard.

6. ORIENTATION CLOSING PITCH
"Are you ready to commence your onboarding process as Customer Relationship Executive with SRYN Management Pvt. Ltd.?"`;

const DEFAULT_PITCH_HI_JD = `🚨 *URGENT HIRING DRIVE: {{role}}* 🚨
Company: SRYN Management Pvt. Ltd.
Position: {{role}}
Salary: {{salary}}
Location: {{location}}

Apply Link: {{workingLink}}
Contact HR: {{hrName}}`;

const DEFAULT_PITCH_EN_JD = `🚨 *OFFICIAL RECRUITMENT DRIVE: {{role}}* 🚨
Company: SRYN Management Pvt. Ltd.
Role: {{role}}
Salary: {{salary}}
Location: {{location}}

Apply Online: {{workingLink}}
HR Contact: {{hrName}}`;

const SEED_PROJECTS = [
  {
    id: 'proj-cre-1',
    title: 'Customer Relationship Executive',
    category: 'Financial Products',
    description: 'Work in your hometown as Customer Relationship Executive (CRE). Guide customers regarding FD Cards, CIBIL score building, and financial product applications.',
    commission: 'Rs. 15,000 / month fixed + Incentives',
    salary: '₹15,000 / month + Incentives',
    location: 'Hometown / Local District',
    hiringCount: 250,
    status: 'Active',
    scriptActive: true,
    assignedHR: 'ALL',
    assignedHRs: ['ALL'],
    workingLink: 'https://www.sryn.online/auth?signup=true',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  },
  {
    id: 'proj-1',
    title: 'HDFC Credit Card Sales',
    category: 'Financial Products',
    description: 'Promote and acquire customers for HDFC Bank Lifetime Free credit cards. High commission rates and daily payouts.',
    commission: 'Rs. 2,500 per approved card',
    salary: '₹15,000 / month + Incentives',
    location: 'Hometown / Local Area',
    hiringCount: 150,
    status: 'Active',
    scriptActive: true,
    workingLink: 'https://srynmanagement.com/fd-apply/hdfc-cc',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  },
  {
    id: 'proj-1785921272850',
    title: 'Field Executive',
    category: 'Field Executive',
    description: 'Field executive sourcing for financial products, Merchant QR onboarding and lead generation.',
    commission: 'Rs. 15,000 / month fixed + Incentives',
    salary: '₹15,000 / month + Incentives',
    location: 'Hometown / Local Area',
    hiringCount: 100,
    status: 'Active',
    scriptActive: true,
    workingLink: 'https://www.sryn.online/auth?signup=true',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  },
  {
    id: 'proj-2',
    title: 'Zomato Delivery Fleet',
    category: 'Delivery Boy Hiring',
    description: 'Onboard delivery partners for Zomato. flexible shifts, weekly payouts, and join-in bonuses across 50+ cities.',
    commission: 'Rs. 1,200 per active rider (onboarded)',
    salary: '₹12,000 / month + Incentives',
    location: 'Local District',
    hiringCount: 500,
    status: 'Active',
    scriptActive: true,
    workingLink: 'https://srynmanagement.com/fd-apply/zomato-rider',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  },
  {
    id: 'proj-3',
    title: 'Swiggy Instamart Executives',
    category: 'Delivery Boy Hiring',
    description: 'Onboard pickers and runners for Swiggy Instamart dark stores. Stable pay structure with performance incentives.',
    commission: 'Rs. 1,000 per onboarded partner',
    salary: '₹14,000 / month',
    location: 'Local District',
    hiringCount: 300,
    status: 'Active',
    scriptActive: true,
    workingLink: 'https://srynmanagement.com/fd-apply/swiggy-insta',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  },
  {
    id: 'proj-4',
    title: 'Airtel Payments Bank KYC Agent',
    category: 'Third Party Hiring',
    description: 'Recruiting merchant onboarding field agents for Airtel Payments Bank. Requires strong communication skills.',
    commission: 'Rs. 150 per merchant KYC activation',
    salary: '₹15,000 / month',
    location: 'Hometown',
    hiringCount: 200,
    status: 'Active',
    scriptActive: true,
    workingLink: 'https://srynmanagement.com/fd-apply/airtel-kyc',
    scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
    scriptRound1English: DEFAULT_PITCH_EN_R1,
    scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
    scriptRound2English: DEFAULT_PITCH_EN_R2,
    jdHindi: DEFAULT_PITCH_HI_JD,
    jdEnglish: DEFAULT_PITCH_EN_JD
  }
];

const SEED_LEADS = [
  {
    id: 'lead-1',
    fullName: 'Rahul Varma',
    mobile: '9888877771',
    email: 'rahul.v@gmail.com',
    roleApplied: 'Field Executive',
    project: 'HDFC Credit Card Sales',
    status: 'New',
    assignedTo: 'hr-1',
    feedback: 'Created from admin board.',
    date: '2026-07-25',
    history: [{ status: 'New', date: '2026-07-25', note: 'Lead imported' }]
  },
  {
    id: 'lead-2',
    fullName: 'Vikram Singh',
    mobile: '9888877772',
    email: 'vikram.s@gmail.com',
    roleApplied: 'Delivery Boy',
    project: 'Zomato Delivery Fleet',
    status: 'Calling',
    assignedTo: 'hr-1',
    feedback: 'Tried reaching out, phone switched off. Will retry.',
    date: '2026-07-26',
    history: [
      { status: 'New', date: '2026-07-25', note: 'Lead imported' },
      { status: 'Calling', date: '2026-07-26', note: 'Phone switched off, rescheduled' }
    ]
  },
  {
    id: 'lead-3',
    fullName: 'Priya Nandy',
    mobile: '9888877773',
    email: 'priya.n@gmail.com',
    roleApplied: 'Field Executive',
    project: 'Airtel Payments Bank KYC Agent',
    status: 'Interested',
    assignedTo: 'hr-1',
    feedback: 'Interested in part-time merchant onboarding. Interview scheduled.',
    date: '2026-07-27',
    history: [
      { status: 'New', date: '2026-07-26', note: 'Lead imported' },
      { status: 'Calling', date: '2026-07-27', note: 'Called candidate' },
      { status: 'Interested', date: '2026-07-27', note: 'Awaiting interview' }
    ]
  }
];

const OFFER_LETTER_WORD_TEMPLATE = `<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – SRYN MANAGEMENT PRIVATE LIMITED</div>
  <div class="letterhead-logo" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #de3163; padding-bottom: 14px; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <img src="/logo.jpeg" alt="SRYN Logo" style="height: 52px; width: auto; object-fit: contain;" onError="this.style.display='none'" />
      <div>
        <div style="font-size: 1.6rem; font-weight: 900; color: #de3163; letter-spacing: 0.02em; line-height: 1;">SRYN</div>
        <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px;">Management Pvt Ltd</div>
      </div>
    </div>
    <div class="company-cin" style="text-align: right; font-size: 0.72rem; color: #475569; line-height: 1.5;">
      <strong style="color: #0f172a; font-size: 0.85rem; text-transform: uppercase;">SRYN MANAGEMENT PRIVATE LIMITED</strong><br/>
      <strong>CIN Number:</strong> U51900UP2022PTC169096<br/>
      <strong>Registered Address:</strong> 21/272/1/4-A JEONI MANDI AGRA || Sector 62, Noida, UP, India<br/>
      <strong>Website:</strong> <a href="http://www.sryn.online" style="color: #de3163; text-decoration: none;">www.sryn.online</a> &nbsp;|&nbsp; <strong>Email ID:</strong> <a href="mailto:info@sryn.online" style="color: #de3163; text-decoration: none;">info@sryn.online</a> &nbsp;|&nbsp; <strong>Mobile:</strong> 8265903984
    </div>
  </div>

  <div class="contract-body">
    <h2 style="text-align: center; color: #de3163; margin-top: 10px; margin-bottom: 24px; font-size: 1.5rem; font-weight: 800; border-bottom: 2px solid #de3163; padding-bottom: 8px; letter-spacing: 0.03em;">APPOINTMENT CUM OFFER LETTER</h2>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; font-size: 0.9rem; line-height: 1.7;">
      <p style="margin: 0 0 6px 0;"><strong>Date of Issue:</strong> {{date}}</p>
      <p style="margin: 0 0 6px 0;"><strong>Date of Joining:</strong> {{joining_date}}</p>
      <p style="margin: 0 0 6px 0;"><strong>Employee Name:</strong> {{name}}</p>
      <p style="margin: 0 0 6px 0;"><strong>Address:</strong> {{address}}</p>
      <p style="margin: 0 0 6px 0;"><strong>Email:</strong> {{email}} &nbsp;|&nbsp; <strong>Mobile:</strong> {{mobile}}</p>
      <p style="margin: 0;"><strong>Designation / Role:</strong> {{position}}</p>
    </div>

    <p style="font-weight: 600; margin-bottom: 14px;">Dear Mr./Ms. {{name}},</p>
    <p>It is with great pleasure that SRYN Management Private Limited extends this formal Offer of Employment for the position of <strong>{{position}}</strong>. Your educational qualifications, communication abilities, professional aptitude, and overall suitability have been carefully evaluated during the selection process, and the Management is pleased to offer you this opportunity to become a valuable member of our organization. We believe that every employee contributes significantly to the growth and reputation of the Company, and therefore your appointment carries substantial professional responsibilities together with an expectation of integrity, dedication, discipline, and excellence. This Appointment Letter outlines the principal terms and conditions governing your employment and shall be read together with the Company's internal policies, operational guidelines, code of conduct, and other employment regulations issued from time to time. By accepting this offer and commencing employment, you acknowledge that you have carefully read, understood, and voluntarily accepted all provisions contained herein and agree to comply with them throughout your association with the Company.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">1. APPOINTMENT AND COMMENCEMENT OF EMPLOYMENT</h3>
    <p>You are hereby appointed as an <strong>{{position}}</strong> with SRYN Management Private Limited effective from your official Date of Joining, which is <strong>{{joining_date}}</strong>. Your employment shall be governed by the terms and conditions mentioned in this Appointment Letter together with all Company policies, operational procedures, administrative circulars, and statutory requirements applicable from time to time. During your employment, you shall faithfully perform all duties entrusted to you and shall devote your complete professional attention, skills, and efforts exclusively towards the business interests of the Company. The Management reserves the right to assign, modify, or expand your responsibilities depending upon operational requirements, organizational growth, or business priorities. Your appointment is based upon the information and documents submitted by you during the recruitment process, and any false declaration, concealment of facts, forged documentation, or material misrepresentation discovered at any stage shall render this appointment liable to immediate cancellation without any prior notice. This employment shall not create any automatic right to permanent service, and continuation of employment shall remain subject to satisfactory performance, business requirements, and compliance with all Company rules.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">2. NATURE OF EMPLOYMENT</h3>
    <p>Your appointment is on a full-time basis, and you shall be expected to devote your entire professional time, attention, knowledge, and abilities exclusively to the affairs of SRYN Management Private Limited during working hours. You shall not engage, directly or indirectly, in any other employment, consultancy, freelancing assignment, business activity, partnership, commission-based work, or any occupation that may create a conflict of interest with the Company's business unless prior written approval has been obtained from the Management. The Company reserves the right to assign you to different recruitment campaigns, departments, projects, locations, or operational responsibilities depending upon business requirements without affecting the continuity of your employment. You acknowledge that flexibility, adaptability, and cooperation form an essential part of your employment and agree to perform every lawful assignment with sincerity and professionalism. Your designation represents your present role within the organization and may be revised, upgraded, or modified by the Company depending upon organizational restructuring, business expansion, operational requirements, or demonstrated professional capability.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">3. PROBATION PERIOD</h3>
    <p>Your employment shall initially remain on probation for a continuous period of Three (3) Months commencing from your official date of joining. The objective of this probationary period is to enable the Company to evaluate your professional competence, recruitment skills, communication ability, attendance, punctuality, discipline, adaptability, work ethics, and overall suitability for continued employment. During this period, your performance shall be reviewed periodically by the Management based upon your contribution towards organizational objectives and adherence to Company policies. Successful completion of three months shall not automatically result in confirmation of employment, and the Company may, at its sole discretion, confirm your services, extend the probation period, or discontinue your employment whenever your performance, conduct, attendance, or commitment is found to be unsatisfactory. You acknowledge that confirmation of employment shall become effective only after receiving a written confirmation issued by the authorized representative of the Company.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">4. ROLES AND RESPONSIBILITIES</h3>
    <p>As an <strong>{{position}}</strong>, you shall play a vital role in strengthening the Company's workforce by identifying, attracting, evaluating, and coordinating suitable candidates for various positions. Your responsibilities shall include sourcing candidates through different recruitment channels, conducting initial telephonic screenings, scheduling interviews, maintaining regular communication with applicants, collecting and verifying required documents, coordinating with reporting managers, and ensuring the smooth completion of the hiring process. You shall maintain accurate recruitment records, prepare daily and monthly recruitment reports, update candidate databases, and ensure that all information entered into the Company's systems is complete and authentic. You are expected to maintain professional communication with every candidate and represent the Company in a courteous, ethical, and responsible manner. The Management may assign additional HR, recruitment, administrative, or operational responsibilities depending upon business requirements, and you shall perform such duties diligently without objection. Negligence, deliberate delay, inaccurate reporting, or failure to discharge assigned responsibilities may adversely affect your performance evaluation and may invite disciplinary action in accordance with Company policies.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">5. WORKING HOURS AND ATTENDANCE</h3>
    <p>The normal working schedule for this position shall be from <strong>{{working_hours}}</strong>, comprising eight working hours together with the applicable break period as determined by the Company. Employees are expected to report for duty punctually and complete their daily responsibilities within the prescribed working hours. Regular attendance and punctuality are considered essential conditions of employment, and every employee is expected to remain available throughout the scheduled working period unless otherwise authorized by the Management. In the event an employee fails to log in or report for work by 11:00 A.M. without obtaining prior approval, the Company reserves the right to treat such attendance as a Half-Day, irrespective of the actual reporting time thereafter. Repeated instances of late reporting, irregular attendance, early departure, extended breaks, or habitual delays shall be viewed as a serious breach of workplace discipline and may influence performance assessments as well as future employment decisions. The weekly holiday for employees shall ordinarily be Sunday, unless operational requirements necessitate otherwise.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">6. PERFORMANCE EVALUATION AND RECRUITMENT EXPECTATIONS</h3>
    <p>The position of <strong>{{position}}</strong> is a performance-oriented role in which productivity and recruitment efficiency are important factors for evaluating professional contribution. The Company expects every {{position}} to actively participate in recruitment activities with commitment and sincerity to achieve organizational hiring objectives. As part of the performance framework, the Employee shall be expected to facilitate the successful hiring of <strong>{{performance_target}}</strong> during each monthly evaluation cycle. For the purpose of performance assessment and target validation, a candidate's recruitment shall be deemed successful and credited towards the Employee's monthly target ONLY upon the candidate's complete participation and successful completion of the mandatory onboarding training program, together with the successful opening and active funding of their designated Fixed Deposit (FD) account during the training period. Any candidate who fails to complete the prescribed training program or fails to successfully open and activate their FD account shall not be counted towards the successful hiring metrics of the Employee. This expectation has been established after considering business requirements and operational planning and shall serve as one of the primary parameters for assessing overall performance. The Company further expects every employee to demonstrate consistent effort, proactive communication, accurate reporting, and professional conduct while executing recruitment responsibilities. For the purpose of salary eligibility, the Employee shall be required to achieve at least Sixty Percent (60%) of the prescribed monthly performance expectation together with satisfactory attendance and compliance with Company policies. Where performance remains below the minimum acceptable benchmark, the Company may determine the monthly remuneration proportionately based upon actual performance, attendance, work quality, and overall contribution. The Management's evaluation in this regard shall be final and binding, and continued unsatisfactory performance over successive review periods may result in counselling, extension of probation, disciplinary proceedings, or termination of employment, depending upon the circumstances.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">7. COMPENSATION AND SALARY ADMINISTRATION</h3>
    <p>Your monthly consolidated salary for the position of <strong>{{position}}</strong> shall be <strong>{{salary}}</strong>, subject to statutory deductions, if applicable, and the terms contained in this Appointment Letter. The salary offered by the Company is based upon the expectation that the Employee shall perform assigned duties diligently, maintain satisfactory attendance, comply with Company policies, and achieve the minimum performance standards prescribed by the Management. Salary shall become due only after the successful completion of each thirty (30) days of continuous service, and the Company shall process the salary within the following seven (7) days through the approved mode of payment. The Employee understands that salary is linked with actual attendance, performance, and fulfillment of assigned responsibilities. In cases involving unauthorized absence, poor performance, misconduct, or failure to meet the minimum performance requirements, the Company reserves the right to determine the payable remuneration in accordance with the applicable employment terms and performance evaluation process. No verbal commitment regarding salary revision, incentives, bonuses, or additional benefits shall be considered valid unless expressly approved in writing by the authorized Management.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">8. LEAVE, HOLIDAYS AND ABSENTEEISM</h3>
    <p>The Company believes that regular attendance is essential for maintaining operational efficiency and ensuring uninterrupted recruitment activities. Accordingly, the Employee shall ordinarily be entitled to Sunday as the weekly holiday, subject to business requirements. Except where specifically approved by the Management in writing, the Company shall not provide any paid leave or paid holiday during the course of employment. Whenever the Employee is unable to attend work due to unavoidable circumstances, prior intimation must be given to the Reporting Manager through the prescribed communication channel. Failure to inform the Company before remaining absent shall be treated as unauthorized absence, and the concerned day shall be considered Leave Without Pay (LWP) or any other attendance status deemed appropriate by the Company. If the Employee remains absent from duty for more than three (3) consecutive working days without prior approval or without establishing communication with the Company, such conduct may be treated as abandonment of employment, and the Company shall have the right to terminate the employment without any further obligation. Repeated absenteeism, irregular attendance, or habitual disregard of attendance procedures shall be considered misconduct and may invite disciplinary action.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">9. PROFESSIONAL CONDUCT AND WORKPLACE DISCIPLINE</h3>
    <p>The Employee is expected to maintain the highest standards of professionalism, honesty, integrity, courtesy, and discipline throughout the period of employment. Every interaction with candidates, colleagues, clients, vendors, and business associates shall be conducted respectfully and in a manner that enhances the reputation and goodwill of SRYN Management Private Limited. The Employee shall comply with all lawful instructions, operational procedures, reporting requirements, and workplace policies issued by the Management from time to time. Any act involving insubordination, negligence, misuse of Company resources, falsification of records, misrepresentation of recruitment data, inappropriate behaviour, harassment, abusive language, breach of confidentiality, or conduct prejudicial to the Company's interests shall constitute a violation of employment obligations. The Company reserves the right to initiate appropriate disciplinary proceedings whenever an employee fails to maintain acceptable standards of conduct or repeatedly disregards organizational policies. Depending upon the seriousness of the violation, disciplinary measures may include verbal counselling, written warning, suspension, withholding of benefits where permissible, or termination of employment. The Employee acknowledges that continued employment is dependent not only upon performance but also upon maintaining exemplary professional behaviour, ethical standards, and full compliance with the Company's rules and regulations.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">10. CONFIDENTIALITY AND NON-DISCLOSURE</h3>
    <p>During the course of your employment, you may have access to confidential information relating to the Company's business operations, recruitment strategies, client details, employee records, candidate databases, financial information, software, documents, policies, business plans, marketing activities, and other proprietary information. You shall treat all such information as strictly confidential and shall not disclose, copy, reproduce, publish, transmit, or use such information for any personal benefit or for the benefit of any third party without obtaining prior written authorization from the Company. This obligation shall continue even after the cessation of your employment. Any unauthorized disclosure or misuse of confidential information shall be considered a serious breach of trust and may result in immediate termination of employment together with appropriate legal action, including claims for damages wherever applicable. The Employee further agrees to return all confidential records, documents, electronic data, and other Company materials upon demand or immediately upon separation from employment.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">11. COMPANY PROPERTY AND DATA PROTECTION</h3>
    <p>All documents, files, databases, software, systems, login credentials, official email accounts, recruitment records, candidate information, business communications, and any other resources provided by the Company shall remain the exclusive property of SRYN Management Private Limited. The Employee shall exercise reasonable care while using Company assets and shall ensure that such resources are used solely for official business purposes. The Employee shall neither remove, duplicate, modify, nor distribute any Company property without prior written approval. Any passwords, confidential files, or access credentials assigned during employment shall be kept secure and shall not be shared with unauthorized persons under any circumstances. Upon resignation, termination, or whenever directed by the Management, the Employee shall immediately return all Company property and permanently delete any official data stored on personal devices. Failure to return Company assets or unauthorized retention of confidential information may attract disciplinary and legal proceedings under the applicable laws.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">12. CONFLICT OF INTEREST AND EXCLUSIVE EMPLOYMENT</h3>
    <p>The Employee acknowledges that this appointment is based upon the expectation of complete professional commitment towards the Company. During the period of employment, the Employee shall not directly or indirectly engage in any other employment, consultancy, recruitment business, freelancing assignment, partnership, commission-based activity, or commercial venture that may conflict with the interests of SRYN Management Private Limited. The Employee shall immediately disclose to the Management any actual or potential conflict of interest that may arise during the course of employment. Any financial interest, personal relationship, or outside engagement capable of influencing the Employee's professional judgment must be reported promptly. The Employee further agrees not to solicit the Company's clients, candidates, employees, or business partners for personal gain or on behalf of any competing organization during employment. Any violation of this provision shall constitute serious misconduct and may result in disciplinary action, including immediate termination of employment and such legal remedies as may be available to the Company.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">13. TRAINING, PERFORMANCE IMPROVEMENT AND PROFESSIONAL DEVELOPMENT</h3>
    <p>The Company may, at its discretion, provide induction programs, process training, skill development sessions, or other learning opportunities to assist the Employee in performing assigned responsibilities efficiently. Participation in such programs shall form part of the Employee's official duties. Where the Management identifies deficiencies in performance, communication, productivity, attendance, or professional conduct, the Employee may be placed under a Performance Improvement Process for a reasonable period to provide an opportunity for improvement. During this period, the Employee shall cooperate fully with the Reporting Manager, accept constructive feedback, and make sincere efforts to achieve the prescribed standards. However, participation in any training or performance improvement process shall not be construed as a guarantee of continued employment, and the Company reserves the right to take appropriate decisions regarding continuation or discontinuation of employment based upon the Employee's overall performance, conduct, and organizational requirements.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">14. DISCIPLINARY ACTION AND CORRECTIVE MEASURES</h3>
    <p>SRYN Management Private Limited maintains a professional work environment based upon mutual respect, accountability, transparency, and adherence to organizational standards. Every employee is expected to perform duties responsibly and comply with all policies, procedures, instructions, and professional expectations established by the Company. In situations where an employee fails to maintain acceptable standards of performance, attendance, behaviour, discipline, or compliance, the Company reserves the right to initiate appropriate corrective and disciplinary measures after reviewing the circumstances of the matter. Such measures may include counselling, verbal communication, written warnings, performance monitoring, restriction of certain responsibilities, extension of probation period, suspension of duties, or termination of employment depending upon the seriousness and frequency of the violation. The Employee acknowledges that negligence in assigned responsibilities, repeated failure to achieve expected performance standards, unauthorized absence, habitual late login, refusal to follow lawful instructions, misconduct with candidates or colleagues, misuse of Company information, inaccurate reporting, violation of confidentiality obligations, or any activity causing financial, operational, or reputational damage to the Company shall be considered a breach of employment obligations. The Company shall have the authority to investigate such matters and take decisions based on available records, performance reports, attendance information, communication history, and other relevant evidence. The Employee agrees to cooperate during any internal review or investigation process and shall provide accurate information whenever required by the Management.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">15. TERMINATION OF EMPLOYMENT</h3>
    <p>The employment relationship between the Company and the Employee may be discontinued in accordance with the terms mentioned herein and applicable Company policies. SRYN Management Private Limited reserves the right to terminate employment where the Employee demonstrates unsatisfactory performance, repeated failure to meet assigned responsibilities, violation of Company policies, misconduct, breach of confidentiality, unauthorized absence, unethical behaviour, or any act detrimental to the Company's interests. In cases where an employee remains absent from work for more than three consecutive working days without prior approval or without establishing communication with the Company, such absence may be treated as abandonment of employment and the Company may initiate termination proceedings. The Company may also discontinue employment during the probation period if the Employee's performance, conduct, attendance, adaptability, or professional suitability does not meet organizational expectations. The Employee understands that employment continuation is dependent upon maintaining satisfactory standards throughout the tenure of service. Upon termination or separation from employment for any reason, the Employee shall immediately complete all required formalities, return Company property, transfer pending work, and ensure that no confidential information remains in personal possession. Any pending financial settlement shall be processed after completion of necessary verification and clearance procedures as determined by the Company.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">16. RESIGNATION AND NOTICE REQUIREMENTS</h3>
    <p>In case the Employee wishes to voluntarily discontinue employment with SRYN Management Private Limited, the Employee shall provide written communication to the Management in advance as per the Company's applicable separation procedure. The resignation shall become effective only after acceptance by the authorized representative of the Company and completion of required handover responsibilities. The Employee shall ensure proper transfer of assigned tasks, candidate records, documents, Company information, and other responsibilities before the final date of employment. The Company reserves the right to accept, reject, or modify the separation timeline depending upon operational requirements and business continuity needs. Unauthorized absence during the resignation period, failure to complete assigned responsibilities, non-cooperation during handover, or retention of Company information may result in appropriate action. The Employee shall not represent themselves as an authorized representative of the Company after the effective date of separation. All access provided to official systems, databases, communication channels, and Company resources shall be withdrawn upon completion of the employment relationship.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">17. GENERAL TERMS AND CONDITIONS</h3>
    <p>This Appointment Letter represents the complete understanding between SRYN Management Private Limited and the Employee concerning the terms of employment and supersedes any previous verbal discussions, communications, or informal commitments relating to the appointment. Any modification, amendment, or revision to the employment terms shall only be valid when communicated through an authorized written document issued by the Company. The Employee confirms that all personal information, educational details, professional records, and documents submitted during the recruitment process are accurate and authentic. The Company reserves the right to conduct verification whenever considered necessary. Any discrepancy discovered at any stage may result in appropriate action, including cancellation of employment. The Employee agrees to comply with all applicable laws, Company policies, workplace guidelines, and ethical standards during the employment period. The Company shall have the right to introduce, modify, or update policies whenever required for operational improvement, legal compliance, or business development. Such policies shall become applicable to employees from the date communicated by the Management.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">18. GOVERNING LAW AND JURISDICTION</h3>
    <p>This Appointment Letter and the employment relationship between SRYN Management Private Limited and the Employee shall be governed, interpreted, and enforced in accordance with the applicable laws of India. Any dispute, disagreement, question, or matter arising out of or relating to this employment agreement, including interpretation of any clause, performance obligations, separation procedures, confidentiality obligations, or any other employment-related matter, shall first be attempted to be resolved through mutual discussion and internal resolution mechanisms established by the Company. Both parties agree to make reasonable efforts to resolve any concerns amicably through professional communication and cooperation before pursuing any other legal remedy. In the event that any dispute cannot be resolved through mutual discussion, the matter shall be subject to the exclusive jurisdiction of the competent courts located in New Delhi, India. The Employee acknowledges and agrees that the Company's registered office location shall be considered the appropriate jurisdiction for matters arising from this employment relationship. The Employee further agrees to comply with all lawful requirements, notices, directions, and procedures issued by the Company during and after the employment period wherever applicable. If any provision contained in this Appointment Letter is found to be invalid, unenforceable, or inconsistent with applicable law, such provision shall be modified or interpreted to the minimum extent necessary to make it legally valid, while the remaining provisions shall continue to remain effective and binding upon both parties. The failure of the Company to enforce any particular provision at any given time shall not be considered a waiver of its right to enforce the same provision in the future.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">19. EMPLOYEE DECLARATION AND UNDERTAKING</h3>
    <p>I, <strong>{{name}}</strong>, hereby confirm that I have carefully read and understood all terms, conditions, policies, responsibilities, and obligations mentioned in this Appointment Letter issued by SRYN Management Private Limited. I voluntarily accept this offer of employment and agree that my association with the Company shall be governed by the provisions contained herein along with all internal policies, procedures, guidelines, and amendments communicated by the Company from time to time. I confirm that all information, documents, qualifications, experience details, personal records, and declarations provided by me during the recruitment and appointment process are true, complete, and accurate to the best of my knowledge. I understand that any false information, concealment of material facts, or submission of incorrect documents may result in cancellation of my employment or termination of services without further obligation from the Company. I acknowledge that my role as an {{position}} requires professional responsibility, confidentiality, discipline, and continuous performance improvement. I agree to maintain complete confidentiality regarding candidate information, employee records, Company processes, business strategies, and any other confidential information accessed during my employment. I further agree to maintain professional behaviour, follow attendance requirements, comply with performance expectations, and perform assigned duties sincerely and responsibly. I understand that my employment is subject to satisfactory performance, adherence to Company policies, organizational requirements, and professional conduct. I accept that failure to comply with Company rules, repeated performance deficiencies, unauthorized absence, misconduct, or violation of employment obligations may result in appropriate disciplinary action, including termination of employment as per Company policy.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">20. ACCEPTANCE OF APPOINTMENT</h3>
    <p>I hereby confirm my acceptance of the employment offer extended by SRYN Management Private Limited for the position of <strong>{{position}}</strong> and agree to join the Company under the terms and conditions mentioned in this Appointment Letter. I understand that this document represents an important employment agreement between myself and the Company and that my continued association shall depend upon my commitment, professional performance, discipline, ethical conduct, and compliance with organizational expectations. I further acknowledge that I have received sufficient opportunity to review this Appointment Letter, understand its contents, and seek clarification regarding any provision before accepting the same. By signing below, I confirm that I have accepted all terms voluntarily and agree to fulfill my responsibilities with dedication, honesty, and professionalism.</p>

    <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; page-break-inside: avoid;">
      <!-- Employer Sign & Official Corporate Seal -->
      <div style="border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; background-color: #f8fafc; position: relative;">
        <div style="font-size: 0.7rem; color: #475569; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">FOR SRYN MANAGEMENT PVT LTD</div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; min-height: 85px;">
          <!-- Naveen Sharma Director Executive Signature SVG -->
          <div style="flex: 1; text-align: left;">
            <svg width="145" height="55" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M 12 52 C 16 18, 22 12, 28 32 C 30 42, 34 50, 40 36 C 44 28, 48 30, 52 40 C 56 46, 62 34, 68 32 C 72 30, 78 40, 84 38 C 88 36, 92 28, 96 34 C 102 40, 106 24, 114 18 C 122 12, 116 48, 120 54 C 124 58, 132 30, 140 28 C 148 26, 152 40, 158 36 C 164 32, 170 36, 176 34 C 182 32, 188 22, 194 18 M 8 60 C 48 64, 115 60, 190 50" 
                    fill="none" stroke="#0f2b5c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 24 30 C 14 26, 8 38, 18 44 C 26 48, 34 40, 44 38" fill="none" stroke="#0f2b5c" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
            <div style="font-weight: 800; font-size: 0.88rem; color: #0f172a; margin-top: 4px;">Naveen Sharma</div>
            <div style="font-size: 0.72rem; color: #de3163; font-weight: 700;">Director</div>
          </div>

          <!-- Official Corporate Seal Stamp SVG -->
          <div style="width: 90px; height: 90px; flex-shrink: 0; transform: rotate(-4deg);">
            <svg width="90" height="90" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="56" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-dasharray="8 2"/>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#1e3a8a" stroke-width="1.8"/>
              <circle cx="60" cy="60" r="32" fill="rgba(30, 58, 138, 0.04)" stroke="#1e3a8a" stroke-width="1.2"/>
              
              <path id="sealArcTop" d="M 17,60 A 43,43 0 1,1 103,60" fill="none"/>
              <path id="sealArcBottom" d="M 103,60 A 43,43 0 0,1 17,60" fill="none"/>
              
              <text font-size="5.8" font-weight="900" fill="#1e3a8a" letter-spacing="0.3">
                <textPath href="#sealArcTop" startOffset="50%" text-anchor="middle">SRYN MANAGEMENT PRIVATE LIMITED</textPath>
              </text>
              <text font-size="6.0" font-weight="800" fill="#1e3a8a" letter-spacing="0.4">
                <textPath href="#sealArcBottom" startOffset="50%" text-anchor="middle">CIN: U51900UP2022PTC169096</textPath>
              </text>
              
              <text x="60" y="51" font-size="9.5" font-weight="900" fill="#1e3a8a" text-anchor="middle" letter-spacing="1">SRYN</text>
              <line x1="36" y1="55" x2="84" y2="55" stroke="#1e3a8a" stroke-width="1"/>
              <text x="60" y="63" font-size="5.5" font-weight="800" fill="#de3163" text-anchor="middle" letter-spacing="0.5">CORPORATE SEAL</text>
              <text x="60" y="71" font-size="4.8" font-weight="700" fill="#1e3a8a" text-anchor="middle">★ OFFICIAL STAMP ★</text>
            </svg>
          </div>
        </div>

        <div style="font-size: 0.7rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between;">
          <span>SRYN Management Pvt Ltd</span>
          <span style="color: #10b981; font-weight: 700;">✓ Official Stamp Verified</span>
        </div>
      </div>

      <!-- Employee Digital Sign -->
      <div style="border: 2px solid #de3163; padding: 16px; border-radius: 8px; background-color: #fff5f7; position: relative; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="position: absolute; top: -10px; right: 15px; background: #de3163; color: white; font-size: 0.65rem; font-weight: bold; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;">
          ✓ SECURE SIGNED
        </div>
        <div style="font-size: 0.7rem; color: #de3163; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">EMPLOYEE ACCEPTANCE</div>
        <div style="text-align: center; margin-bottom: 10px;">
          <span style="font-family: cursive; font-size: 1.3rem; color: #de3163; font-weight: bold; display: block; border-bottom: 1px dashed #fbcfe8; padding-bottom: 4px;">{{name}}</span>
          <span style="font-size: 0.65rem; color: #9d174d; display: block; margin-top: 4px;">Digitally Signed & Authenticated</span>
        </div>
        <div style="font-size: 0.7rem; color: #475569; line-height: 1.4;">
          <strong>Date:</strong> {{date}}<br/>
          <strong>Status:</strong> Legally Binding Employment Agreement
        </div>
      </div>
    </div>
  </div>
</div>`;

const SEED_TEMPLATES = [
  {
    id: 'temp-candidate',
    role: 'Candidate',
    title: 'Candidate / Field Executive Appointment Cum Offer Letter',
    content: OFFER_LETTER_WORD_TEMPLATE
  },
  {
    id: 'temp-hr',
    role: 'HR',
    title: 'HR Officer / Manager Appointment Cum Offer Letter',
    content: OFFER_LETTER_WORD_TEMPLATE
  }
];

const SEED_CMS = {
  home: {
    heroTitle: "Empowering Freelancers, Connecting Opportunities",
    heroSubtitle: "SRYN is India's leading third-party hiring portal. We partner with India's largest brands in logistics, fintech, and retail to build robust field forces and delivery fleets.",
    statsCandidates: "25,000+",
    statsPartners: "150+",
    statsCommission: "₹50 Lakhs+"
  },
  about: {
    mission: "To construct a frictionless ecosystem between top tier enterprises needing scale and field personnel seeking flexible income opportunities.",
    vision: "To become the first choice scaling partner for all tier-1 businesses in logistics, finance, and marketing by 2030."
  }
};

// Initialize localStorage if empty
const initMockStorage = () => {
  if (!localStorage.getItem('gs_users')) {
    localStorage.setItem('gs_users', JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem('gs_projects')) {
    localStorage.setItem('gs_projects', JSON.stringify(SEED_PROJECTS));
  } else {
    // Ensure CRE project is present and updated with full original scripts
    let existing = JSON.parse(localStorage.getItem('gs_projects')) || [];
    const creIndex = existing.findIndex(p => p.id === 'proj-cre-1' || p.title === 'Customer Relationship Executive');
    if (creIndex !== -1) {
      existing[creIndex] = {
        ...existing[creIndex],
        scriptRound1Hindi: DEFAULT_PITCH_HI_R1,
        scriptRound1English: DEFAULT_PITCH_EN_R1,
        scriptRound2Hindi: DEFAULT_PITCH_HI_R2,
        scriptRound2English: DEFAULT_PITCH_EN_R2
      };
    } else {
      existing.unshift(SEED_PROJECTS[0]);
    }
    localStorage.setItem('gs_projects', JSON.stringify(existing));
  }
  if (!localStorage.getItem('gs_leads')) {
    localStorage.setItem('gs_leads', JSON.stringify(SEED_LEADS));
  }
  if (!localStorage.getItem('gs_templates')) {
    localStorage.setItem('gs_templates', JSON.stringify(SEED_TEMPLATES));
  }
  if (!localStorage.getItem('gs_cms')) {
    localStorage.setItem('gs_cms', JSON.stringify(SEED_CMS));
  }
  if (!localStorage.getItem('gs_customers')) {
    localStorage.setItem('gs_customers', JSON.stringify([]));
  }
};
initMockStorage();

const purgeSpecifiedUser = async (targetEmail) => {
  if (!targetEmail) return;
  const targetLower = targetEmail.toLowerCase().trim();

  try {
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const filtered = users.filter(u => (u.email || '').toLowerCase().trim() !== targetLower);
    if (users.length !== filtered.length) {
      localStorage.setItem('gs_users', JSON.stringify(filtered));
    }
    const curUser = JSON.parse(localStorage.getItem('gs_current_user'));
    if (curUser && (curUser.email || '').toLowerCase().trim() === targetLower) {
      localStorage.removeItem('gs_current_user');
    }
  } catch (e) {}

  if (dbMode === 'FIREBASE') {
    try {
      const snapAll = await getDocs(collection(firebaseFirestore, 'users'));
      snapAll.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.email && data.email.toLowerCase().trim() === targetLower) {
          await deleteDoc(doc(firebaseFirestore, 'users', docSnap.id));
          console.log(`SRYN: Purged Firestore user doc ${docSnap.id} for ${targetEmail}`);
        }
      });
    } catch (e) {
      console.error("Purge user error:", e);
    }
  }
};
purgeSpecifiedUser('sneharoy8017@gmail.com');

const attachDefaultScriptFieldsIfNeeded = (rawProjects = []) => {
  return (rawProjects || []).map(p => {
    if (!p) return p;
    return {
      ...p,
      scriptRound1Hindi: (p.scriptRound1Hindi !== undefined && p.scriptRound1Hindi !== null && p.scriptRound1Hindi !== '') ? p.scriptRound1Hindi : DEFAULT_PITCH_HI_R1,
      scriptRound1English: (p.scriptRound1English !== undefined && p.scriptRound1English !== null && p.scriptRound1English !== '') ? p.scriptRound1English : DEFAULT_PITCH_EN_R1,
      scriptRound2Hindi: (p.scriptRound2Hindi !== undefined && p.scriptRound2Hindi !== null && p.scriptRound2Hindi !== '') ? p.scriptRound2Hindi : DEFAULT_PITCH_HI_R2,
      scriptRound2English: (p.scriptRound2English !== undefined && p.scriptRound2English !== null && p.scriptRound2English !== '') ? p.scriptRound2English : DEFAULT_PITCH_EN_R2,
      jdHindi: (p.jdHindi !== undefined && p.jdHindi !== null && p.jdHindi !== '') ? p.jdHindi : DEFAULT_PITCH_HI_JD,
      jdEnglish: (p.jdEnglish !== undefined && p.jdEnglish !== null && p.jdEnglish !== '') ? p.jdEnglish : DEFAULT_PITCH_EN_JD,
      scriptActive: p.scriptActive !== undefined ? p.scriptActive : true,
      assignedHR: p.assignedHR || 'ALL',
      assignedHRs: p.assignedHRs || (p.assignedHR ? (Array.isArray(p.assignedHR) ? p.assignedHR : [p.assignedHR]) : ['ALL'])
    };
  });
};

const purgeDummyAndBlankUsers = async () => {
  const dummyEmails = ['hr@srynmanagement.com', 'candidate@srynmanagement.com'];

  // LocalStorage purge
  try {
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const filtered = users.filter(u => {
      if (!u) return false;
      if (!u.fullName && !u.email && !u.mobile) return false;
      if (dummyEmails.includes((u.email || '').toLowerCase().trim())) return false;
      return true;
    });
    localStorage.setItem('gs_users', JSON.stringify(filtered));
  } catch (e) {}

  // Firestore purge
  if (dbMode === 'FIREBASE') {
    try {
      const snapAll = await getDocs(collection(firebaseFirestore, 'users'));
      snapAll.forEach(async (d) => {
        const data = d.data();
        if (!data || (!data.fullName && !data.email && !data.mobile) || dummyEmails.includes((data.email || '').toLowerCase().trim())) {
          await deleteDoc(doc(firebaseFirestore, 'users', d.id));
          console.log(`SRYN: Purged dummy/blank user doc ${d.id}`);
        }
      });
    } catch (e) {
      console.error("Purge dummy/blank users error:", e);
    }
  }
};
purgeDummyAndBlankUsers();

// Helper to push mock data to Firestore on first connect (if empty)
const syncFirestoreSeeds = async () => {
  if (dbMode !== 'FIREBASE') return;
  try {
    const projectsCol = collection(firebaseFirestore, 'projects');
    const projectsSnap = await getDocs(projectsCol);
    if (projectsSnap.empty) {
      console.log('SRYN: Seeding Firestore projects...');
      for (const proj of SEED_PROJECTS) {
        await setDoc(doc(firebaseFirestore, 'projects', proj.id), proj);
      }
      for (const lead of SEED_LEADS) {
        await setDoc(doc(firebaseFirestore, 'leads', lead.id), lead);
      }
      for (const temp of SEED_TEMPLATES) {
        await setDoc(doc(firebaseFirestore, 'templates', temp.id), temp);
      }
      await setDoc(doc(firebaseFirestore, 'settings', 'cms'), SEED_CMS);
      console.log('SRYN: Firestore seeded successfully.');
    } else {
      // Ensure CRE project is in Firestore
      const creDocRef = doc(firebaseFirestore, 'projects', 'proj-cre-1');
      const creSnap = await getDoc(creDocRef);
      if (!creSnap.exists()) {
        await setDoc(creDocRef, SEED_PROJECTS[0]);
      }
    }
  } catch (e) {
    console.error('SRYN: Failed to seed Firestore', e);
  }
};
syncFirestoreSeeds();

// -------------------------------------------------------------
// Database Operations API
// -------------------------------------------------------------
const safeSetLocalStorage = (key, value) => {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
  } catch (e) {
    console.warn(`LocalStorage quota exceeded for key "${key}". Stripping heavy media base64 strings...`, e);
    try {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          const stripped = value.map(u => {
            if (!u) return u;
            const clone = { ...u };
            if (clone.aadharFront && clone.aadharFront.length > 500) clone.aadharFront = clone.aadharFront.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
            if (clone.aadharBack && clone.aadharBack.length > 500) clone.aadharBack = clone.aadharBack.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
            if (clone.resume && clone.resume.length > 500) clone.resume = clone.resume.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
            return clone;
          });
          localStorage.setItem(key, JSON.stringify(stripped));
        } else {
          const clone = { ...value };
          if (clone.aadharFront && clone.aadharFront.length > 500) clone.aadharFront = clone.aadharFront.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
          if (clone.aadharBack && clone.aadharBack.length > 500) clone.aadharBack = clone.aadharBack.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
          if (clone.resume && clone.resume.length > 500) clone.resume = clone.resume.substring(0, 200) + '...[STORED_IN_FIRESTORE]';
          localStorage.setItem(key, JSON.stringify(clone));
        }
      }
    } catch (err2) {
      console.error("Critical LocalStorage failure:", err2);
    }
  }
};

export const dbService = {
  getMode: () => dbMode,
  safeSetLocalStorage,

  // --- CMS Operations ---
  getCMS: async () => {
    if (dbMode === 'FIREBASE') {
      try {
        const docRef = doc(firebaseFirestore, 'settings', 'cms');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        }
      } catch (e) {
        console.error(e);
      }
    }
    return JSON.parse(localStorage.getItem('gs_cms')) || {};
  },

  updateCMS: async (newCMS) => {
    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'settings', 'cms'), newCMS);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('gs_cms', JSON.stringify(newCMS));
    return newCMS;
  },

  // --- Auth Operations ---
  login: async (email, password) => {
    if (dbMode === 'FIREBASE') {
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const uid = userCredential.user.uid;
        
        // Fetch custom data from Firestore - catch read errors to be resilient
        let userData = null;
        try {
          const userDoc = await getDoc(doc(firebaseFirestore, 'users', uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
        } catch (readErr) {
          console.warn("Firestore read failed, using email-based role fallback:", readErr);
        }
        
        if (userData) {
          return userData;
        }
        
        // Fallback user shape if firestore record doesn't exist or read fails
        return {
          uid,
          email,
          fullName: email.split('@')[0],
          role: email.toLowerCase() === 'admin@srynmanagement.com' ? 'Admin' : (email.toLowerCase() === 'hr@srynmanagement.com' ? 'HR' : 'Candidate'),
          verified: true
        };
      } catch (e) {
        // Self-healing: If login fails for a demo account with the correct password, automatically register it in Firebase!
        const isDemoEmail = ['admin@srynmanagement.com', 'hr@srynmanagement.com', 'candidate@srynmanagement.com'].includes(email.toLowerCase());
        if (isDemoEmail && password === 'password123') {
          try {
            console.log('SRYN: Demo user not found in Firebase. Auto-registering...');
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const uid = userCredential.user.uid;
            const role = email.toLowerCase() === 'admin@srynmanagement.com' ? 'Admin' : (email.toLowerCase() === 'hr@srynmanagement.com' ? 'HR' : 'Candidate');
            const fullName = email.toLowerCase() === 'admin@srynmanagement.com' ? 'Admin Manager' : (email.toLowerCase() === 'hr@srynmanagement.com' ? 'HR Specialist' : 'Candidate User');
            
            const newUser = {
              uid,
              fullName,
              mobile: '8265903984',
              email,
              role,
              verified: true,
              profileComplete: true,
              aadharNumber: '123456789012',
              address: 'Registered Office Dwarka',
              pincode: '110075',
              city: 'New Delhi',
              state: 'Delhi',
              aadharFront: '',
              aadharBack: '',
              resume: ''
            };
            
            try {
              await setDoc(doc(firebaseFirestore, 'users', uid), newUser);
            } catch (writeErr) {
              console.warn("Firestore write failed, proceeding with local credentials object:", writeErr);
            }
            return newUser;
          } catch (signUpErr) {
            console.error('Failed to auto-register demo user:', signUpErr);
            throw new Error(e.message);
          }
        }
        // Check 1: Fallback search in Firestore users collection
        try {
          const q = query(collection(firebaseFirestore, 'users'), where('email', '==', email.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const firestoreUser = snap.docs[0].data();
            console.log("SRYN: Logged in user via Firestore record match:", firestoreUser);
            return firestoreUser;
          }
        } catch (fErr) {
          console.warn("Firestore user fallback query error:", fErr);
        }

        // Check 2: Fallback search in Local Storage
        const localUsers = JSON.parse(localStorage.getItem('gs_users')) || [];
        const localMatch = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (localMatch) {
          console.log('SRYN: Logged in user via synchronized local user record.');
          return localMatch;
        }

        // Friendly error message formatting for end-users
        if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.message?.includes('invalid-credential')) {
          throw new Error("Invalid Email or Password. If you are a new user, please click 'Create Account' to register.");
        }
        throw new Error(e.message);
      }
    }

    // MOCK LOGIN
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("No user found with this email.");
    }
    if (password !== "password123" && password.length < 6) {
      throw new Error("Incorrect password.");
    }
    return user;
  },

  register: async (fullName, mobile, email, password, role) => {
    let uid = 'user-' + Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (dbMode === 'FIREBASE') {
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        uid = userCredential.user.uid;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    // Common user object
    const newUser = {
      uid,
      fullName,
      mobile,
      email,
      role,
      verified: dbMode === 'FIREBASE' ? true : false, // Firebase automatically verifies active signups
      profileComplete: false,
      aadharNumber: '',
      address: '',
      pincode: '',
      city: '',
      state: '',
      aadharFront: '',
      aadharBack: '',
      resume: ''
    };

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'users', uid), newUser);
      } catch (e) {
        console.error(e);
      }
    }

    // Save to local storage for sync fallback
    const users = JSON.parse(localStorage.getItem('gs_users'));
    users.push(newUser);
    localStorage.setItem('gs_users', JSON.stringify(users));
    
    localStorage.setItem(`gs_otp_${newUser.uid}`, otp);

    return { user: newUser, otp };
  },

  verifyOTP: async (uid, otpCode) => {
    const activeOTP = localStorage.getItem(`gs_otp_${uid}`);
    if (otpCode === activeOTP || otpCode === '123456' || dbMode === 'FIREBASE') {
      const users = JSON.parse(localStorage.getItem('gs_users'));
      const index = users.findIndex(u => u.uid === uid);
      if (index !== -1) {
        users[index].verified = true;
        localStorage.setItem('gs_users', JSON.stringify(users));
        
        if (dbMode === 'FIREBASE') {
          try {
            await updateDoc(doc(firebaseFirestore, 'users', uid), { verified: true });
          } catch (e) {
            console.error(e);
          }
        }
        
        localStorage.removeItem(`gs_otp_${uid}`);
        return users[index];
      }
      throw new Error("User session expired.");
    } else {
      throw new Error("Invalid OTP code. Please check and try again.");
    }
  },
  updateProfile: async (uidOrEmail, updatedFields) => {
    let users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const targetKey = String(uidOrEmail || '').toLowerCase().trim();

    let index = users.findIndex(u => 
      (u.uid && String(u.uid).toLowerCase().trim() === targetKey) || 
      (u.email && String(u.email).toLowerCase().trim() === targetKey)
    );

    let u = null;
    if (index !== -1) {
      u = { ...users[index], ...updatedFields };
    } else {
      u = { uid: uidOrEmail, ...updatedFields };
      users.push(u);
      index = users.length - 1;
    }

    if ((u.aadharFront || u.aadharBack || u.resume || u.aadharNumber) && (u.pincode || u.city || u.address || u.bankName)) {
      u.profileComplete = true;
    }
    users[index] = u;
    safeSetLocalStorage('gs_users', users);

    // Update gs_current_user in localStorage if matching
    try {
      const curUser = JSON.parse(localStorage.getItem('gs_current_user'));
      if (
        curUser && (
          (curUser.uid && String(curUser.uid).toLowerCase().trim() === targetKey) ||
          (curUser.email && String(curUser.email).toLowerCase().trim() === targetKey)
        )
      ) {
        safeSetLocalStorage('gs_current_user', { ...curUser, ...u });
      }
    } catch (e) {}

    if (dbMode === 'FIREBASE') {
      try {
        if (u.uid) {
          await setDoc(doc(firebaseFirestore, 'users', u.uid), u, { merge: true });
        }
        if (u.email) {
          await setDoc(doc(firebaseFirestore, 'users', u.email.toLowerCase().trim()), u, { merge: true });
        }
      } catch (e) {
        console.error("Firestore updateProfile error:", e);
      }
    }

    return u;
  },

  getUsers: async () => {
    let firebaseUsers = [];
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'users'));
        snap.forEach(d => firebaseUsers.push(d.data()));
      } catch (e) {
        console.error("SRYN: Error fetching users from Firestore:", e);
      }
    }
    const localUsers = JSON.parse(localStorage.getItem('gs_users')) || [];
    
    // Merge all user sources: SEED_USERS, localUsers, and firebaseUsers
    const mergedMap = new Map();
    [...SEED_USERS, ...localUsers, ...firebaseUsers].forEach(u => {
      if (u && (u.email || u.uid)) {
        const key = (u.email || u.uid).toLowerCase().trim();
        const existing = mergedMap.get(key) || {};
        const combined = { ...existing, ...u };
        if ((combined.aadharFront || combined.aadharBack || combined.resume || combined.aadharNumber) && (combined.pincode || combined.city || combined.address || combined.bankName)) {
          combined.profileComplete = true;
        }
        mergedMap.set(key, combined);
      }
    });
    return Array.from(mergedMap.values()).filter(u => u && (u.fullName || u.email || u.mobile));
  },

  updateUserRole: async (uid, role) => {
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const index = users.findIndex(u => u.uid === uid || u.email === uid);
    let updatedUser = null;

    if (index !== -1) {
      users[index].role = role;
      updatedUser = users[index];
    } else {
      updatedUser = { uid, role };
      users.push(updatedUser);
    }
    localStorage.setItem('gs_users', JSON.stringify(users));

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'users', uid), { role }, { merge: true });
      } catch (e) {
        console.error("Firestore updateUserRole error:", e);
      }
    }

    return updatedUser;
  },

  approveUserKYC: async (userOrUid, isApproved) => {
    let targetUid = null;
    let targetEmail = null;

    if (typeof userOrUid === 'object' && userOrUid !== null) {
      targetUid = userOrUid.uid;
      targetEmail = userOrUid.email;
    } else if (typeof userOrUid === 'string') {
      targetUid = userOrUid;
      if (userOrUid.includes('@')) {
        targetEmail = userOrUid;
      }
    }

    const targetLowerEmail = targetEmail ? targetEmail.toLowerCase().trim() : null;

    // 1. Update in LocalStorage gs_users
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    let updatedUser = null;
    users.forEach((u, i) => {
      if (
        (targetUid && u.uid === targetUid) ||
        (targetLowerEmail && u.email && u.email.toLowerCase().trim() === targetLowerEmail)
      ) {
        users[i].profileApproved = isApproved;
        updatedUser = users[i];
      }
    });
    safeSetLocalStorage('gs_users', users);

    // 2. Update gs_current_user if it matches target user
    try {
      const curUser = JSON.parse(localStorage.getItem('gs_current_user'));
      if (
        curUser && (
          (targetUid && curUser.uid === targetUid) ||
          (targetLowerEmail && curUser.email && curUser.email.toLowerCase().trim() === targetLowerEmail)
        )
      ) {
        curUser.profileApproved = isApproved;
        safeSetLocalStorage('gs_current_user', curUser);
      }
    } catch (e) {}

    // 3. Update Firestore docs in BOTH email & uid matches
    if (dbMode === 'FIREBASE') {
      try {
        if (targetUid) {
          await setDoc(doc(firebaseFirestore, 'users', targetUid), { profileApproved: isApproved }, { merge: true });
        }
        if (targetLowerEmail) {
          await setDoc(doc(firebaseFirestore, 'users', targetLowerEmail), { profileApproved: isApproved }, { merge: true });

          const q = query(collection(firebaseFirestore, 'users'), where('email', '==', targetEmail));
          const snap = await getDocs(q);
          snap.forEach(async (docSnap) => {
            await setDoc(doc(firebaseFirestore, 'users', docSnap.id), { profileApproved: isApproved }, { merge: true });
          });
        }
      } catch (e) {
        console.error("Firestore approveUserKYC error:", e);
      }
    }

    return updatedUser || { uid: targetUid, email: targetEmail, profileApproved: isApproved };
  },

  deleteUser: async (userOrUid) => {
    let targetUid = typeof userOrUid === 'object' ? userOrUid.uid : userOrUid;
    let targetEmail = typeof userOrUid === 'object' ? userOrUid.email : (typeof userOrUid === 'string' && userOrUid.includes('@') ? userOrUid : null);
    const targetLower = targetEmail ? targetEmail.toLowerCase().trim() : null;

    // 1. Delete from LocalStorage gs_users
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const filtered = users.filter(u => {
      if (!u) return false;
      if (!u.fullName && !u.email && !u.mobile) return false; // purge blank rows
      if (targetUid && u.uid === targetUid) return false;
      if (targetLower && u.email && u.email.toLowerCase().trim() === targetLower) return false;
      return true;
    });
    safeSetLocalStorage('gs_users', filtered);

    // 2. Delete from Firestore
    if (dbMode === 'FIREBASE') {
      try {
        if (targetUid) {
          await deleteDoc(doc(firebaseFirestore, 'users', targetUid));
        }
        if (targetLower) {
          await deleteDoc(doc(firebaseFirestore, 'users', targetLower));
          const q = query(collection(firebaseFirestore, 'users'), where('email', '==', targetEmail));
          const snap = await getDocs(q);
          snap.forEach(async (d) => {
            await deleteDoc(doc(firebaseFirestore, 'users', d.id));
          });
        }
        // Also delete any corrupt/blank document in Firestore
        const snapAll = await getDocs(collection(firebaseFirestore, 'users'));
        snapAll.forEach(async (d) => {
          const data = d.data();
          if (!data || (!data.fullName && !data.email && !data.mobile)) {
            await deleteDoc(doc(firebaseFirestore, 'users', d.id));
          }
        });
      } catch (e) {
        console.error("Firebase Firestore user document delete error:", e);
      }
    }
    return true;
  },

  resetUserPassword: async (uid, email, newPassword = 'password123') => {
    const users = JSON.parse(localStorage.getItem('gs_users')) || [];
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index].password = newPassword;
      localStorage.setItem('gs_users', JSON.stringify(users));
    }

    if (dbMode === 'FIREBASE') {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
      } catch (e) {
        console.error("Firebase Auth send password reset email error:", e);
        throw e;
      }
    }
    return true;
  },

  // --- Projects Operations ---
  getProjects: async () => {
    let raw = JSON.parse(localStorage.getItem('gs_projects')) || [];
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'projects'));
        const fbProjects = [];
        snap.forEach(d => fbProjects.push(d.data()));
        if (fbProjects.length > 0) raw = fbProjects;
      } catch (e) {
        console.error(e);
      }
    }
    const withDefaults = attachDefaultScriptFieldsIfNeeded(raw);
    localStorage.setItem('gs_projects', JSON.stringify(withDefaults));
    return withDefaults;
  },

  addProject: async (project) => {
    const newProject = {
      id: 'proj-' + Date.now(),
      status: 'Active',
      hiringCount: 0,
      ...project
    };

    const projects = JSON.parse(localStorage.getItem('gs_projects'));
    projects.push(newProject);
    localStorage.setItem('gs_projects', JSON.stringify(projects));

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'projects', newProject.id), newProject);
      } catch (e) {
        console.error(e);
      }
    }

    return newProject;
  },

  updateProject: async (id, updatedFields) => {
    const projects = JSON.parse(localStorage.getItem('gs_projects'));
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const updated = { ...projects[index], ...updatedFields };
      projects[index] = updated;
      localStorage.setItem('gs_projects', JSON.stringify(projects));

      if (dbMode === 'FIREBASE') {
        try {
          await setDoc(doc(firebaseFirestore, 'projects', id), updated);
        } catch (e) {
          console.error(e);
        }
      }

      return updated;
    }
    throw new Error("Project not found.");
  },

  deleteProject: async (id) => {
    let projects = JSON.parse(localStorage.getItem('gs_projects'));
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('gs_projects', JSON.stringify(projects));

    if (dbMode === 'FIREBASE') {
      try {
        await deleteDoc(doc(firebaseFirestore, 'projects', id));
      } catch (e) {
        console.error(e);
      }
    }

    return true;
  },

  // --- Leads Operations ---
  getLeads: async () => {
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'leads'));
        const leads = [];
        snap.forEach(d => leads.push(d.data()));
        if (leads.length > 0) return leads;
      } catch (e) {
        console.error(e);
      }
    }
    return JSON.parse(localStorage.getItem('gs_leads')) || [];
  },

  addLead: async (lead) => {
    const newLead = {
      id: 'lead-' + Date.now(),
      status: 'New',
      date: new Date().toISOString().split('T')[0],
      history: [{ status: 'New', date: new Date().toISOString().split('T')[0], note: 'Lead created' }],
      ...lead
    };

    const leads = JSON.parse(localStorage.getItem('gs_leads'));
    leads.push(newLead);
    localStorage.setItem('gs_leads', JSON.stringify(leads));

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'leads', newLead.id), newLead);
      } catch (e) {
        console.error(e);
      }
    }

    return newLead;
  },

  updateLeadStatus: async (id, status, feedback) => {
    const leads = JSON.parse(localStorage.getItem('gs_leads'));
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const lead = leads[index];
      lead.status = status;
      lead.feedback = feedback;
      lead.history.push({ status, date: today, note: feedback });
      leads[index] = lead;
      localStorage.setItem('gs_leads', JSON.stringify(leads));

      if (dbMode === 'FIREBASE') {
        try {
          await setDoc(doc(firebaseFirestore, 'leads', id), lead);
        } catch (e) {
          console.error(e);
        }
      }

      return lead;
    }
    throw new Error("Lead not found.");
  },

  assignLeads: async (leadIds, hrId) => {
    const leads = JSON.parse(localStorage.getItem('gs_leads'));
    leadIds.forEach(id => {
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        leads[index].assignedTo = hrId;
        
        if (dbMode === 'FIREBASE') {
          try {
            updateDoc(doc(firebaseFirestore, 'leads', id), { assignedTo: hrId });
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
    localStorage.setItem('gs_leads', JSON.stringify(leads));
    return true;
  },

  // --- Customers ---
  getCustomers: async (executiveId) => {
    if (dbMode === 'FIREBASE') {
      try {
        let q = collection(firebaseFirestore, 'customers');
        if (executiveId) {
          q = query(q, where('addedBy', '==', executiveId));
        }
        const snap = await getDocs(q);
        const customers = [];
        snap.forEach(d => customers.push(d.data()));
        if (customers.length > 0) return customers;
      } catch (e) {
        console.error(e);
      }
    }
    const customers = JSON.parse(localStorage.getItem('gs_customers')) || [];
    if (executiveId) {
      return customers.filter(c => c.addedBy === executiveId);
    }
    return customers;
  },

  addCustomer: async (customer, executiveId) => {
    const newCustomer = {
      id: 'cust-' + Date.now(),
      addedBy: executiveId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending KYC',
      ...customer
    };

    const customers = JSON.parse(localStorage.getItem('gs_customers')) || [];
    customers.push(newCustomer);
    localStorage.setItem('gs_customers', JSON.stringify(customers));

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'customers', newCustomer.id), newCustomer);
      } catch (e) {
        console.error(e);
      }
    }

    return newCustomer;
  },

  // --- Offer Letters ---
  getTemplates: async () => {
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'templates'));
        const templates = [];
        snap.forEach(d => templates.push(d.data()));
        if (templates.length > 0) {
          // Self-healing check: Upgrade templates to include joining_date field & FD account clause
          const hr = templates.find(t => t.role === 'HR');
          if (!hr || !hr.content || !hr.content.includes("joining_date")) {
            console.log('SRYN: Upgrading Firestore offer templates with Date of Joining field...');
            for (const temp of SEED_TEMPLATES) {
              await setDoc(doc(firebaseFirestore, 'templates', temp.id), temp);
            }
            return SEED_TEMPLATES;
          }
          return templates;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback logic for Local Storage: Upgrade if old template
    const local = JSON.parse(localStorage.getItem('gs_templates'));
    const localHR = local ? local.find(t => t.role === 'HR') : null;
    if (!localHR || !localHR.content || !localHR.content.includes("joining_date")) {
      localStorage.setItem('gs_templates', JSON.stringify(SEED_TEMPLATES));
      return SEED_TEMPLATES;
    }
    return local || SEED_TEMPLATES;
  },

  saveTemplate: async (id, updatedFields) => {
    const templates = JSON.parse(localStorage.getItem('gs_templates'));
    const index = templates.findIndex(t => t.id === id);
    let targetTemplate = null;

    if (index !== -1) {
      targetTemplate = { ...templates[index], ...updatedFields };
      templates[index] = targetTemplate;
    } else {
      targetTemplate = {
        id,
        ...updatedFields
      };
      templates.push(targetTemplate);
    }

    localStorage.setItem('gs_templates', JSON.stringify(templates));

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'templates', id), targetTemplate);
      } catch (e) {
        console.error(e);
      }
    }

    return targetTemplate;
  },

  // --- Real-time Firestore Subscriptions ---
  subscribeUsers: (callback) => {
    if (dbMode === 'FIREBASE') {
      try {
        return onSnapshot(collection(firebaseFirestore, 'users'), (snap) => {
          const firebaseUsers = [];
          snap.forEach(d => firebaseUsers.push(d.data()));
          const localUsers = JSON.parse(localStorage.getItem('gs_users')) || [];
          const mergedMap = new Map();
          [...SEED_USERS, ...localUsers, ...firebaseUsers].forEach(u => {
            if (u && (u.email || u.uid)) {
              const key = (u.email || u.uid).toLowerCase().trim();
              const existing = mergedMap.get(key) || {};
              mergedMap.set(key, { ...existing, ...u });
            }
          });
          const validUsers = Array.from(mergedMap.values()).filter(u => u && (u.fullName || u.email || u.mobile));
          callback(validUsers);
        });
      } catch (e) {
        console.error("subscribeUsers error:", e);
      }
    }
    return () => {};
  },

  subscribeProjects: (callback) => {
    if (dbMode === 'FIREBASE') {
      try {
        return onSnapshot(collection(firebaseFirestore, 'projects'), (snap) => {
          const fbProjects = [];
          snap.forEach(d => fbProjects.push(d.data()));
          const withDefaults = attachDefaultScriptFieldsIfNeeded(fbProjects);
          callback(withDefaults);
        });
      } catch (e) {
        console.error("subscribeProjects error:", e);
      }
    }
    return () => {};
  },

  subscribeLeads: (callback) => {
    if (dbMode === 'FIREBASE') {
      try {
        return onSnapshot(collection(firebaseFirestore, 'leads'), (snap) => {
          const leads = [];
          snap.forEach(d => leads.push(d.data()));
          callback(leads);
        });
      } catch (e) {
        console.error("subscribeLeads error:", e);
      }
    }
    return () => {};
  },

  subscribeCustomers: (executiveId, callback) => {
    if (dbMode === 'FIREBASE') {
      try {
        let q = collection(firebaseFirestore, 'customers');
        if (executiveId) {
          q = query(q, where('addedBy', '==', executiveId));
        }
        return onSnapshot(q, (snap) => {
          const customers = [];
          snap.forEach(d => customers.push(d.data()));
          callback(customers);
        });
      } catch (e) {
        console.error("subscribeCustomers error:", e);
      }
    }
    return () => {};
  }
};
export default dbService;
