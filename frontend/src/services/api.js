/**
 * API Service Layer
 * Connects Frontend to Backend
 * 
 * DEMO MODE: When backend is unavailable, uses mock data for demonstration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'; // Default to true for hackathon demo

/**
 * Mock Authentication Data for Demo Mode
 * Simulates backend responses for all roles
 */
const MOCK_USERS = {
  'demo@csr.com': {
    role: 'csr',
    password: 'csr',
    name: 'TechCorp Industries',
    email: 'demo@csr.com',
    approval_status: 'APPROVED' // Existing users approved by default
  },
  'demo@ngo.com': {
    role: 'ngo',
    password: 'ngo',
    name: 'Global Health NGO',
    email: 'demo@ngo.com',
    approval_status: 'APPROVED'
  },
  'demo@clinic.com': {
    role: 'clinic',
    password: 'clinic',
    name: 'City Medical Clinic',
    email: 'demo@clinic.com',
    approval_status: 'APPROVED'
  },
  'demo@auditor.com': {
    role: 'auditor',
    password: 'auditor',
    name: 'Government Auditor',
    email: 'demo@auditor.com',
    approval_status: 'APPROVED' // Auditors serve as admins, usually pre-approved
  }
};

/**
 * Generate a mock JWT token for demo purposes
 */
const generateMockToken = (email, role) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: email,
    role: role,
    scopes: [role],
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('mock-signature-for-demo');
  return `${header}.${payload}.${signature}`;
};

/**
 * Fetch wrapper with error handling and Authorization header
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      ...options.headers,
    };

    // Attach JWT if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Set JSON content type unless it's FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Handle x-www-form-urlencoded manually if passed as URLSearchParams
    if (options.body instanceof URLSearchParams) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/auth/select';
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// ===== MOCK DATABASE (LocalStorage) =====
const getMockStore = () => {
  const defaultStore = {
    products: [
      {
        id: 'PROD-001',
        product_name: 'Digital Thermometers',
        category: 'Diagnostic Equipment',
        quantity_available: 200,
        unit: 'units',
        expiry_date: '',
        availability_end: '2025-12-31',
        donor_visible: false
      },
      {
        id: 'PROD-002',
        product_name: 'N95 Respirator Masks',
        category: 'PPE',
        quantity_available: 500,
        unit: 'boxes',
        expiry_date: '2026-12-31',
        availability_end: '2025-06-30',
        donor_visible: false
      },
      {
        id: 'PROD-003',
        product_name: 'Surgical Gloves (Sterile)',
        category: 'Surgical Supplies',
        quantity_available: 1000,
        unit: 'boxes',
        expiry_date: '2027-03-15',
        availability_end: '2025-08-31',
        donor_visible: false
      }
    ],
    requests: [
      {
        id: 'REQ-INIT-001',
        clinic_name: 'City Medical Clinic',
        clinic_id: 'CLINIC-DEMO-01',
        product_name: 'N95 Respirator Masks',
        product_id: 'PROD-002',
        category: 'PPE',
        requested_quantity: 50,
        available_quantity: 500,
        unit: 'boxes',
        urgency_level: 'HIGH',
        justification: 'Urgent need for ICU staff.',
        supporting_evidence: 'icu_report_jan.pdf',
        status: 'PENDING_REVIEW',
        created_at: new Date().toISOString()
      }
    ],
    // New: Store Pending Registrations for Demo Mode persistence
    pending_registrations: [
      {
        email: 'admin@megacorp.com',
        name: 'MegaCorp Industries',
        role: 'csr',
        id_number: 'CIN-99887766',
        approval_status: 'PENDING',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        password: 'password123'
      },
      {
        email: 'contact@helpinghands.org',
        name: 'Helping Hands Foundation',
        role: 'ngo',
        id_number: 'NGO-REG-112233',
        approval_status: 'PENDING',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        password: 'password123'
      },
      {
        email: 'csr@futuretech.com',
        name: 'FutureTech Solutions',
        role: 'csr',
        id_number: 'CIN-55443322',
        approval_status: 'PENDING',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        password: 'password123'
      },
      {
        email: 'info@globalcare.org',
        name: 'Global Care Initiative',
        role: 'ngo',
        id_number: 'NGO-REG-998877',
        approval_status: 'PENDING',
        created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        password: 'password123'
      },
      {
        email: 'director@innovatehealth.com',
        name: 'Innovate Health Systems',
        role: 'csr',
        id_number: 'CIN-11223344',
        approval_status: 'PENDING',
        created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        password: 'password123'
      }
    ]
  };

  // Versioned DB key to force update with new dummy data
  const stored = localStorage.getItem('medfusion_mock_db_v2');
  return stored ? JSON.parse(stored) : defaultStore;
};

const updateMockStore = (data) => {
  localStorage.setItem('medfusion_mock_db_v2', JSON.stringify(data));
};

// ===== Authentication =====
export const authAPI = {
  // Login expects FormData (username=email, password=password) matching OAuth2PasswordRequestForm
  login: async (email, password) => {
    // DEMO MODE: Check if we should use mock authentication
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Using mock authentication');

      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));

      // 1. Check Hardcoded Mock Users
      let mockUser = MOCK_USERS[email.toLowerCase()];

      // 2. Check "Pending Registrations" (simulating DB lookups for new invites/registers)
      if (!mockUser) {
        const db = getMockStore();
        const pendingUser = db.pending_registrations.find(u => u.email === email && u.password === password);
        if (pendingUser) {
          // Found in pending list
          if (pendingUser.approval_status === 'PENDING') {
            throw new Error('Account waiting for Auditor Approval.');
          }
          if (pendingUser.approval_status === 'REJECTED') {
            throw new Error('Account application was rejected.');
          }
          // If Approved
          mockUser = pendingUser;
        }
      }

      if (!mockUser) {
        throw new Error('Invalid credentials - User not found');
      }

      // Check Password (skip if it was pendingUser, already checked)
      if (mockUser.password !== password) {
        throw new Error('Invalid credentials - Incorrect password');
      }

      // Check Approval Status (Double Check)
      if (['csr', 'ngo'].includes(mockUser.role) && mockUser.approval_status === 'PENDING') {
        throw new Error('Account waiting for Auditor Approval.');
      }
      if (mockUser.approval_status === 'REJECTED') {
        throw new Error('Account application was rejected.');
      }

      // Generate mock token
      const access_token = generateMockToken(mockUser.email, mockUser.role);

      console.log('✅ Mock login successful:', { email, role: mockUser.role });

      return {
        access_token,
        token_type: 'bearer',
        role: mockUser.role,
        user: mockUser
      };
    }

    // REAL MODE: Call actual backend
    const formData = new URLSearchParams();
    formData.append('username', email); // FASTAPI expects 'username' field even for email
    formData.append('password', password);

    return apiCall('/auth/login', {
      method: 'POST',
      body: formData,
    });
  },
  setPassword: (email, password) => {
    // For Demo Mode Registration flow:
    if (DEMO_MODE) {
      // We'll update the password in the pending_registrations list
      // This simulates set password
      const db = getMockStore();
      const userIndex = db.pending_registrations.findIndex(u => u.email === email);
      if (userIndex !== -1) {
        db.pending_registrations[userIndex].password = password;
        updateMockStore(db);
        return Promise.resolve({ message: "Password set" });
      }
    }

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    return apiCall(`/auth/set-password?${params.toString()}`, {
      method: 'POST'
    });
  }
};

// ===== Company / CSR =====
export const companyAPI = {
  register: async (data) => {
    // Demo Mode Registration
    if (DEMO_MODE) {
      const db = getMockStore();
      // Add to pending registrations
      db.pending_registrations.push({
        email: data.official_email,
        name: data.company_name,
        role: 'csr',
        id_number: data.cin,
        approval_status: 'PENDING', // Default to Pending
        created_at: new Date().toISOString()
      });
      updateMockStore(db);
      return Promise.resolve({ message: "Registration Submitted" });
    }

    return apiCall('/companies/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// ===== Donations (CSR) =====
export const donationAPI = {
  create: async (data) => {
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Creating mock donation');
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        id: `DON-${Date.now()}`,
        ...data,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        blockchain_hash: `0x${Math.random().toString(16).substring(2, 66)}`
      };
    }

    return apiCall('/donations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getHistory: async () => {
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Returning mock donation history');
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: 'DON-2024-001',
          item_name: 'Medical Masks (boxes)',
          quantity: 5000,
          purpose: 'COVID-19 Relief',
          status: 'ALLOCATED',
          created_at: '2024-01-15T10:30:00Z',
          ngo_name: 'Red Cross India'
        },
        {
          id: 'DON-2024-002',
          item_name: 'PPE Kits (pieces)',
          quantity: 1000,
          purpose: 'Healthcare Support',
          status: 'COMPLETED',
          created_at: '2024-01-10T14:20:00Z',
          ngo_name: 'WHO Partners'
        },
        {
          id: 'DON-2024-003',
          item_name: 'Surgical Gloves (boxes)',
          quantity: 10000,
          purpose: 'Hospital Supply',
          status: 'PENDING',
          created_at: '2024-01-20T09:15:00Z',
          ngo_name: 'MSF India'
        }
      ];
    }
    return apiCall('/donations/history');
  },
  getAnalytics: async () => {
    if (DEMO_MODE) return { total_donations: 15, total_value: 2500000, pending: 3, allocated: 7, completed: 5 };
    return apiCall('/donations/analytics');
  },
};

// ===== NGO =====
export const ngoAPI = {
  register: async (data) => {
    if (DEMO_MODE) {
      const db = getMockStore();
      db.pending_registrations.push({
        email: data.official_email,
        name: data.ngo_name,
        role: 'ngo',
        id_number: data.csr_1_number,
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      });
      updateMockStore(db);
      return Promise.resolve({ message: "Registration Submitted" });
    }
    return apiCall('/ngo/register', { method: 'POST', body: JSON.stringify(data) });
  },

  getClinicRequests: async () => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const db = getMockStore();
      return db.requests;
    }
    return apiCall('/ngo/requests');
  },

  processRequest: async (requestId, decision, notes, approvedQuantity) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const db = getMockStore();
      const reqIndex = db.requests.findIndex(r => r.id === requestId);
      if (reqIndex !== -1) {
        const request = db.requests[reqIndex];
        request.status = decision === 'reject' ? 'REJECTED' : 'APPROVED';
        request.validation_notes = notes;
        request.approved_quantity = approvedQuantity || request.requested_quantity;
        request.validated_at = new Date().toISOString();
        if (request.status === 'APPROVED') {
          const prodIndex = db.products.findIndex(p => p.id === request.product_id);
          if (prodIndex !== -1) db.products[prodIndex].quantity_available -= request.approved_quantity;
        }
        updateMockStore(db);
        return request;
      }
      throw new Error('Request not found');
    }
    return apiCall(`/ngo/requests/${requestId}/process`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes, approved_quantity: approvedQuantity })
    });
  },

  registerClinic: (data) => apiCall('/ngo/clinics', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

// ===== Clinic =====
export const clinicAPI = {
  getProducts: async () => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const db = getMockStore();
      return db.products;
    }
    return apiCall('/clinic/products');
  },
  submitRequirement: async (requestData) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const db = getMockStore();
      const newRequest = {
        id: `REQ-${Date.now()}`,
        clinic_name: 'City Medical Clinic',
        clinic_id: 'CLINIC-DEMO-01',
        status: 'PENDING_REVIEW',
        created_at: new Date().toISOString(),
        ...requestData
      };
      db.requests.unshift(newRequest);
      updateMockStore(db);
      return newRequest;
    }
    const formData = new FormData();
    Object.keys(requestData).forEach(key => formData.append(key, requestData[key]));
    return apiCall('/clinic/requests', { method: 'POST', body: formData });
  },
  getMyRequests: async () => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const db = getMockStore();
      return db.requests.filter(r => r.clinic_id === 'CLINIC-DEMO-01');
    }
    return apiCall('/clinic/my-requests');
  },
  getReceipts: async () => {
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Returning mock clinic receipts');
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          allocation_id: 'ALC-001',
          donation_id: 'DON-2024-001',
          ngo_name: 'Global Health NGO',
          item_name: 'Medical Masks',
          quantity: 5000,
          status: 'IN_TRANSIT',
          allocated_date: '2024-01-25'
        },
        {
          allocation_id: 'ALC-002',
          donation_id: 'DON-2024-003',
          ngo_name: 'Care Foundation',
          item_name: 'Surgical Gloves',
          quantity: 10000,
          status: 'RECEIVED',
          allocated_date: '2024-01-20'
        },
        {
          allocation_id: 'ALC-003',
          donation_id: 'DON-2024-005',
          ngo_name: 'Health Alliance',
          item_name: 'First Aid Kits',
          quantity: 500,
          status: 'PENDING',
          allocated_date: '2024-01-28'
        }
      ];
    }
    return apiCall('/clinic/receipts');
  },
  confirmReceipt: (allocationId) => apiCall(`/clinic/allocations/${allocationId}/confirm`, { method: 'POST' })
};

// ===== Auditor =====
export const auditorAPI = {
  getDonationTrace: async (donationId) => {
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Returning mock audit trail for', donationId);
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        donation_id: donationId || 'DON-2024-001',
        donor: 'TechCorp Industries',
        amount: 500000,
        created_at: '2024-01-15T10:30:00Z',
        trail: [
          { event: 'DONATION_CREATED', timestamp: '2024-01-15T10:30:00Z', actor: 'TechCorp Industries', details: 'Donation of ₹500,000 created', blockchain_hash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385' },
          { event: 'NGO_ACCEPTED', timestamp: '2024-01-16T14:20:00Z', actor: 'Global Health NGO', details: 'Donation accepted by NGO', blockchain_hash: '0x8a1bfde2d1e68b8bg77bc5fbe8afde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496' },
          { event: 'ALLOCATION_CREATED', timestamp: '2024-01-18T09:15:00Z', actor: 'Global Health NGO', details: 'Allocated to City Medical Clinic', blockchain_hash: '0x9b2cgef3e2f79c9ch88cd6gcf9bgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507' }
        ]
      };
    }
    return apiCall(`/audit/donations/${donationId}`);
  },

  // NEW: Approval Workflow APIs
  getPendingRegistrations: async () => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const db = getMockStore();
      // Filter only Pending items
      return db.pending_registrations.filter(r => r.approval_status === 'PENDING');
    }
    return apiCall('/audit/approvals/pending');
  },

  processRegistration: async (email, decision) => {
    // decision: 'approve' | 'reject'
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const db = getMockStore();
      const userIndex = db.pending_registrations.findIndex(u => u.email === email);

      if (userIndex !== -1) {
        db.pending_registrations[userIndex].approval_status = (decision === 'approve' ? 'APPROVED' : 'REJECTED');
        updateMockStore(db);
        return db.pending_registrations[userIndex];
      }
      throw new Error('Registrant not found');
    }
    return apiCall('/audit/approvals/process', {
      method: 'POST',
      body: JSON.stringify({ email, decision })
    });
  }
};


export default {
  authAPI,
  companyAPI,
  donationAPI,
  ngoAPI,
  clinicAPI,
  auditorAPI,
};
