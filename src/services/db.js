// Firebase Service Layer with LocalStorage/IndexedDB fallback
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updatePassword as firebaseUpdatePassword
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
  deleteDoc
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
    console.log('GigSathi: Connected to Firebase.');
  } catch (error) {
    console.warn('GigSathi: Firebase failed to connect, falling back to Local Mock DB.', error);
    dbMode = 'MOCK';
  }
} else {
  console.log('GigSathi: Running in Local Mock DB mode.');
}

// -------------------------------------------------------------
// Seed Data for Mock Mode / First Time Setup
// -------------------------------------------------------------
const SEED_USERS = [
  {
    uid: 'admin-1',
    fullName: 'Rajesh Kumar',
    email: 'admin@gigsathi.com',
    mobile: '9876543210',
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
  },
  {
    uid: 'hr-1',
    fullName: 'Anjali Sharma',
    email: 'hr@gigsathi.com',
    mobile: '9876543211',
    role: 'HR',
    verified: true,
    profileComplete: true,
    aadharNumber: '4321-8765-2109',
    address: 'DLF Phase 3, Gurugram, Haryana',
    pincode: '122002',
    city: 'Gurugram',
    state: 'Haryana',
    aadharFront: '',
    aadharBack: '',
    resume: ''
  },
  {
    uid: 'candidate-1',
    fullName: 'Amit Patel',
    email: 'candidate@gigsathi.com',
    mobile: '9876543212',
    role: 'Candidate',
    verified: true,
    profileComplete: false,
    aadharNumber: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    aadharFront: '',
    aadharBack: '',
    resume: ''
  }
];

const SEED_PROJECTS = [
  {
    id: 'proj-1',
    title: 'HDFC Credit Card Sales',
    category: 'Financial Products',
    description: 'Promote and acquire customers for HDFC Bank Lifetime Free credit cards. High commission rates and daily payouts.',
    commission: 'Rs. 2,500 per approved card',
    hiringCount: 150,
    status: 'Active',
    workingLink: 'https://gigsathi.com/fd-apply/hdfc-cc'
  },
  {
    id: 'proj-2',
    title: 'Zomato Delivery Fleet',
    category: 'Delivery Boy Hiring',
    description: 'Onboard delivery partners for Zomato. flexible shifts, weekly payouts, and join-in bonuses across 50+ cities.',
    commission: 'Rs. 1,200 per active rider (onboarded)',
    hiringCount: 500,
    status: 'Active',
    workingLink: 'https://gigsathi.com/fd-apply/zomato-rider'
  },
  {
    id: 'proj-3',
    title: 'Swiggy Instamart Executives',
    category: 'Delivery Boy Hiring',
    description: 'Onboard pickers and runners for Swiggy Instamart dark stores. Stable pay structure with performance incentives.',
    commission: 'Rs. 1,000 per onboarded partner',
    hiringCount: 300,
    status: 'Active',
    workingLink: 'https://gigsathi.com/fd-apply/swiggy-insta'
  },
  {
    id: 'proj-4',
    title: 'Airtel Payments Bank KYC Agent',
    category: 'Third Party Hiring',
    description: 'Recruiting merchant onboarding field agents for Airtel Payments Bank. Requires strong communication skills.',
    commission: 'Rs. 150 per merchant KYC activation',
    hiringCount: 200,
    status: 'Active',
    workingLink: 'https://gigsathi.com/fd-apply/airtel-kyc'
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

const SEED_TEMPLATES = [
  {
    id: 'temp-candidate',
    role: 'Candidate',
    title: 'Candidate / Field Executive Offer Letter',
    content: `<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h2 style="text-align: center; color: #de3163; margin-bottom: 20px; font-size: 1.5rem; font-weight: 800;">CONTRACT OF ENGAGEMENT</h2>
    <p><strong>Date:</strong> {{date}}</p>
    <p><strong>To,</strong><br/>
    <strong>Name:</strong> {{name}}<br/>
    <strong>Email:</strong> {{email}}<br/>
    <strong>Mobile:</strong> {{mobile}}</p>

    <p><strong>Subject: Letter of Engagement as Independent Field Associate / Gig Partner</strong></p>

    <p>Dear {{name}},</p>
    <p>It is with great pleasure that GigSathi Solutions Private Limited extends this formal Letter of Engagement for the position of Independent Field Associate. This document outlines the terms and conditions governing your business association with the Company.</p>

    <h3>1. Commencement & Scope of Engagement</h3>
    <p>Your engagement shall commence from the date of your digital acceptance of this letter. You will operate as an independent contractor. This engagement does not constitute a relationship of employer-employee, agency, or partnership between you and GigSathi. You shall be responsible for defining your work hours, methods, and tactics in onboarding customers for our client projects.</p>

    <h3>2. Client Project Sourcing</h3>
    <p>You shall execute field acquisition and promotional activities for top corporate entities, banks, and fintech providers as listed in the active projects directory of your portal. You are expected to deliver authentic onboarding campaigns with absolute transparency and code compliance.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>3. Deliverables & Payout Commission Matrices</h3>
    <p>Your compensation structure is linked directly to valid acquisitions approved by our client auditors. Commissions will be verified and disbursed on a weekly cycle as follows:</p>
    <ul>
      <li>Payouts are based strictly on the approved acquisitions list from verified fintech audits.</li>
      <li>All applicable taxes (TDS @ 5% under Section 194H of the Income Tax Act) will be deducted at source.</li>
      <li>GigSathi reserves the right to reject payouts or terminate agreements for any onboarding containing false coordinates, duplicates, or fake Aadhaar uploads.</li>
    </ul>

    <h3>4. Training & Compliance Updates</h3>
    <p>The Company will provide digital process training materials and campaign orientation on your portal dashboard. You are required to stay updated with product guidelines and policy revisions issued from time to time. Deficiencies in onboarding quality may result in temporary suspension of specific project campaigns on your dashboard.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>5. Confidentiality & Non-Disclosure Agreement</h3>
    <p>During your association, you will have access to sensitive customer contact data and client databases. You agree to treat all such information as strictly confidential. You shall not download, copy, distribute, or use candidate or customer records for personal gain or share them with third parties. Any breach of confidentiality will result in immediate termination of portal access and forfeiture of all pending commissions, alongside legal proceedings under the IT Act.</p>

    <h3>6. Code of Conduct & Client Representation</h3>
    <p>While promoting client services, you must behave ethically. You shall not collect cash payments from candidates or customers, misrepresent onboarding rewards, or use coercive practices. GigSathi maintains zero tolerance for field misconduct, and any reported infraction will lead to legal action.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>7. Separation & Notice Requirements</h3>
    <p>Either party may terminate this business engagement at any time, with or without cause, by giving 7 days written notice. GigSathi reserves the right to terminate access immediately in case of breach of terms. All disputes are subject to the exclusive jurisdiction of the courts of New Delhi, India.</p>

    <h3>8. Execution & Acceptance of Contract</h3>
    <p>By clicking "Accept & Sign Contract" on your dashboard, you formally agree to all terms stated across this 4-page engagement contract.</p>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between;">
      <div>
        <p>___________________________</p>
        <p><strong>Authorized Signatory</strong></p>
        <p>GigSathi Solutions Pvt. Ltd.</p>
      </div>
      <div style="text-align: right;">
        <p><strong>Accepted Digitally By:</strong></p>
        <p style="color: #2563eb; font-family: cursive; font-size: 1.1rem; padding: 4px; border: 1px dashed #2563eb; display: inline-block;">{{name}}</p>
        <p style="font-size: 0.7rem; color: #64748b; margin-top: 4px;">IP Address Logged | Verified via Mobile OTP</p>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'temp-hr',
    role: 'HR',
    title: 'HR Officer / Manager Offer Letter',
    content: `<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h2 style="text-align: center; color: #de3163; margin-bottom: 20px; font-size: 1.4rem; font-weight: 800; border-bottom: 2px solid #de3163; padding-bottom: 6px;">APPOINTMENT CUM OFFER LETTER</h2>
    <p><strong>Date:</strong> {{date}}</p>
    <p><strong>Employee Name:</strong> {{name}}<br/>
    <strong>Address:</strong> {{address}}</p>

    <p>Dear Mr./Ms. {{name}},</p>
    <p>It is with great pleasure that GigSathi Solutions Private Limited extends this formal Offer of Employment for the position of HR Executive. Your educational qualifications, communication abilities, professional aptitude, and overall suitability have been carefully evaluated during the selection process, and the Management is pleased to offer you this opportunity to become a valuable member of our organization. We believe that every employee contributes significantly to the growth and reputation of the Company, and therefore your appointment carries substantial professional responsibilities together with an expectation of integrity, dedication, discipline, and excellence. This Appointment Letter outlines the principal terms and conditions governing your employment and shall be read together with the Company's internal policies, operational guidelines, code of conduct, and other employment regulations issued from time to time. By accepting this offer and commencing employment, you acknowledge that you have carefully read, understood, and voluntarily accepted all provisions contained herein and agree to comply with them throughout your association with the Company.</p>

    <h3>1. Appointment and Commencement of Employment</h3>
    <p>You are hereby appointed as an HR Executive with GigSathi Solutions Private Limited effective from your date of joining as communicated by the Management. Your employment shall be governed by the terms and conditions mentioned in this Appointment Letter together with all Company policies, operational procedures, administrative circulars, and statutory requirements applicable from time to time. During your employment, you shall faithfully perform all duties entrusted to you and shall devote your complete professional attention, skills, and efforts exclusively towards the business interests of the Company. The Management reserves the right to assign, modify, or expand your responsibilities depending upon operational requirements, organizational growth, or business priorities. Your appointment is based upon the information and documents submitted by you during the recruitment process, and any false declaration, concealment of facts, forged documentation, or material misrepresentation discovered at any stage shall render this appointment liable to immediate cancellation without any prior notice. This employment shall not create any automatic right to permanent service, and continuation of employment shall remain subject to satisfactory performance, business requirements, and compliance with all Company rules.</p>

    <h3>2. Nature of Employment</h3>
    <p>Your appointment is on a full-time basis, and you shall be expected to devote your entire professional time, attention, knowledge, and abilities exclusively to the affairs of GigSathi Solutions Private Limited during working hours. You shall not engage, directly or indirectly, in any other employment, consultancy, freelancing assignment, business activity, partnership, commission-based work, or any occupation that may create a conflict of interest with the Company's business unless prior written approval has been obtained from the Management. The Company reserves the right to assign you to different recruitment campaigns, departments, projects, locations, or operational responsibilities depending upon business requirements without affecting the continuity of your employment.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>3. Probation Period</h3>
    <p>Your employment shall initially remain on probation for a continuous period of Three (3) Months commencing from your official date of joining. The objective of this probationary period is to enable the Company to evaluate your professional competence, recruitment skills, communication ability, attendance, punctuality, discipline, adaptability, work ethics, and overall suitability for continued employment. During this period, your performance shall be reviewed periodically by the Management based upon your contribution towards organizational objectives and adherence to Company policies. Successful completion of three months shall not automatically result in confirmation of employment, and the Company may, at its sole discretion, confirm your services, extend the probation period, or discontinue your employment whenever your performance, conduct, attendance, or commitment is found to be unsatisfactory. You acknowledge that confirmation of employment shall become effective only after receiving a written confirmation issued by the authorized representative of the Company.</p>

    <h3>4. Roles and Responsibilities</h3>
    <p>As an HR Executive, you shall play a vital role in strengthening the Company's workforce by identifying, attracting, evaluating, and coordinating suitable candidates for various positions. Your responsibilities shall include sourcing candidates through different recruitment channels, conducting initial telephonic screenings, scheduling interviews, maintaining regular communication with applicants, collecting and verifying required documents, coordinating with reporting managers, and ensuring the smooth completion of the hiring process. You shall maintain accurate recruitment records, prepare daily and monthly recruitment reports, update candidate databases, and ensure that all information entered into the Company's systems is complete and authentic. You are expected to maintain professional communication with every candidate and represent the Company in a courteous, ethical, and responsible manner.</p>

    <h3>5. Working Hours and Attendance</h3>
    <p>The normal working schedule for this position shall be from 11:00 A.M. to 7:30 P.M., comprising eight working hours together with the applicable break period as determined by the Company. Employees are expected to report for duty punctually and complete their daily responsibilities within the prescribed working hours. Regular attendance and punctuality are considered essential conditions of employment, and every employee is expected to remain available throughout the scheduled working period unless otherwise authorized by the Management. In the event an employee fails to log in or report for work by 11:00 A.M. without obtaining prior approval, the Company reserves the right to treat such attendance as a Half-Day, irrespective of the actual reporting time thereafter. Repeated instances of late reporting or habitual delays shall be viewed as a serious breach of discipline.</p>

    <h3>6. Performance Evaluation and Recruitment Expectations</h3>
    <p>The position of HR Executive is a performance-oriented role in which productivity and recruitment efficiency are important factors for evaluating professional contribution. As part of the performance framework, the Employee shall be expected to facilitate the successful hiring of Forty (40) candidates during each monthly evaluation cycle. For the purpose of salary eligibility, the Employee shall be required to achieve at least Sixty Percent (60%) of the prescribed monthly performance expectation together with satisfactory attendance and compliance with Company policies. Where performance remains below the minimum acceptable benchmark, the Company may determine the monthly remuneration proportionately based upon actual performance, attendance, work quality, and overall contribution.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>7. Compensation and Salary Administration</h3>
    <p>Your monthly consolidated salary for the position of HR Executive shall be ₹9,000/- (Rupees Nine Thousand Only), subject to statutory deductions, if applicable, and the terms contained in this Appointment Letter. Salary shall become due only after the successful completion of each thirty (30) days of continuous service, and the Company shall process the salary within the following seven (7) days through the approved mode of payment. The Employee understands that salary is linked with actual attendance, performance, and fulfillment of assigned responsibilities. In cases involving unauthorized absence, poor performance, misconduct, or failure to meet the minimum performance requirements, the Company reserves the right to determine the payable remuneration in accordance with the applicable employment terms.</p>

    <h3>8. Leave, Holidays and Absenteeism</h3>
    <p>The weekly holiday for employees shall ordinarily be Sunday, unless operational requirements necessitate otherwise. Except where specifically approved by the Management in writing, the Company shall not provide any paid leave or paid holiday during the course of employment. Failure to inform the Company before remaining absent shall be treated as unauthorized absence, and the concerned day shall be considered Leave Without Pay (LWP). If the Employee remains absent from duty for more than three (3) consecutive working days without prior approval, such conduct may be treated as abandonment of employment.</p>

    <h3>9. Professional Conduct and Workplace Discipline</h3>
    <p>The Employee is expected to maintain the highest standards of professionalism, honesty, integrity, courtesy, and discipline throughout the period of employment. Every interaction with candidates, colleagues, clients, vendors, and business associates shall be conducted respectfully and in a manner that enhances the reputation and goodwill of GigSathi Solutions Private Limited. Any act involving insubordination, negligence, misuse of Company resources, falsification of records, misrepresentation of recruitment data, inappropriate behaviour, harassment, abusive language, breach of confidentiality, or conduct prejudicial to the Company's interests shall constitute a violation of employment obligations.</p>

    <h3>10. Confidentiality and Non-Disclosure</h3>
    <p>During the course of your employment, you may have access to confidential information relating to the Company's business operations, recruitment strategies, client details, employee records, candidate databases, and other proprietary information. You shall treat all such information as strictly confidential and shall not disclose, copy, reproduce, publish, transmit, or use such information for any personal benefit or for the benefit of any third party without obtaining prior written authorization from the Company. This obligation shall continue even after the cessation of your employment.</p>

    <h3>11. Company Property and Data Protection</h3>
    <p>All documents, files, databases, official email accounts, recruitment records, candidate information, and any other resources provided by the Company shall remain the exclusive property of GigSathi Solutions Private Limited. Upon resignation, termination, or whenever directed by the Management, the Employee shall immediately return all Company property and permanently delete any official data stored on personal devices.</p>

    <h3>12. Conflict of Interest and Exclusive Employment</h3>
    <p>During the period of employment, the Employee shall not directly or indirectly engage in any other employment, consultancy, recruitment business, freelancing assignment, partnership, commission-based activity, or commercial venture that may conflict with the interests of GigSathi Solutions Private Limited. Any violation of this provision shall constitute serious misconduct and may result in disciplinary action.</p>
  </div>
</div>

<div class="contract-page-sheet">
  <div class="watermark-text">CONFIDENTIAL – PRIVATE & EMPLOYMENT DOCUMENT</div>
  <div class="letterhead-logo">
    <div class="logo-main">GigSathi</div>
    <div class="company-cin">
      <strong>GIGSATHI SOLUTIONS PRIVATE LIMITED</strong><br/>
      Registered Office: Office No. 402, 4th Floor, Vardhman Plaza, Sector 11, Dwarka, New Delhi - 110075<br/>
      CIN: U74999DL2026PTC394850 | Email: support@gigsathi.com | Web: www.gigsathi.com
    </div>
  </div>
  <div class="contract-body">
    <h3>13. Training, Performance Improvement and Professional Development</h3>
    <p>The Company may, at its discretion, provide induction programs, process training, or other learning opportunities to assist the Employee in performing assigned responsibilities efficiently. Where the Management identifies deficiencies in performance, communication, productivity, attendance, or professional conduct, the Employee may be placed under a Performance Improvement Process for a reasonable period to provide an opportunity for improvement. However, participation in any training shall not be construed as a guarantee of continued employment.</p>

    <h3>14. Disciplinary Action and Corrective Measures</h3>
    <p>In situations where an employee fails to maintain acceptable standards of performance, attendance, behaviour, discipline, or compliance, the Company reserves the right to initiate appropriate corrective and disciplinary measures. Such measures may include counselling, warnings, suspension of duties, or termination of employment depending upon the seriousness and frequency of the violation.</p>

    <h3>15. Termination of Employment</h3>
    <p>The Company reserves the right to terminate employment where the Employee demonstrates unsatisfactory performance, repeated failure to meet assigned responsibilities, violation of Company policies, misconduct, breach of confidentiality, unauthorized absence, or any act detrimental to the Company's interests. If the Employee remains absent from work for more than three consecutive working days without prior approval, it will be treated as abandonment.</p>

    <h3>16. Resignation and Notice Requirements</h3>
    <p>In case the Employee wishes to voluntarily discontinue employment, the Employee shall provide written communication to the Management in advance as per the separation procedure. Resignation shall become effective only after acceptance and handover.</p>

    <h3>17. General Terms and Conditions</h3>
    <p>This Appointment Letter represents the complete understanding between the Company and the Employee concerning the terms of employment and supersedes any previous verbal discussions or commitments. The Employee confirms that all personal information and documents submitted during the recruitment process are accurate.</p>

    <h3>18. Governing Law and Jurisdiction</h3>
    <p>This Appointment Letter and the employment relationship shall be governed by and interpreted in accordance with the applicable laws of India. Any dispute arising out of this agreement shall be subject to the exclusive jurisdiction of the competent courts located in New Delhi, India.</p>

    <h3>19. Employee Declaration & Undertaking</h3>
    <p>I hereby confirm that I have carefully read and understood all terms, conditions, and obligations mentioned in this Appointment Letter. I voluntarily accept this offer of employment and agree that my association with the Company shall be governed by the provisions contained herein.</p>

    <h3>20. Acceptance of Appointment</h3>
    <p>I hereby confirm my acceptance of the employment offer extended by GigSathi Solutions Private Limited for the position of HR Executive and agree to join the Company under the terms and conditions mentioned in this Appointment Letter.</p>
    
    <div style="margin-top: 50px; display: flex; justify-content: space-between;">
      <div>
        <p>___________________________</p>
        <p><strong>Authorized Signatory</strong></p>
        <p>GigSathi Solutions Pvt. Ltd.</p>
      </div>
      <div style="text-align: right;">
        <p><strong>Accepted Digitally By:</strong></p>
        <p style="color: #2563eb; font-family: cursive; font-size: 1.1rem; padding: 4px; border: 1px dashed #2563eb; display: inline-block;">{{name}}</p>
        <p style="font-size: 0.7rem; color: #64748b; margin-top: 4px;">IP Address Logged | Verified via Mobile OTP</p>
      </div>
    </div>
  </div>
</div>`
  }
];

const SEED_CMS = {
  home: {
    heroTitle: "Empowering Freelancers, Connecting Opportunities",
    heroSubtitle: "GigSathi is India's leading third-party hiring portal. We partner with India's largest brands in logistics, fintech, and retail to build robust field forces and delivery fleets.",
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

// Helper to push mock data to Firestore on first connect (if empty)
const syncFirestoreSeeds = async () => {
  if (dbMode !== 'FIREBASE') return;
  try {
    const projectsCol = collection(firebaseFirestore, 'projects');
    const projectsSnap = await getDocs(projectsCol);
    if (projectsSnap.empty) {
      console.log('GigSathi: Seeding Firestore projects...');
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
      console.log('GigSathi: Firestore seeded successfully.');
    }
  } catch (e) {
    console.error('GigSathi: Failed to seed Firestore', e);
  }
};
syncFirestoreSeeds();

// -------------------------------------------------------------
// Database Operations API
// -------------------------------------------------------------
export const dbService = {
  getMode: () => dbMode,

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
        
        // Fetch custom data from Firestore
        const userDoc = await getDoc(doc(firebaseFirestore, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data();
        }
        
        // Fallback user shape if firestore record doesn't exist
        return {
          uid,
          email,
          fullName: email.split('@')[0],
          role: 'Candidate',
          verified: true
        };
      } catch (e) {
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

  updateProfile: async (uid, updatedFields) => {
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      const u = { ...users[index], ...updatedFields };
      if (u.aadharNumber && u.pincode && u.city && u.state && u.aadharFront && u.aadharBack && u.resume) {
        u.profileComplete = true;
      }
      users[index] = u;
      localStorage.setItem('gs_users', JSON.stringify(users));

      if (dbMode === 'FIREBASE') {
        try {
          // If profile files are uploaded in base64, you can store directly in Firestore,
          // or in Storage if required. For standard API simplicity, we update Firestore doc.
          await setDoc(doc(firebaseFirestore, 'users', uid), u);
        } catch (e) {
          console.error(e);
        }
      }

      return u;
    }
    throw new Error("User not found.");
  },

  getUsers: async () => {
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'users'));
        const users = [];
        snap.forEach(d => users.push(d.data()));
        if (users.length > 0) return users;
      } catch (e) {
        console.error(e);
      }
    }
    return JSON.parse(localStorage.getItem('gs_users'));
  },

  updateUserRole: async (uid, role) => {
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index].role = role;
      localStorage.setItem('gs_users', JSON.stringify(users));

      if (dbMode === 'FIREBASE') {
        try {
          await updateDoc(doc(firebaseFirestore, 'users', uid), { role });
        } catch (e) {
          console.error(e);
        }
      }

      return users[index];
    }
    throw new Error("User not found.");
  },

  // --- Projects Operations ---
  getProjects: async () => {
    if (dbMode === 'FIREBASE') {
      try {
        const snap = await getDocs(collection(firebaseFirestore, 'projects'));
        const projects = [];
        snap.forEach(d => projects.push(d.data()));
        if (projects.length > 0) return projects;
      } catch (e) {
        console.error(e);
      }
    }
    return JSON.parse(localStorage.getItem('gs_projects')) || [];
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
          // Self-healing check: If HR template contains old footers or lacks new sections, auto-upgrade in Firestore
          const hr = templates.find(t => t.role === 'HR');
          if (hr && hr.content && (hr.content.includes("Page 1 of 4") || !hr.content.includes("Performance Improvement Process"))) {
            console.log('GigSathi: Upgrading Firestore offer templates to footerless 20-section layout...');
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
    // Fallback logic for Local Storage: Upgrade if old HR template
    const local = JSON.parse(localStorage.getItem('gs_templates'));
    const localHR = local ? local.find(t => t.role === 'HR') : null;
    if (localHR && localHR.content && (localHR.content.includes("Page 1 of 4") || !localHR.content.includes("Performance Improvement Process"))) {
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
  }
};
export default dbService;
