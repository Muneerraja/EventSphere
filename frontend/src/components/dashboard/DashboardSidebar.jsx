import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, Activity, Calendar, Users, Building, BookOpen, BarChart3, Settings, MessageSquare, User, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = {
    admin: [
      // Admin/Organizer Dashboard - Core Management
      { path: '/dashboard', icon: Activity, label: 'Dashboard' },

      // Expo Management (Admin/Organizer)
      { path: '/dashboard/admin/expos', icon: Calendar, label: 'All Expos' },
      { path: '/dashboard/organizer/my-expos', icon: Calendar, label: 'My Expos' },
      { path: '/dashboard/organizer/create-expo', icon: Calendar, label: 'Create Expo' },

      // Exhibitor Management (Admin/Organizer)
      { path: '/dashboard/admin/approvals', icon: BookOpen, label: 'All Approvals' },
      { path: '/dashboard/organizer/exhibitor-approvals', icon: BookOpen, label: 'Exhibitor Approvals' },
      { path: '/dashboard/organizer/booths', icon: Building, label: 'Booth Management' },

      // Schedule Management (Admin/Organizer)
      { path: '/dashboard/admin/sessions', icon: Clock, label: 'All Sessions' },
      { path: '/dashboard/organizer/sessions', icon: Clock, label: 'Session Management' },

      // Attendee Management (Admin/Organizer)
      { path: '/dashboard/organizer/attendees', icon: Users, label: 'Attendee Management' },

      // Analytics & Reporting (Admin/Organizer)
      { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },

      // Admin-only System Management
      { path: '/dashboard/admin/users', icon: Users, label: 'User Management' },
      { path: '/dashboard/settings', icon: Settings, label: 'System Settings' },

      // Shared Features
      { path: '/dashboard/accounts', icon: User, label: 'Account Settings' },
      { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
    organizer: [
      // Admin/Organizer Dashboard - Core Management
      { path: '/dashboard', icon: Activity, label: 'Dashboard' },

      // Expo Management (Admin/Organizer)
      { path: '/dashboard/admin/expos', icon: Calendar, label: 'All Expos' },
      { path: '/dashboard/organizer/my-expos', icon: Calendar, label: 'My Expos' },
      { path: '/dashboard/organizer/create-expo', icon: Calendar, label: 'Create Expo' },

      // Exhibitor Management (Admin/Organizer)
      { path: '/dashboard/admin/approvals', icon: BookOpen, label: 'All Approvals' },
      { path: '/dashboard/organizer/exhibitor-approvals', icon: BookOpen, label: 'Exhibitor Approvals' },
      { path: '/dashboard/organizer/booths', icon: Building, label: 'Booth Management' },

      // Schedule Management (Admin/Organizer)
      { path: '/dashboard/admin/sessions', icon: Clock, label: 'All Sessions' },
      { path: '/dashboard/organizer/sessions', icon: Clock, label: 'Session Management' },

      // Attendee Management (Admin/Organizer)
      { path: '/dashboard/organizer/attendees', icon: Users, label: 'Attendee Management' },

      // Analytics & Reporting (Admin/Organizer)
      { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },

      // Shared Features
      { path: '/dashboard/accounts', icon: User, label: 'Account Settings' },
      { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
    exhibitor: [
      // Exhibitor Portal Dashboard
      { path: '/dashboard', icon: Activity, label: 'Dashboard' },

      // Registration and Profile Management
      { path: '/dashboard/exhibitor/profile', icon: Users, label: 'My Profile' },
      { path: '/dashboard/exhibitor/apply', icon: Calendar, label: 'Apply for Expos' },

      // Booth Selection and Management
      { path: '/dashboard/exhibitor/booths', icon: Building, label: 'My Booths' },

      // Communication
      { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },

      // Account Settings
      { path: '/dashboard/accounts', icon: User, label: 'Account Settings' },
    ],
    attendee: [
      // Attendee Interface Dashboard
      { path: '/dashboard', icon: Activity, label: 'Dashboard' },

      // Event Information and Registration
      { path: '/dashboard/attendee/my-events', icon: Calendar, label: 'My Events' },
      { path: '/dashboard/attendee/discovery', icon: BookOpen, label: 'Event Discovery' },

      // Exhibitor Search and Interaction
      // Note: Exhibitor search is available on public pages, but attendee can interact via messages

      // Schedule Management
      // Note: Schedule viewing is part of event discovery and my events

      // Communication
      { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },

      // Account Settings
      { path: '/dashboard/accounts', icon: User, label: 'Account Settings' },
    ]
  };

  const currentMenuItems = menuItems[user.role] || menuItems.admin;

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial="closed"
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl border-r border-gray-200 z-40"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg"></div>
              <span className="font-bold text-gray-900">EventSphere</span>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {currentMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile when link is clicked
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="w-1 h-6 bg-blue-600 rounded-full ml-auto"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
