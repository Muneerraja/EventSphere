import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingAppointment, setCancellingAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/attendee/${user._id}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancellingAppointment(appointmentId);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}/status`, {
        status: 'cancelled'
      });

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );

      alert('Appointment cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingAppointment(null);
    }
  };

  const handleMessageExhibitor = (exhibitorId) => {
    navigate(`/dashboard/messages?user=${exhibitorId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'all') return true;
    return appointment.status === activeTab;
  });

  const sortedAppointments = filteredAppointments.sort((a, b) =>
    new Date(a.dateTime) - new Date(b.dateTime)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
            <p className="text-blue-100">Manage your scheduled meetings with exhibitors</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            label: 'Total',
            value: appointments.length,
            color: 'blue'
          },
          {
            label: 'Confirmed',
            value: appointments.filter(a => a.status === 'confirmed').length,
            color: 'green'
          },
          {
            label: 'Pending',
            value: appointments.filter(a => a.status === 'pending').length,
            color: 'yellow'
          },
          {
            label: 'Upcoming',
            value: appointments.filter(a => new Date(a.dateTime) > new Date() && a.status !== 'cancelled').length,
            color: 'purple'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                <Calendar className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'all', label: 'All Appointments' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'all' ? 'No appointments yet' : `No ${activeTab} appointments`}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all'
                  ? 'Schedule meetings with exhibitors to get started'
                  : `You don't have any ${activeTab} appointments`
                }
              </p>
              {activeTab === 'all' && (
                <button
                  onClick={() => navigate('/dashboard/attendee/exhibitors')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Exhibitors
                </button>
              )}
            </div>
          ) : (
            sortedAppointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      {/* Exhibitor Info */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="text-white" size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Meeting with {appointment.exhibitor?.username || 'Exhibitor'}
                          </h3>
                          <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="capitalize">{appointment.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2" />
                            <span>
                              {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                              {' - '}
                              {new Date(new Date(appointment.dateTime).getTime() + (appointment.duration * 60000)).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2" />
                            <span>{appointment.expo?.title || 'Expo'}</span>
                          </div>
                        </div>

                        {appointment.booth && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Booth:</strong> {appointment.booth.boothNumber} - {appointment.booth.location}
                          </div>
                        )}

                        {appointment.purpose && (
                          <div className="text-sm text-gray-600">
                            <strong>Purpose:</strong> {appointment.purpose}
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancellingAppointment === appointment._id}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {cancellingAppointment === appointment._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    <button
                      onClick={() => handleMessageExhibitor(appointment.exhibitor._id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Message
                    </button>

                    {appointment.status === 'confirmed' && new Date(appointment.dateTime) > new Date() && (
                      <div className="text-xs text-gray-500 text-center">
                        Meeting in {Math.ceil((new Date(appointment.dateTime) - new Date()) / (1000 * 60 * 60))} hours
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyAppointments;
