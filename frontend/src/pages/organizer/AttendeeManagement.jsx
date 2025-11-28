import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Download,
  AlertTriangle,
  UserCheck,
  Ticket,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';


const AttendeeManagement = () => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpo, setSelectedExpo] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userExpos, setUserExpos] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    selectedAttendees: []
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  useEffect(() => {
    fetchUserExpos();
  }, []);

  useEffect(() => {
    if (userExpos.length > 0) {
      fetchAttendees();
    } else {
      setAttendees([]);
      setLoading(false);
    }
  }, [userExpos, selectedExpo, searchQuery, filterStatus]);

  const fetchUserExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos`, { timeout: 5000 });
      const organizerExpos = response.data.filter(expo => expo.organizer === user._id);
      setUserExpos(organizerExpos);
    } catch (error) {
      console.error('Error fetching user expos:', error);
      setUserExpos([]);
    }
  };

  const fetchAttendees = async () => {
    try {
      // Fetch attendees and transform data for organizer view
      const attendeesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/attendees`, { timeout: 5000 });
      const rawAttendees = attendeesResponse.data;

      // Transform attendee data to match component expectations
      const transformedAttendees = [];

      for (const attendee of rawAttendees) {
        // Get user profile data
        const userProfile = attendee.user?.profile || {};

        // Find registrations for organizer's events
        const relevantRegistrations = attendee.registeredExpos?.filter(expo =>
          userExpos.some(userExpo => userExpo._id === expo._id)
        ) || [];

        // Create attendee records for each relevant expo registration
        for (const expo of relevantRegistrations) {
          transformedAttendees.push({
            id: `${attendee._id}-${expo._id}`,
            firstName: userProfile.firstName || attendee.user?.username || 'Unknown',
            lastName: userProfile.lastName || '',
            email: attendee.user?.email || 'No email',
            phone: userProfile.phone || 'N/A',
            jobTitle: userProfile.jobTitle || 'Not specified',
            company: userProfile.company || 'Not specified',
            expoId: expo._id,
            expoName: expo.title,
            ticketType: userProfile.ticketType || 'Standard',
            status: userProfile.registrationStatus || 'confirmed',
            registrationDate: attendee.createdAt,
            checkInTime: userProfile.checkInTime || null
          });
        }
      }

      setAttendees(transformedAttendees);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      // Set empty array when no data is available
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checked-in':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTicketColor = (type) => {
    switch (type) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'Premium':
        return 'bg-blue-100 text-blue-800';
      case 'Standard':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendEmail = (attendee) => {
    setEmailData({
      subject: '',
      message: '',
      selectedAttendees: [attendee.id]
    });
    setShowEmailModal(true);
  };

  const handleBulkEmail = () => {
    const confirmedAttendees = attendees.filter(a => a.status === 'confirmed').map(a => a.id);
    setEmailData({
      subject: '',
      message: '',
      selectedAttendees: confirmedAttendees
    });
    setShowEmailModal(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the email
    console.log('Sending email:', emailData);
    setShowEmailModal(false);
    setEmailData({
      subject: '',
      message: '',
      selectedAttendees: []
    });
  };

  const handleExportAttendees = () => {
    // In a real app, this would generate and download a CSV
    const csvContent = [
      ['Name', 'Email', 'Company', 'Job Title', 'Status', 'Registration Date'],
      ...attendees.map(attendee => [
        `${attendee.firstName} ${attendee.lastName}`,
        attendee.email,
        attendee.company,
        attendee.jobTitle,
        attendee.status,
        new Date(attendee.registrationDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendee Management</h1>
          <p className="text-gray-600">Monitor registrations, engagement, and communicate with your event attendees</p>
        </div>

        <div className="flex space-x-4 mt-4 lg:mt-0">
          <button
            onClick={handleBulkEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
          >
            <Mail size={20} className="mr-2" />
            Bulk Email
          </button>
          <button
            onClick={handleExportAttendees}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div
          key="total"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <div className="text-blue-600 text-xl font-bold">{attendees.length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="confirmed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <div className="text-green-600 text-xl font-bold">{attendees.filter(a => a.status === 'confirmed').length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.filter(a => a.status === 'confirmed').length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="checked-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg mr-4">
              <div className="text-purple-600 text-xl font-bold">{attendees.filter(a => a.checkInTime).length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.filter(a => a.checkInTime).length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="vip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg mr-4">
              <div className="text-yellow-600 text-xl font-bold">{attendees.filter(a => a.ticketType === 'VIP').length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">VIP Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.filter(a => a.ticketType === 'VIP').length}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedExpo}
              onChange={(e) => setSelectedExpo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {userExpos.map(expo => (
                <option key={expo._id} value={expo._id}>{expo.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedExpo('all');
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Attendees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
                    <p className="text-gray-600">No registrations match your current filters</p>
                  </td>
                </tr>
              ) : (
                attendees.map((attendee, index) => (
                  <motion.tr
                    key={attendee.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {attendee.firstName} {attendee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{attendee.jobTitle}</div>
                        <div className="text-sm text-gray-500">{attendee.company}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{attendee.expoName}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-1" />
                        {attendee.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone size={14} className="mr-1" />
                        {attendee.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketColor(attendee.ticketType)}`}>
                        {attendee.ticketType}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendee.status || 'confirmed')}`}>
                        {(attendee.status || 'confirmed').charAt(0).toUpperCase() + (attendee.status || 'confirmed').slice(1)}
                      </span>
                      {attendee.checkInTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          Checked in: {new Date(attendee.checkInTime).toLocaleTimeString()}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attendee.registrationDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSendEmail(attendee)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Mail size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <BarChart3 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Email Modal */}
      {showEmailModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Sending to:</strong> {emailData.selectedAttendees.length} attendee(s)
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={8}
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email message content..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Send Email
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendeeManagement;
