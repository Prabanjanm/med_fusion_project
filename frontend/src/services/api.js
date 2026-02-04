/**
 * API Service Layer
 * Fully aligned with Backend Routers & Schemas
 *
 * DEMO_MODE=false (Strict Backend Integration)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = { ...options.headers };

    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/auth/select';
      }
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Call Error to ${endpoint}:`, error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(`Connection to Backend Failed. Please ensure the backend server is running on http://127.0.0.1:8000. (Tech detail: ${error.message})`);
    }
    throw error;
  }
};

// ===== AUTH =====
export const authAPI = {
  login: (email, password) => {
    // Backend uses OAuth2PasswordRequestForm (username, password)
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return apiCall('/auth/login', { method: 'POST', body: formData });
  },
  // Backend expects Query Params for set-password
  setPassword: (email, password) => apiCall(`/auth/set-password?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
    method: 'POST'
  }),
  // Backend expects JSON body with token for clinic password
  setClinicPassword: (token, password) => apiCall('/auth/clinic/set-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  })
};

// ===== CSR (COMPANY) =====
export const companyAPI = {
  // Schema: company_name, cin, pan, official_email
  register: (data) => apiCall('/companies/register', { method: 'POST', body: JSON.stringify(data) })
};

export const donationAPI = {
  // Schema: item_name, quantity, purpose, board_resolution_ref, csr_policy_declared
  create: (data) => apiCall('/donations', {
    method: 'POST',
    body: JSON.stringify({
      item_name: data.item_name,
      quantity: parseInt(data.quantity),
      purpose: data.purpose,
      board_resolution_ref: data.board_resolution_ref || 'N/A',
      csr_policy_declared: true,
      expiry_date: data.expiry_date || null
    })
  }),
  getAll: () => apiCall('/donations/history'), // Router: /donations/history
  getHistory: () => apiCall('/donations/history'), // Alias for consistency
  getAnalytics: () => apiCall('/donations/analytics')
};

// ===== NGO =====
export const ngoAPI = {
  // Schema: ngo_name, csr_1_number, has_80g, official_email
  register: (data) => apiCall('/ngo/register', { method: 'POST', body: JSON.stringify(data) }),

  // 1. View Available Donations (CSR List)
  getAvailableDonations: () => apiCall('/ngo/donations/available'),

  // 2. Accept Donation (Request from CSR)
  acceptDonation: (donationId) => apiCall(`/ngo/donations/${donationId}/accept`, { method: 'POST' }),

  // 3. View Clinic Requirements (Requests)
  // Router: GET /ngo/dashboard/data returns { clinic_requirements: [] }
  getDashboardData: () => apiCall('/ngo/dashboard/data'),

  // 4. Register Clinic (Onboarding)
  getClinics: () => apiCall('/ngo/clinics'),

  registerClinic: (data) => apiCall('/ngo/clinics', { method: 'POST', body: JSON.stringify(data) }),

  // 5. Create Clinic Need (If NGO creates it)
  createClinicNeed: (data) => apiCall('/ngo/clinic-needs', { method: 'POST', body: JSON.stringify(data) }),

  // 6. Allocate Donation to Clinic Requirement
  // Payload: AllocationCreate { donation_id, clinic_requirement_id }
  allocate: (donationId, requirementId) => apiCall('/ngo/donations/allocate', {
    method: 'POST',
    body: JSON.stringify({
      donation_id: donationId,
      clinic_requirement_id: requirementId
    })
  }),
  getAllocationHistory: () => apiCall('/ngo/allocations/history')
};

// ===== CLINIC =====
export const clinicAPI = {
  // 1. View Pending Allocations
  getPendingAllocations: () => apiCall('/clinic/allocations/pending'),

  // 2. Confirm Receipt
  confirmReceipt: (allocationId, data) => apiCall(`/clinic/allocations/${allocationId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 3. History
  getHistory: () => apiCall('/clinic/allocations'),

  // 4. My Requests
  getRequests: () => apiCall('/clinic/requests'),

  // 5. Submit Requirement
  createRequirement: (data) => apiCall('/clinic/requirements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Removed: register, submitRequirement, getProducts
  // Reason: These endpoints do not exist in backend. Clinic onboarding is via NGO.
};

// ===== AUDITOR (Mapped to ADMIN Backend Routes) =====
export const auditorAPI = {
  // Backend: GET /admin/donations (Returns list of logs)
  getDonationLogs: () => apiCall('/admin/donations'),

  // Backend: GET /admin/companies/requests
  getPendingCompanies: () => apiCall('/admin/companies/requests'),

  // Backend: GET /admin/ngos/requests
  getPendingNGOs: () => apiCall('/admin/ngos/requests'),

  // Backend: POST /admin/company/{id}/review
  reviewCompany: (id, approve, remarks) => apiCall(`/admin/company/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ approve, remarks })
  }),

  // Backend: POST /admin/ngo/{id}/review
  reviewNGO: (id, approve, remarks) => apiCall(`/admin/ngo/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ approve, remarks })
  }),

  // Backend: GET /admin/companies/verified
  getVerifiedCompanies: () => apiCall('/admin/companies/verified'),

  // Backend: GET /admin/ngos/verified
  getVerifiedNGOs: () => apiCall('/admin/ngos/verified'),

  // Removed: verifyDonation, verifyAllocation, register, getPendingRegistrations, processRegistration
  // Reason: Backend uses specific Admin Review endpoints and auto-logging.
};

export default {
  authAPI,
  companyAPI,
  donationAPI,
  ngoAPI,
  clinicAPI,
  auditorAPI
};
