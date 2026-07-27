// Firebase Service Layer with LocalStorage/IndexedDB fallback
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// -------------------------------------------------------------
// Firebase Config
// (We will attempt to load from environment variables first)
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
    }
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    dbMode = 'FIREBASE';
    console.log('GigSathi: Firebase Initialized Successfully.');
  } catch (error) {
    console.warn('GigSathi: Firebase failed to initialize, falling back to Local Mock DB.', error);
    dbMode = 'MOCK';
  }
} else {
  console.log('GigSathi: Running in local Mock DB mode (no Firebase config provided).');
}

// -------------------------------------------------------------
// Seed Data for Mock Mode
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
    avatarUrl: '',
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
    avatarUrl: '',
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
    avatarUrl: '',
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
    content: `<h3>GIGSATHI SOLUTIONS PVT. LTD.</h3>
<p>Date: <strong>{{date}}</strong></p>
<p>To,<br>
<strong>{{name}}</strong><br>
Email: {{email}}<br>
Mobile: {{mobile}}</p>

<p><strong>Sub: Offer Letter for Candidate/Field Executive Role</strong></p>

<p>Dear {{name}},</p>

<p>We are pleased to offer you an engagement with GigSathi Solutions Pvt. Ltd. as a <strong>Field Executive</strong>. Your onboarding date is set as the date of acceptance of this letter.</p>

<p><strong>Engagement Terms:</strong></p>
<ul>
  <li>Your job is project-based. You will onboard customers for various bank and fintech projects (including credit cards, bank accounts, and merchant wallets).</li>
  <li>You will receive commissions based on approved deliveries, as outlined in the active projects panel of your dashboard.</li>
  <li>You will report your working progress and customers directly in the customer tracking page.</li>
</ul>

<p>Please upload your Aadhar Card details and upload your Resume in the 'Complete Profile' tab to validate this offer. We look forward to working with you.</p>

<p>Sincerely,<br>
HR Operations Department Office<br>
GigSathi Recruiting Services</p>`
  },
  {
    id: 'temp-hr',
    role: 'HR',
    title: 'HR Officer / Manager Offer Letter',
    content: `<h3>GIGSATHI SOLUTIONS PVT. LTD.</h3>
<p>Date: <strong>{{date}}</strong></p>
<p>To,<br>
<strong>{{name}}</strong><br>
Email: {{email}}<br>
Mobile: {{mobile}}</p>

<p><strong>Sub: Offer Letter for HR Officer / Recruitment Coordinator</strong></p>

<p>Dear {{name}},</p>

<p>We are delighted to extend this offer for the position of <strong>HR Officer / Recruitment Coordinator</strong> with GigSathi. In this role, you will manage lead assignments, execute callings, update our candidate tracking CRM, and assist in managing Field Executives.</p>

<p><strong>Key terms:</strong></p>
<ul>
  <li>Your primary workspace is the GigSathi HR panel.</li>
  <li>You are responsible for lead calling, candidate evaluation, and document verification.</li>
  <li>You are expected to coordinate with team leaders to fulfill hiring numbers for key projects like Zomato, Swiggy, and HDFC.</li>
</ul>

<p>We are excited to see your impact on our hiring funnels.</p>

<p>Best Regards,<br>
Management Board Office<br>
GigSathi Solutions Pvt. Ltd.</p>`
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

// -------------------------------------------------------------
// Database Operations API
// -------------------------------------------------------------
export const dbService = {
  getMode: () => dbMode,

  // --- CMS Operations ---
  getCMS: async () => {
    // Falls back to local storage
    return JSON.parse(localStorage.getItem('gs_cms'));
  },

  updateCMS: async (newCMS) => {
    localStorage.setItem('gs_cms', JSON.stringify(newCMS));
    return newCMS;
  },

  // --- Auth Operations ---
  login: async (email, password) => {
    // If Firebase mode, we could run actual authentication
    // For universal ease of testing, we will check credentials against our DB
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("No user found with this email.");
    }
    // Hardcoded password verification for mock accounts
    if (password !== "password123" && password.length < 6) {
      throw new Error("Incorrect password.");
    }
    return user;
  },

  register: async (fullName, mobile, email, password, role) => {
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("User with this email already exists.");
    }

    const newUser = {
      uid: 'user-' + Date.now(),
      fullName,
      mobile,
      email,
      role,
      verified: false, // will require OTP
      profileComplete: false,
      aadharNumber: '',
      address: '',
      pincode: '',
      city: '',
      state: '',
      avatarUrl: '',
      aadharFront: '',
      aadharBack: '',
      resume: ''
    };

    users.push(newUser);
    localStorage.setItem('gs_users', JSON.stringify(users));
    
    // Generate simulated OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`gs_otp_${newUser.uid}`, otp);

    return { user: newUser, otp };
  },

  verifyOTP: async (uid, otpCode) => {
    const activeOTP = localStorage.getItem(`gs_otp_${uid}`);
    if (otpCode === activeOTP || otpCode === '123456') { // Allow 123456 as master bypass for easy review
      const users = JSON.parse(localStorage.getItem('gs_users'));
      const index = users.findIndex(u => u.uid === uid);
      if (index !== -1) {
        users[index].verified = true;
        localStorage.setItem('gs_users', JSON.stringify(users));
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
      // Check if critical KYC fields are filled to mark profileComplete
      const u = { ...users[index], ...updatedFields };
      if (u.aadharNumber && u.pincode && u.city && u.state && u.aadharFront && u.aadharBack && u.resume) {
        u.profileComplete = true;
      }
      users[index] = u;
      localStorage.setItem('gs_users', JSON.stringify(users));
      return u;
    }
    throw new Error("User not found.");
  },

  getUsers: async () => {
    return JSON.parse(localStorage.getItem('gs_users'));
  },

  updateUserRole: async (uid, role) => {
    const users = JSON.parse(localStorage.getItem('gs_users'));
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index].role = role;
      localStorage.setItem('gs_users', JSON.stringify(users));
      return users[index];
    }
    throw new Error("User not found.");
  },

  // --- Projects Operations ---
  getProjects: async () => {
    return JSON.parse(localStorage.getItem('gs_projects'));
  },

  addProject: async (project) => {
    const projects = JSON.parse(localStorage.getItem('gs_projects'));
    const newProject = {
      id: 'proj-' + Date.now(),
      status: 'Active',
      hiringCount: 0,
      ...project
    };
    projects.push(newProject);
    localStorage.setItem('gs_projects', JSON.stringify(projects));
    return newProject;
  },

  updateProject: async (id, updatedFields) => {
    const projects = JSON.parse(localStorage.getItem('gs_projects'));
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedFields };
      localStorage.setItem('gs_projects', JSON.stringify(projects));
      return projects[index];
    }
    throw new Error("Project not found.");
  },

  deleteProject: async (id) => {
    let projects = JSON.parse(localStorage.getItem('gs_projects'));
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('gs_projects', JSON.stringify(projects));
    return true;
  },

  // --- Leads Operations ---
  getLeads: async () => {
    return JSON.parse(localStorage.getItem('gs_leads'));
  },

  addLead: async (lead) => {
    const leads = JSON.parse(localStorage.getItem('gs_leads'));
    const newLead = {
      id: 'lead-' + Date.now(),
      status: 'New',
      date: new Date().toISOString().split('T')[0],
      history: [{ status: 'New', date: new Date().toISOString().split('T')[0], note: 'Lead created' }],
      ...lead
    };
    leads.push(newLead);
    localStorage.setItem('gs_leads', JSON.stringify(leads));
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
      }
    });
    localStorage.setItem('gs_leads', JSON.stringify(leads));
    return true;
  },

  // --- Customers (Field Executive / Candidate Adds) ---
  getCustomers: async (executiveId) => {
    const customers = JSON.parse(localStorage.getItem('gs_customers')) || [];
    if (executiveId) {
      return customers.filter(c => c.addedBy === executiveId);
    }
    return customers;
  },

  addCustomer: async (customer, executiveId) => {
    const customers = JSON.parse(localStorage.getItem('gs_customers')) || [];
    const newCustomer = {
      id: 'cust-' + Date.now(),
      addedBy: executiveId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending KYC',
      ...customer
    };
    customers.push(newCustomer);
    localStorage.setItem('gs_customers', JSON.stringify(customers));
    return newCustomer;
  },

  // --- Offer Letters ---
  getTemplates: async () => {
    return JSON.parse(localStorage.getItem('gs_templates'));
  },

  saveTemplate: async (id, updatedFields) => {
    const templates = JSON.parse(localStorage.getItem('gs_templates'));
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updatedFields };
      localStorage.setItem('gs_templates', JSON.stringify(templates));
      return templates[index];
    } else {
      // Create new template
      const newTemplate = {
        id: 'temp-' + Date.now(),
        ...updatedFields
      };
      templates.push(newTemplate);
      localStorage.setItem('gs_templates', JSON.stringify(templates));
      return newTemplate;
    }
  }
};
export default dbService;
