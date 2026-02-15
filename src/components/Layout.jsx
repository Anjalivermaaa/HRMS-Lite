import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { People, CalendarToday, Dashboard } from '@mui/icons-material';

const Layout = () => {
  // Base styles for all links
  const baseLinkStyles = "flex items-center px-6 py-3 transition-colors";
  
  // Function to get conditional styles
  const getNavLinkStyles = ({ isActive }) => {
    return `${baseLinkStyles} ${
      isActive 
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium' 
        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-700">HRMS Lite</h1>
          <p className="text-gray-500 text-sm mt-1">Human Resource Management</p>
        </div>
        
        <nav className="mt-6">
          <NavLink 
            to="/" 
            className={getNavLinkStyles}
            end
          >
            {({ isActive }) => (
              <div className="flex items-center w-full">
                <Dashboard className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Dashboard</span>
              </div>
            )}
          </NavLink>
          
          <NavLink 
            to="/employees" 
            className={getNavLinkStyles}
          >
            {({ isActive }) => (
              <div className="flex items-center w-full">
                <People className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Employees</span>
              </div>
            )}
          </NavLink>
          
          <NavLink 
            to="/attendance" 
            className={getNavLinkStyles}
          >
            {({ isActive }) => (
              <div className="flex items-center w-full">
                <CalendarToday className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Attendance</span>
              </div>
            )}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-xs text-gray-400">
            Version 1.0.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;