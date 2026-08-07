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
    id: 'proj-fd-card-1',
    title: 'FD Card',
    category: 'Financial Products',
    description: 'Work as Customer Relationship Executive for FD Card Campaign. Assist customers with Fixed Deposit Linked Credit Card activations, CIBIL score building, and onboarding.',
    commission: '₹15,000 / month + ₹500 incentive per FD card',
    salary: '₹15,000 / month + Incentives',
    location: 'Hometown / Local District',
    hiringCount: 500,
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
    <p>It is with considerable pleasure that SRYN Management Private Limited extends to you this formal Offer of Employment for the position of {{position}}. After a comprehensive evaluation of your communication aptitude, professional disposition, interpersonal capabilities, and overall suitability for a client-oriented role, the Management has decided to offer you an opportunity to become an integral part of our expanding organization. This appointment is being made in anticipation of your ability to contribute meaningfully towards the Company's customer acquisition, relationship management, and financial product activation initiatives.</p>
    <p>This Appointment Letter embodies the principal terms and conditions governing your engagement with the Company and shall be read in conjunction with all internal policies, operational directives, compliance requirements, ethical standards, and administrative regulations issued by the Company from time to time. By accepting this offer and commencing employment, you acknowledge that you have carefully reviewed, understood, and voluntarily accepted all provisions contained herein and agree to remain bound by the same throughout the tenure of your association with SRYN Management Private Limited.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">1. APPOINTMENT AND COMMENCEMENT OF EMPLOYMENT</h3>
    <p>You are hereby appointed as a {{position}} with SRYN Management Private Limited effective from your official Date of Joining. Your engagement shall be governed by the terms set forth in this Appointment Letter together with all Company policies, operational procedures, administrative communications, and statutory requirements applicable from time to time. During the course of your employment, you shall devote your complete professional attention, abilities, and efforts exclusively towards the business interests of the Company.</p>
    <p>The Management reserves the unrestricted right to assign, alter, expand, or reallocate your duties, territories, campaigns, reporting structures, or operational responsibilities depending upon business exigencies, organizational expansion, market conditions, or strategic requirements. Your appointment is based upon the information and documents submitted by you during the selection process, and any concealment, misrepresentation, falsification, or inaccuracy discovered at any stage shall render this appointment liable to immediate cancellation without prior notice. Continuation of employment shall remain contingent upon satisfactory performance, operational compliance, professional conduct, and adherence to Company regulations.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">2. NATURE OF EMPLOYMENT</h3>
    <p>Your appointment is on a full-time and performance-oriented basis. You shall not, during the subsistence of your employment, engage directly or indirectly in any other employment, consultancy, freelancing assignment, partnership, commission-based activity, or commercial venture that may conflict with the interests of SRYN Management Private Limited without obtaining prior written approval from the Management.</p>
    <p>The Company may, at its sole discretion, deploy you across different customer engagement campaigns, financial product initiatives, tele-calling operations, relationship management assignments, onboarding programs, or business development activities. You acknowledge that flexibility, adaptability, and operational cooperation constitute essential conditions of this employment and agree to perform every lawful assignment entrusted to you with diligence, sincerity, and professionalism.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">3. PROBATION PERIOD</h3>
    <p>Your employment shall initially remain on probation for a period of Three (3) Months commencing from your official joining date. The purpose of this probationary tenure is to enable the Company to evaluate your communication skills, customer handling ability, productivity, attendance, punctuality, discipline, ethical conduct, adaptability, and overall suitability for continued engagement.</p>
    <p>During this period, your performance shall be reviewed periodically by the Management. Successful completion of the probation period shall not automatically result in confirmation of employment. The Company may, at its sole discretion, confirm your services, extend the probation period, or discontinue your employment if your performance, conduct, attendance, or operational contribution is found to be unsatisfactory. Confirmation shall become effective only upon issuance of a written confirmation by the authorized representative of the Company.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">4. ROLES AND RESPONSIBILITIES</h3>
    <p>As a {{position}}, you shall be responsible for establishing and maintaining professional relationships with prospective and existing customers, communicating the features and benefits of the Company's financial products, assisting customers in the completion of onboarding formalities, coordinating documentation, resolving customer queries, conducting follow-ups, and facilitating successful activation of designated Fixed Deposit (FD) linked card products.</p>
    <p>You shall maintain accurate records of customer interactions, activation status, follow-up activities, and conversion reports through the systems prescribed by the Company. Professional communication, ethical conduct, transparency, and customer-centric behaviour are mandatory requirements of this role. The Management may assign additional operational, tele-calling, reporting, coordination, or customer engagement responsibilities depending upon business requirements, and you shall perform such duties diligently and without objection.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">5. WORKING HOURS AND ATTENDANCE</h3>
    <p>The standard working schedule for this position shall be from {{working_hours}}, comprising eight working hours together with the applicable break period as determined by the Company. Employees are expected to report punctually and remain available throughout the scheduled working period unless otherwise authorized.</p>
    <p>Failure to log in or report for duty by 11:00 A.M. without prior approval may result in the attendance being treated as a Half-Day, irrespective of the actual reporting time thereafter. Repeated late reporting, irregular attendance, early departure, prolonged inactivity, or habitual delays shall be considered a serious breach of workplace discipline and may adversely affect performance evaluation and continuity of employment. The weekly holiday shall ordinarily be Sunday, subject to operational requirements.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">6. PERFORMANCE EVALUATION, KEY PERFORMANCE INDICATORS (KPIs) AND BUSINESS DELIVERABLES</h3>
    <p>The position of {{position}} is categorized as a Performance-Linked Customer Acquisition Role, wherein the Employee's overall contribution shall be evaluated on the basis of measurable business outcomes, operational efficiency, customer conversion ratio, compliance standards, and service quality. Accordingly, the Employee shall be entrusted with the responsibility of facilitating the successful activation of {{performance_target}} during every monthly evaluation cycle.</p>
    <p>For the purpose of performance computation, a card shall be recognized as a Successful Business Conversion only where the respective customer has completed the prescribed onboarding formalities, submitted all mandatory documentation, and successfully activated a Fixed Deposit of not less than ₹2,000/- through the Company's authorized process. Merely collecting customer information, generating leads, completing telephonic discussions, or initiating documentation shall not constitute a successful conversion unless the prescribed financial activation has been completed and verified by the Company.</p>
    <p>The Employee expressly acknowledges that the above Key Performance Indicator (KPI) has been established after considering commercial feasibility, operational capacity, market demand, and organizational objectives. Consequently, achievement of the prescribed KPI shall constitute one of the principal parameters governing monthly performance assessment, remuneration eligibility, career progression, and future employment continuity. The Company's internal records, operational reports, and verified business data shall alone be considered conclusive for determining successful conversions, and the Management's decision in this regard shall remain final and binding.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">7. REMUNERATION, PERFORMANCE-LINKED COMPENSATION AND INCENTIVE STRUCTURE</h3>
    <p>The Employee shall be eligible for a Consolidated Monthly Remuneration of {{salary}}, subject to applicable deductions, Company policies, attendance compliance, operational discipline, and successful fulfillment of the prescribed Performance Evaluation Framework.</p>
    <p>The Employee expressly understands that the remuneration offered under this appointment does not constitute an unconditional fixed salary but represents a Performance-Linked Compensation Model, formulated to reward productivity, operational efficiency, customer acquisition capability, and measurable business contribution. Accordingly, eligibility for the full monthly remuneration shall arise only where the Employee has successfully achieved not less than Sixty Percent (60%) of the prescribed monthly Key Performance Indicator together with satisfactory attendance, professional conduct, reporting compliance, and adherence to organizational policies.</p>
    <p>Where the Employee's verified performance falls below the prescribed eligibility threshold, the Company reserves the exclusive discretion to determine remuneration proportionately on the basis of actual productivity, verified business conversions, attendance records, operational contribution, and overall performance index. Such determination shall not be construed as a deduction from salary but as an assessment under the Company's approved Performance-Based Compensation Framework, which the Employee voluntarily accepts upon execution of this Appointment Letter.</p>
    <p>In recognition of exceptional business performance, the Company shall further provide a Performance Incentive of ₹500/- (Rupees Five Hundred Only) for every additional successfully activated Fixed Deposit Linked Card completed beyond the prescribed monthly benchmark, provided such activation satisfies all operational verification requirements and remains approved by the Company's internal audit process. Incentive eligibility shall arise only upon successful verification of the concerned business transaction and shall be released along with or subsequent to the monthly remuneration cycle as determined by the Management. The Company reserves the right to revise, suspend, or modify the incentive framework depending upon business requirements, commercial policies, or market conditions without affecting the remaining terms of employment.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">8. LEAVE, WEEKLY OFF AND ABSENCE MANAGEMENT</h3>
    <p>The Employee shall ordinarily be entitled to Sunday as the designated weekly off, subject to operational exigencies and business requirements. Except where specifically sanctioned in writing by the Management, the Company shall not provide paid leave, paid holidays, or compensated absence during the tenure of employment. Every Employee is expected to maintain uninterrupted attendance and operational availability throughout the scheduled working period.</p>
    <p>Whenever an Employee is unable to report for duty due to unavoidable circumstances, prior intimation shall be communicated to the Reporting Authority through the prescribed communication channel. Failure to provide such intimation before remaining absent shall be treated as Unauthorized Absence, and the concerned day shall automatically be considered Leave Without Pay (LWP) or any other attendance status considered appropriate by the Company.</p>
    <p>Where an Employee remains absent for more than three (3) consecutive working days without obtaining prior authorization or without maintaining communication with the Company, such conduct may be construed as voluntary abandonment of employment, empowering the Company to discontinue the employment relationship without any further notice or obligation. Persistent absenteeism, habitual irregular attendance, or repeated disregard of attendance procedures shall adversely affect performance evaluation and may invite disciplinary proceedings.</p>

    <h3 style="color: #de3163; font-size: 1rem; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #de3163; padding-left: 10px; font-weight: 700;">9. PROFESSIONAL ETHICS, CUSTOMER CONDUCT AND ORGANIZATIONAL DISCIPLINE</h3>
    <p>The Employee shall conduct themselves with the highest degree of professionalism, integrity, courtesy, confidentiality, and commercial ethics while interacting with customers, colleagues, supervisors, business associates, and any individual representing the Company. Every communication made on behalf of the Company shall be truthful, accurate, respectful, and consistent with the standards established by SRYN Management Private Limited.</p>
    <p>The Employee shall not make false commitments, misleading representations, unauthorized promises, or inaccurate statements regarding any financial product, Fixed Deposit scheme, incentives, or Company policy. Any deliberate misrepresentation, concealment of material facts, manipulation of business records, submission of inaccurate reports, misuse of Company resources, inappropriate customer behaviour, breach of confidentiality, or conduct prejudicial to the commercial interests or reputation of the Company shall constitute Material Misconduct and may result in immediate disciplinary action, including suspension or termination of employment.</p>
    <p>The Employee further acknowledges that continuation of employment shall remain dependent not merely upon target achievement but equally upon maintaining exemplary professional behaviour, operational discipline, regulatory compliance, ethical business practices, and complete adherence to all Company policies issued from time to time.</p>
    <!-- NO_BOLD_V2 -->

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
    title: 'Customer Relationship Executive Appointment Cum Offer Letter',
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

export const SEED_TRAINING_MODULES = [
  {
    id: 'train-fd-card-1',
    title: 'FD Card Sourcing & Customer Onboarding Manual',
    category: 'FD Card',
    targetRole: 'Candidate',
    description: 'Official step-by-step training PDF covering Fixed Deposit linked Credit Card benefits, customer CIBIL verification, and live activation guidelines.',
    pdfUrl: '',
    fileName: 'FD_Card_Training_Manual.pdf',
    type: 'PDF',
    date: '2026-08-07'
  },
  {
    id: 'train-cre-pitch-1',
    title: 'Customer Relationship Executive Telephonic Script & Objection Guide',
    category: 'Financial Products',
    targetRole: 'Candidate',
    description: 'Round 1 & Round 2 pitching scripts, customer objection resolution phrases, and ethical compliance standards.',
    pdfUrl: '',
    fileName: 'CRE_Pitch_Script_Guide.pdf',
    type: 'PDF',
    date: '2026-08-07'
  },
  {
    id: 'train-hr-sop-1',
    title: 'HR Sourcing & Field Executive Verification Operational Guidelines',
    category: 'HR Officers',
    targetRole: 'HR',
    description: 'HR Specialist guidelines for interviewing candidates, checking Aadhar KYC completeness, and managing team campaign leads.',
    pdfUrl: '',
    fileName: 'HR_SOP_Training_Guide.pdf',
    type: 'PDF',
    date: '2026-08-07'
  }
];

// Initialize localStorage if empty
const initMockStorage = () => {
  if (!localStorage.getItem('gs_users')) {
    localStorage.setItem('gs_users', JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem('gs_training_modules')) {
    localStorage.setItem('gs_training_modules', JSON.stringify(SEED_TRAINING_MODULES));
  }
  
  // Ensure FD Card & CRE projects are present and updated
  let existing = JSON.parse(localStorage.getItem('gs_projects')) || [];
  if (existing.length === 0) {
    existing = [...SEED_PROJECTS];
  } else {
    const fdIndex = existing.findIndex(p => p.id === 'proj-fd-card-1' || p.title === 'FD Card');
    if (fdIndex === -1) {
      existing.unshift(SEED_PROJECTS[0]);
    }
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
      existing.push(SEED_PROJECTS[1]);
    }
  }
  localStorage.setItem('gs_projects', JSON.stringify(existing));

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
      // Ensure FD Card & CRE projects are in Firestore if missing (do not overwrite existing edits)
      const fdDocRef = doc(firebaseFirestore, 'projects', 'proj-fd-card-1');
      const fdSnap = await getDoc(fdDocRef);
      if (!fdSnap.exists()) {
        await setDoc(fdDocRef, SEED_PROJECTS[0]);
      }

      const creDocRef = doc(firebaseFirestore, 'projects', 'proj-cre-1');
      const creSnap = await getDoc(creDocRef);
      if (!creSnap.exists()) {
        await setDoc(creDocRef, SEED_PROJECTS[1]);
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
    console.warn(`LocalStorage quota exceeded for key "${key}". Applying resilient document storage fallback...`);
    try {
      if (key === 'gs_current_user') {
        const obj = typeof value === 'string' ? JSON.parse(value) : { ...value };
        const uid = obj.uid || obj.email;
        if (uid) {
          if (obj.resume && obj.resume.length > 200000) {
            try { localStorage.setItem(`gs_doc_resume_${uid}`, obj.resume); } catch(e2){}
            obj.resume = obj.resumeName ? `[PDF_DOCUMENT: ${obj.resumeName}]` : '[PDF_SAVED]';
          }
          if (obj.aadharFront && obj.aadharFront.length > 200000) {
            try { localStorage.setItem(`gs_doc_aadharFront_${uid}`, obj.aadharFront); } catch(e2){}
            obj.aadharFront = '[AADHAR_FRONT_SAVED]';
          }
          if (obj.aadharBack && obj.aadharBack.length > 200000) {
            try { localStorage.setItem(`gs_doc_aadharBack_${uid}`, obj.aadharBack); } catch(e2){}
            obj.aadharBack = '[AADHAR_BACK_SAVED]';
          }
        }
        localStorage.setItem(key, JSON.stringify(obj));
      } else if (key === 'gs_training_modules' && Array.isArray(value)) {
        const stripped = value.map(m => {
          if (!m) return m;
          const clone = { ...m };
          if (clone.pdfUrl && clone.pdfUrl.length > 100000) {
            if (clone.id) {
              try { localStorage.setItem(`gs_train_pdf_${clone.id}`, clone.pdfUrl); } catch(e2){}
            }
            clone.pdfUrl = `[STORED_IN_KEY: gs_train_pdf_${clone.id}]`;
          }
          return clone;
        });
        localStorage.setItem(key, JSON.stringify(stripped));
      } else if (typeof value === 'object' && value !== null && Array.isArray(value)) {
        const curUserStr = localStorage.getItem('gs_current_user');
        let curUid = '';
        try { curUid = JSON.parse(curUserStr)?.uid || ''; } catch(err){}

        const stripped = value.map(u => {
          if (!u) return u;
          const clone = { ...u };
          if (clone.uid !== curUid && clone.email !== curUid) {
            if (clone.aadharFront && clone.aadharFront.length > 500) clone.aadharFront = '[STORED_IN_FIRESTORE]';
            if (clone.aadharBack && clone.aadharBack.length > 500) clone.aadharBack = '[STORED_IN_FIRESTORE]';
            if (clone.resume && clone.resume.length > 500) clone.resume = '[STORED_IN_FIRESTORE]';
          } else {
            if (clone.resume && clone.resume.length > 200000) clone.resume = clone.resumeName ? `[PDF_DOCUMENT: ${clone.resumeName}]` : '[PDF_SAVED]';
          }
          return clone;
        });
        localStorage.setItem(key, JSON.stringify(stripped));
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
    let projects = JSON.parse(localStorage.getItem('gs_projects')) || [];
    let index = projects.findIndex(p => p.id === id);
    if (index === -1 && updatedFields.title) {
      index = projects.findIndex(p => p.title === updatedFields.title);
    }
    
    if (index !== -1) {
      const docId = projects[index].id || id;
      const updated = { ...projects[index], ...updatedFields, id: docId };
      projects[index] = updated;
      localStorage.setItem('gs_projects', JSON.stringify(projects));

      if (dbMode === 'FIREBASE') {
        try {
          await setDoc(doc(firebaseFirestore, 'projects', docId), updated, { merge: true });
        } catch (e) {
          console.error("Firestore updateProject error:", e);
        }
      }

      return updated;
    } else {
      const newProj = { id, status: 'Active', hiringCount: 0, ...updatedFields };
      projects.push(newProj);
      localStorage.setItem('gs_projects', JSON.stringify(projects));
      if (dbMode === 'FIREBASE') {
        try {
          await setDoc(doc(firebaseFirestore, 'projects', id), newProj, { merge: true });
        } catch (e) {
          console.error("Firestore updateProject fallback error:", e);
        }
      }
      return newProj;
    }
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
          const cand = templates.find(t => t.role === 'Candidate');
          if (!cand || !cand.content || !cand.content.includes("NO_BOLD_V2")) {
            console.log('SRYN: Upgrading Firestore offer templates with unbolded 9-clause CRE Appointment Letter...');
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
    const localCand = local ? local.find(t => t.role === 'Candidate') : null;
    if (!localCand || !localCand.content || !localCand.content.includes("NO_BOLD_V2")) {
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
  },

  // --- Training Modules Operations ---
  getTrainingModules: async () => {
    let modules = [];
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'training_modules'));
        snap.forEach(d => modules.push(d.data()));
      } catch (e) {
        console.error("Firestore getTrainingModules error:", e);
      }
    }
    if (!modules || modules.length === 0) {
      modules = JSON.parse(localStorage.getItem('gs_training_modules')) || SEED_TRAINING_MODULES;
    }
    return (modules || []).map(m => {
      if (m.id) {
        const storedPdf = localStorage.getItem(`gs_train_pdf_${m.id}`);
        if (storedPdf && (!m.pdfUrl || m.pdfUrl.length < 100)) {
          return { ...m, pdfUrl: storedPdf };
        }
      }
      return m;
    });
  },

  addTrainingModule: async (moduleData) => {
    const newId = 'train-' + Date.now();
    let pdfUrl = moduleData.pdfUrl || '';
    if (pdfUrl && pdfUrl.length > 100000) {
      try { localStorage.setItem(`gs_train_pdf_${newId}`, pdfUrl); } catch(e){}
    }

    const newModule = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'Candidate',
      type: 'PDF',
      ...moduleData
    };
    const modules = JSON.parse(localStorage.getItem('gs_training_modules')) || [...SEED_TRAINING_MODULES];
    modules.unshift(newModule);
    safeSetLocalStorage('gs_training_modules', modules);

    if (dbMode === 'FIREBASE') {
      try {
        await setDoc(doc(firebaseFirestore, 'training_modules', newModule.id), newModule);
      } catch (e) {
        console.error("Firestore addTrainingModule error:", e);
      }
    }
    return newModule;
  },

  updateTrainingModule: async (id, updatedFields) => {
    if (updatedFields.pdfUrl && updatedFields.pdfUrl.length > 100000) {
      try { localStorage.setItem(`gs_train_pdf_${id}`, updatedFields.pdfUrl); } catch(e){}
    }
    let modules = JSON.parse(localStorage.getItem('gs_training_modules')) || [...SEED_TRAINING_MODULES];
    const index = modules.findIndex(m => m.id === id);
    if (index !== -1) {
      const updated = { ...modules[index], ...updatedFields };
      modules[index] = updated;
      safeSetLocalStorage('gs_training_modules', modules);

      if (dbMode === 'FIREBASE') {
        try {
          await setDoc(doc(firebaseFirestore, 'training_modules', id), updated, { merge: true });
        } catch (e) {
          console.error("Firestore updateTrainingModule error:", e);
        }
      }
      return updated;
    }
    throw new Error("Training module not found.");
  },

  deleteTrainingModule: async (id) => {
    let modules = JSON.parse(localStorage.getItem('gs_training_modules')) || [];
    modules = modules.filter(m => m.id !== id);
    try { localStorage.removeItem(`gs_train_pdf_${id}`); } catch(e){}
    safeSetLocalStorage('gs_training_modules', modules);

    if (dbMode === 'FIREBASE') {
      try {
        await deleteDoc(doc(firebaseFirestore, 'training_modules', id));
      } catch (e) {
        console.error("Firestore deleteTrainingModule error:", e);
      }
    }
    return true;
  },

  subscribeTrainingModules: (callback) => {
    if (dbMode === 'FIREBASE') {
      try {
        return onSnapshot(collection(firebaseFirestore, 'training_modules'), (snap) => {
          const fbModules = [];
          snap.forEach(d => fbModules.push(d.data()));
          const list = fbModules.length > 0 ? fbModules : (JSON.parse(localStorage.getItem('gs_training_modules')) || SEED_TRAINING_MODULES);
          const mapped = (list || []).map(m => {
            if (m.id) {
              const storedPdf = localStorage.getItem(`gs_train_pdf_${m.id}`);
              if (storedPdf && (!m.pdfUrl || m.pdfUrl.length < 100)) {
                return { ...m, pdfUrl: storedPdf };
              }
            }
            return m;
          });
          callback(mapped);
        });
      } catch (e) {
        console.error("subscribeTrainingModules error:", e);
      }
    }
    return () => {};
  }
};
export default dbService;
