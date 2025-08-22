import axios from 'axios'

// Environment variable handling for Vite (no process.env in browser)
const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000/api'  // Use local development server

// Debug log to see what URL is being used
console.log('🔗 API Base URL:', API_BASE_URL)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Render cold starts
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making request to: ${config.baseURL}${config.url}`)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Handle auth errors and response logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Attempting login...')
    return api.post('/auth/login', credentials)
  },
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
}

// Notifications API
export const notificationsAPI = {
  // Get all notifications
  getAll: (params = {}) => api.get('/notifications', { params }),
  
  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Generate sample notifications (for testing)
  generateSample: () => api.post('/notifications/generate-sample'),
  
  // Generate notifications from activities
  generateFromActivities: () => api.post('/notifications/generate-from-activities'),
}

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/dashboard/stats'),
  
  // Get recent activities
  getRecentActivities: (limit = 10) => api.get('/dashboard/recent-activities', { 
    params: { limit } 
  }),
  
  // Get today's appointments
  getTodaysAppointments: () => api.get('/dashboard/todays-appointments'),
  
  // Get summary metrics
  getSummary: () => api.get('/dashboard/summary'),
}

// Patients API
export const patientsAPI = {
  // Get all patients with optional filters
  getAll: (params = {}) => api.get('/patients', { params }),
  
  // Get single patient
  getById: (id) => api.get(`/patients/${id}`),
  
  // Create new patient
  create: (data) => api.post('/patients', data),
  
  // Update patient
  update: (id, data) => api.put(`/patients/${id}`, data),
  
  // Delete patient
  delete: (id) => api.delete(`/patients/${id}`),
}

// Doctors API
export const doctorsAPI = {
  getAll: (params = {}) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
}

// Appointments API
export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getTodaysAll: () => api.get('/appointments/today/all'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
}

// Medical Records API
export const recordsAPI = {
  getAll: (params = {}) => api.get('/records', { params }),
  getById: (id) => api.get(`/records/${id}`),
  getByPatient: (patientId) => api.get(`/records/patient/${patientId}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
}

export default api