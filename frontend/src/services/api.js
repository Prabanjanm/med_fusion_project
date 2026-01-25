/**
 * API Service Layer
 * Centralized API calls for the application
 * Replace with actual backend endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch wrapper with error handling
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// ===== Authentication Endpoints =====
export const authAPI = {
  login: (username, role) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, role }),
  }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

// ===== Donation Endpoints (CSR) =====
export const donationAPI = {
  getAll: () => apiCall('/donations'),
  getById: (id) => apiCall(`/donations/${id}`),
  create: (data) => apiCall('/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getHistory: () => apiCall('/donations/history'),
};

// ===== NGO Endpoints =====
export const ngoAPI = {
  getAll: () => apiCall('/ngos'),
  getById: (id) => apiCall(`/ngos/${id}`),
  allocateDonation: (data) => apiCall('/ngos/allocate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAllocations: () => apiCall('/ngos/allocations'),
  confirmAllocation: (allocationId, data) => apiCall(`/ngos/allocations/${allocationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ===== Clinic Endpoints =====
export const clinicAPI = {
  getAll: () => apiCall('/clinics'),
  getById: (id) => apiCall(`/clinics/${id}`),
  getReceipts: () => apiCall('/clinics/receipts'),
  confirmReceipt: (data) => apiCall('/clinics/confirm-receipt', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ===== Auditor Endpoints =====
export const auditorAPI = {
  getAuditTrail: () => apiCall('/audit/trail'),
  getDonationDetails: (donationId) => apiCall(`/audit/donations/${donationId}`),
  getComplianceReport: () => apiCall('/audit/compliance'),
  getBlockchainData: (txHash) => apiCall(`/audit/blockchain/${txHash}`),
};

// ===== Mock Data Functions (for development) =====
export const getMockDonations = () => [
  {
    id: 'DON001',
    donor: 'Tech Corp Inc',
    amount: 50000,
    items: 'PPE Kits',
    clinic: 'City Hospital',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: 'DON002',
    donor: 'Healthcare Plus',
    amount: 75000,
    items: 'Medical Gloves',
    clinic: 'General Hospital',
    date: '2024-01-18',
    status: 'processing',
  },
];

export const getMockAuditTrail = () => [
  {
    id: 'AUDIT001',
    donationId: 'DON001',
    action: 'Donation Created',
    timestamp: '2024-01-15 10:30',
    user: 'John Donor',
  },
  {
    id: 'AUDIT002',
    donationId: 'DON001',
    action: 'Allocated to NGO',
    timestamp: '2024-01-16 14:45',
    user: 'NGO Admin',
  },
];

export default {
  authAPI,
  donationAPI,
  ngoAPI,
  clinicAPI,
  auditorAPI,
};
