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
    return JSON.parse(localStorage.getItem('gs_cms'));
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
    return JSON.parse(localStorage.getItem('gs_projects'));
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
    return JSON.parse(localStorage.getItem('gs_leads'));
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
        if (templates.length > 0) return templates;
      } catch (e) {
        console.error(e);
      }
    }
    return JSON.parse(localStorage.getItem('gs_templates'));
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
