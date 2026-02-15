import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import { format, subDays } from 'date-fns';
import { CheckCircle, Cancel, CalendarMonth } from '@mui/icons-material';
import { showSuccess, showError, extractErrorMessage } from '../utils/toastUtils';

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
  });

  useEffect(() => {
    fetchEmployees();
    fetchDateAttendance(selectedDate);
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      showError('Failed to fetch employees');
    }
  };

  const fetchDateAttendance = async (date) => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getDateAttendance(date);
      setAttendances(response.data.attendances || []);
    } catch (error) {
      setAttendances([]);
      showError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.mark(formData);
      showSuccess('✅ Attendance marked successfully!');
      setFormData({
        employee_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Present',
      });
      fetchDateAttendance(selectedDate);
    } catch (error) {
      // Debug: log everything
      console.log('FULL ERROR:', error);
      console.log('RESPONSE:', error.response);
      console.log('RESPONSE DATA:', error.response?.data);
      console.log('MESSAGE FIELD:', error.response?.data?.message);
      
      const errorMessage = extractErrorMessage(error);
      console.log('EXTRACTED MESSAGE:', errorMessage);
      
      showError(`❌ ${errorMessage}`);
    }
  };

  const handleDateChange = (days) => {
    const newDate = subDays(new Date(selectedDate), days);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  // Update form date when selected date changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDate
    }));
  }, [selectedDate]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleDateChange(1)}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Previous Day
          </button>
          <div className="flex items-center">
            <CalendarMonth className="mr-2 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mark Attendance Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.employee_id}>
                      {emp.employee_id} - {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                  value={formData.date}
                  // Remove onChange to make it truly read-only
                />
                <p className="text-xs text-gray-500 mt-1">Date is set to selected view date</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="Present"
                      checked={formData.status === 'Present'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mr-2"
                    />
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="mr-1" /> Present
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="Absent"
                      checked={formData.status === 'Absent'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mr-2"
                    />
                    <span className="flex items-center text-red-600">
                      <Cancel className="mr-1" /> Absent
                    </span>
                  </label>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Mark Attendance
              </button>
            </form>
          </div>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Attendance for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
              </h3>
              <span className="text-sm text-gray-500">
                {attendances.length} records
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading attendance...</p>
              </div>
            ) : attendances.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CalendarMonth className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No attendance marked for this date yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marked At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendances.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendance.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {attendance.employee_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendance.status === 'Present' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Cancel className="w-4 h-4 mr-1" />
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(attendance.marked_at), 'hh:mm a')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;