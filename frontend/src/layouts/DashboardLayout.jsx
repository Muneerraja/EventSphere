import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader, DashboardSidebar } from '../components';

const DashboardLayout = () => {
  // Default: open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize based on screen size
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isMobile, setIsMobile] = useState(false);

  // Mock user role - in real app, get from auth context
  const userRole = 'admin'; // Could be 'admin', 'organizer', 'exhibitor', 'attendee'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close on mobile, auto-open on desktop
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      {/* Header */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 pb-16 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {/* Breadcrumb or page header can go here if needed */}
          <Outlet />
        </div>
      </main>
      {/* Mobile: Overlay behind sidebar is handled in sidebar component */}
    </div>
  );
};

export default DashboardLayout;
