/**
 * API Service Layer
 * Connects Frontend to Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // FASTAPI expects 'username' field even for email
    formData.append('password', password);

    return apiCall('/auth/login', {
      method: 'POST',
      body: formData, // passing URLSearchParams sets content-type to x-www-form-urlencoded automatically usually, but we ensured it above
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
  create: (data) => apiCall('/donations/', { // Note trailing slash if router prefix is /donations
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getHistory: () => apiCall('/donations/history'),
  getAnalytics: () => apiCall('/donations/analytics'),
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
  confirmReceipt: (allocationId) => apiCall(`/clinic/allocations/${allocationId}/confirm`, {
    method: 'POST'
  })
};

// ===== Auditor =====
export const auditorAPI = {
  getDonationTrace: (donationId) => apiCall(`/audit/donations/${donationId}`)
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

