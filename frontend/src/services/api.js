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
    email: 'demo@csr.com'
  },
  'demo@ngo.com': {
    role: 'ngo',
    password: 'ngo',
    name: 'Global Health NGO',
    email: 'demo@ngo.com'
  },
  'demo@clinic.com': {
    role: 'clinic',
    password: 'clinic',
    name: 'City Medical Clinic',
    email: 'demo@clinic.com'
  },
  'demo@auditor.com': {
    role: 'auditor',
    password: 'auditor',
    name: 'Government Auditor',
    email: 'demo@auditor.com'
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
    } else {
      // Let browser set Content-Type for FormData (multipart)
      // But for x-www-form-urlencoded, we might need to handle it differently if we pass a URLSearchParams object.
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

// ===== Authentication =====
export const authAPI = {
  // Login expects FormData (username=email, password=password) matching OAuth2PasswordRequestForm
  login: async (email, password) => {
    // DEMO MODE: Check if we should use mock authentication
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Using mock authentication');

      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user exists in mock data
      const mockUser = MOCK_USERS[email.toLowerCase()];

      if (!mockUser) {
        throw new Error('Invalid credentials - User not found in demo database');
      }

      // Validate password
      if (mockUser.password !== password) {
        throw new Error('Invalid credentials - Incorrect password');
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
  register: (data) => apiCall('/companies/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
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
    if (DEMO_MODE) {
      console.log('🔬 DEMO MODE: Returning mock analytics');
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        total_donations: 15,
        total_value: 2500000,
        pending: 3,
        allocated: 7,
        completed: 5
      };
    }

    return apiCall('/donations/analytics');
  },
};

// ===== NGO =====
export const ngoAPI = {
  register: (data) => apiCall('/ngo/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  // Check if these endpoints exist in backend, if not, they might fail.
  getPendingDonations: () => apiCall('/ngo/donations/pending'), // Need to confirm endpoint
  acceptDonation: (id) => apiCall(`/ngo/donations/${id}/accept`, { method: 'POST' }),
  registerClinic: (data) => apiCall('/ngo/clinics', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  addClinicRequirement: (clinicId, data) => apiCall(`/ngo/clinics/${clinicId}/requirements`, {
    method: 'POST',
    body: JSON.stringify(data) // item_name, quantity, notes
  })
};

// ===== Clinic =====
export const clinicAPI = {
  // Assuming endpoints based on contract
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
  confirmReceipt: (allocationId) => apiCall(`/clinic/allocations/${allocationId}/confirm`, {
    method: 'POST'
  })
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
          {
            event: 'DONATION_CREATED',
            timestamp: '2024-01-15T10:30:00Z',
            actor: 'TechCorp Industries',
            details: 'Donation of ₹500,000 created',
            blockchain_hash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385'
          },
          {
            event: 'NGO_ACCEPTED',
            timestamp: '2024-01-16T14:20:00Z',
            actor: 'Global Health NGO',
            details: 'Donation accepted by NGO',
            blockchain_hash: '0x8a1bfde2d1e68b8bg77bc5fbe8afde2d1e68b8bg77bc5fbe8d3d3fc8c22b02496'
          },
          {
            event: 'ALLOCATION_CREATED',
            timestamp: '2024-01-18T09:15:00Z',
            actor: 'Global Health NGO',
            details: 'Allocated to City Medical Clinic',
            blockchain_hash: '0x9b2cgef3e2f79c9ch88cd6gcf9bgef3e2f79c9ch88cd6gcf9e4e4gd9d33c13507'
          }
        ]
      };
    }

    return apiCall(`/audit/donations/${donationId}`);
  }
  // This endpoint might be missing in backend, need to ensure it exists or add it.
};


export default {
  authAPI,
  companyAPI,
  donationAPI,
  ngoAPI,
  clinicAPI,
  auditorAPI,
};

