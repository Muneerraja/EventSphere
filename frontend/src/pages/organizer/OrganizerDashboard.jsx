import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, DollarSign, Eye, Plus, Edit, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expos, setExpos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch expos first (critical for dashboard functionality)
      const exposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/expos`);
      setExpos(exposResponse.data);

      // Try to fetch notifications separately (non-blocking)
      try {
        const notificationsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`);
        setNotifications(notificationsResponse.data);
      } catch (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        // Notifications failed, but dashboard can still show expos
        setNotifications([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If expos fail, keep empty array
      setExpos([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic summary metrics
  const currentDate = new Date();
  const filteredExpos = activeFilter === 'active'
    ? expos.filter(expo => new Date(expo.date) >= currentDate)
    : expos;

  const totalExpos = expos.length;
  const totalRevenue = expos.reduce((sum, expo) => sum + (expo.revenue || 0), 0);
  const totalAttendees = expos.reduce((sum, expo) => sum + (expo.totalAttendees || 0), 0);
  const activeExpos = expos.filter(expo => new Date(expo.date) >= currentDate).length;

  // Calculate month-over-month changes
  const getPreviousMonthStats = () => {
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
    const lastMonthExpos = expos.filter(expo => new Date(expo.createdAt) < currentDate && new Date(expo.createdAt) >= lastMonth);
    const prevRevenue = lastMonthExpos.reduce((sum, expo) => sum + (expo.revenue || 0), 0);
    const prevAttendees = lastMonthExpos.reduce((sum, expo) => sum + (expo.totalAttendees || 0), 0);

    return { prevRevenue, prevAttendees, prevExposCount: lastMonthExpos.length };
  };

  const { prevRevenue, prevAttendees, prevExposCount } = getPreviousMonthStats();

  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: current > 0 ? '+100%' : '0%', type: current > 0 ? 'positive' : 'neutral' };
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`,
      type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
    };
  };

  const revenueChange = calculateChange(totalRevenue, prevRevenue);
  const attendeesChange = calculateChange(totalAttendees, prevAttendees);
  const eventsChange = calculateChange(totalExpos, prevExposCount);

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
      >
        <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <p className="text-gray-600">Manage your events and track performance</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            icon: Calendar,
            label: 'Total Events',
            value: totalExpos,
            change: eventsChange.value + ' this month',
            changeType: eventsChange.type
          },
          {
            icon: DollarSign,
            label: 'Total Revenue',
            value: `$${(totalRevenue / 1000).toFixed(0)}K`,
            change: revenueChange.value + ' from last month',
            changeType: revenueChange.type
          },
          {
            icon: Users,
            label: 'Total Attendees',
            value: totalAttendees.toLocaleString(),
            change: attendeesChange.value + ' growth',
            changeType: attendeesChange.type
          },
          {
            icon: Eye,
            label: 'Active Events',
            value: activeExpos,
            change: totalExpos > 0 ? `${Math.round((activeExpos / totalExpos) * 100)}% active` : '0% active',
            changeType: 'neutral'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp
                  className={`mr-2 ${
                    stat.changeType === 'positive' ? 'text-green-500' :
                    stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                  }`}
                  size={16}
                />
                <span className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/organizer/create-expo')}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            <span>Create New Expo</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Users size={20} />
            <span>Review Applications</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Calendar size={20} />
            <span>Manage Schedules</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Events Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeFilter === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredExpos.map((expo, index) => (
            <motion.div
              key={expo._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expo.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      new Date(expo.date) >= currentDate ? 'bg-green-100 text-green-800' :
                      new Date(expo.date) < currentDate ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {new Date(expo.date) >= currentDate ? 'Active' : 'Completed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>{new Date(expo.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2" />
                      <span>{(expo.totalAttendees || 0).toLocaleString()} attendees</span>
                    </div>
                    <div className="flex items-center">
                      <Eye size={16} className="mr-2" />
                      <span>Updated {expo.lastUpdated ? new Date(expo.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Exhibitors:</span>
                      <span className="font-medium ml-1">{expo.totalExhibitors || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-medium ml-1">${(expo.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium ml-1">{expo.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6 flex-col sm:flex-row gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/organizer/expo/${expo._id}/view`)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    <Eye size={16} />
                    <span className="hidden xs:inline">View</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/organizer/expo/${expo._id}/edit`)}
                    className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    <Edit size={16} />
                    <span className="hidden xs:inline">Edit</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredExpos.length === 0 && (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            <button
              onClick={() => navigate('/organizer/create-expo')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create New Event
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {notifications.slice(0, 4).length > 0 ? (
            notifications.slice(0, 4).map((notification, index) => (
              <motion.div
                key={notification._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    !notification.read ? 'bg-blue-500' :
                    notification.type === 'system' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-gray-800">{notification.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </motion.div>
            ))
          ) : (
            // Fallback to demo activities if no notifications
            [
              { type: 'application', message: 'New exhibitor application for Tech Summit', time: '2 hours ago', status: 'pending' },
              { type: 'booking', message: 'Booth A1 assigned to TechCorp Solutions', time: '4 hours ago', status: 'completed' },
              { type: 'session', message: 'AI Workshop session created', time: '1 day ago', status: 'completed' },
              { type: 'payment', message: 'Payment received for Healthcare Conference', time: '2 days ago', status: 'completed' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-800">{activity.message}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrganizerDashboard;
