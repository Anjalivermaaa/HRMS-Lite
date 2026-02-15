import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import { People, CalendarToday, CheckCircle, Cancel, Business, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_employees: 0,
    departments: [],
  });
  const [todayAttendance, setTodayAttendance] = useState({
    total_marked: 0,
    present: 0,
    absent: 0,
    not_marked: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employee summary
      const empResponse = await employeeAPI.getSummary();
      // Handle the response structure (might be wrapped in data property)
      const empData = empResponse.data?.data || empResponse.data;
      setSummary({
        total_employees: empData?.total_employees || 0,
        departments: empData?.departments || [],
      });
      
      // Fetch today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const attResponse = await attendanceAPI.getDateAttendance(today);
      // Handle the response structure
      const attData = attResponse.data?.data || attResponse.data;
      if (attData?.summary) {
        setTodayAttendance(attData.summary);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.log("heyyyyyy")
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-block">
          <p className="font-medium">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Calculate attendance rate
  const attendanceRate = todayAttendance.total_marked > 0 
    ? Math.round((todayAttendance.present / todayAttendance.total_marked) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_employees}</p>
              <p className="text-xs text-gray-400 mt-1">Active employees</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <People className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/employees" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all employees →
            </Link>
          </div>
        </div>
        
        {/* Present Today Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{todayAttendance.present || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {attendanceRate}% of marked attendance
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Absent Today Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Absent Today</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{todayAttendance.absent || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {100 - attendanceRate}% of marked attendance
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <Cancel className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${100 - attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Not Marked Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Not Marked</p>
              <p className="text-3xl font-bold text-gray-400 mt-2">{todayAttendance.not_marked || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Awaiting attendance</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-100">
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/attendance" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Mark now →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Department Distribution</h3>
              <Business className="text-gray-400" />
            </div>
            
            {summary.departments?.length > 0 ? (
              <div className="space-y-5">
                {summary.departments.map((dept, index) => {
                  const percentage = summary.total_employees > 0 
                    ? Math.round((dept.count / summary.total_employees) * 100) 
                    : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                          <span className="ml-2 text-xs text-gray-500">({dept.count})</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Departments</span>
                    <span className="font-medium text-gray-900">{summary.departments.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Business className="mx-auto h-12 w-12 text-gray-300" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No departments</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Add employees to see department distribution.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to="/employees"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <People className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="font-medium text-gray-800 group-hover:text-blue-700">Manage Employees</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Add, edit, or remove employees</p>
                </div>
                <span className="text-blue-600 text-sm">→</span>
              </Link>
              
              <Link
                to="/attendance"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <CalendarToday className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="font-medium text-gray-800 group-hover:text-green-700">Mark Attendance</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Record daily attendance</p>
                </div>
                <span className="text-green-600 text-sm">→</span>
              </Link>

              {/* Today's Summary Card */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Present</span>
                    <span className="font-medium text-green-600">{todayAttendance.present || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Absent</span>
                    <span className="font-medium text-red-600">{todayAttendance.absent || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Not Marked</span>
                    <span className="font-medium text-gray-600">{todayAttendance.not_marked || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;