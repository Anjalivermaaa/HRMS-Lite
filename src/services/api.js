import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle the new response structure
api.interceptors.response.use(
  (response) => {
    // If the response already has our custom structure, extract the data
    if (response.data && response.data.status === 'success') {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    // Handle errors with our custom structure
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Create a custom error object with our structure
      const customError = {
        ...error,
        response: {
          ...error.response,
          data: {
            status: errorData.status || 'error',
            status_code: errorData.status_code || error.response.status,
            message: errorData.message || 'An error occurred',
            errors: errorData.errors || errorData,
            original_data: errorData
          }
        }
      };
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

// Employee API endpoints
export const employeeAPI = {
  getAll: () => api.get('/employees/'),
  getById: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.put(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
  getSummary: () => api.get('/employees/summary/'),
};

// Attendance API endpoints
export const attendanceAPI = {
  getAll: () => api.get('/attendance/'),
  mark: (data) => api.post('/attendance/', data),
  getEmployeeAttendance: (employeeId, startDate, endDate) => {
    let url = `/attendance/employee_attendance/?employee_id=${employeeId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return api.get(url);
  },
  getDateAttendance: (date) => api.get(`/attendance/date_attendance/?date=${date}`),
  getToday: () => api.get('/attendance/today/'),
  getSummary: (startDate, endDate) => 
    api.get(`/attendance/summary/?start_date=${startDate}&end_date=${endDate}`),
};

export default api;