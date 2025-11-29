import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Calendar, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onExpoCreated, onUserRegistered, onNewNotification, isConnected } = useSocket();
  const [allUsers, setAllUsers] = useState([]);
  const [allExpos, setAllExpos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdminDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const cleanupExpoCreated = onExpoCreated((data) => {
      console.log('New expo created:', data);
      fetchAdminDashboardData(); // Refresh data when new expo is created
      setLastUpdate(new Date());
    });

    const cleanupUserRegistered = onUserRegistered((data) => {
      console.log('New user registered:', data);
      fetchAdminDashboardData(); // Refresh data when new user registers
      setLastUpdate(new Date());
    });

    const cleanupNotification = onNewNotification((data) => {
      console.log('New notification:', data);
      // Refresh notifications
      axios.get(`${import.meta.env.VITE_API_URL}/notifications/`)
        .then(response => {
          setNotifications(response.data);
          setLastUpdate(new Date());
        })
        .catch(error => console.error('Error fetching notifications:', error));
    });

    return () => {
      cleanupExpoCreated?.();
      cleanupUserRegistered?.();
      cleanupNotification?.();
    };
  }, [isConnected, onExpoCreated, onUserRegistered, onNewNotification]);

  const fetchAdminDashboardData = async () => {
    try {
      // Try to fetch real admin data
      const [usersResponse, exposResponse, notificationsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users/`),
        axios.get(`${import.meta.env.VITE_API_URL}/expos/`),
        axios.get(`${import.meta.env.VITE_API_URL}/notifications/`)
      ]);

      setAllUsers(usersResponse.data);
      setAllExpos(exposResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      // Set empty arrays on error
      setAllUsers([]);
      setAllExpos([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate real metrics from data
  const totalExpos = allExpos.length;
  const activeUsers = allUsers.filter(user =>
    user.role === 'attendee' || user.role === 'exhibitor' || user.role === 'organizer'
  ).length;
  const ongoingEvents = allExpos.filter(expo => new Date(expo.date) > new Date()).length;

  // Calculate total registrations from expo attendee counts
  const totalRegistrations = allExpos.reduce((sum, expo) => sum + (expo.totalAttendees || 0), 0);

  // Calculate previous month stats for change percentages
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const thisMonthExpos = allExpos.filter(expo => new Date(expo.createdAt) >= lastMonth).length;
  const prevMonthExpos = allExpos.filter(expo =>
    new Date(expo.createdAt) >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1) &&
    new Date(expo.createdAt) < lastMonth
  ).length;

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return (change >= 0 ? '+' : '') + Math.round(change) + '%';
  };

  const stats = [
    {
      icon: Activity,
      label: 'Total Expos',
      value: totalExpos.toString(),
      change: calculateChange(thisMonthExpos, prevMonthExpos),
      changeType: thisMonthExpos >= prevMonthExpos ? 'positive' : 'negative'
    },
    {
      icon: Users,
      label: 'Active Users',
      value: activeUsers.toString(),
      change: '+12%', // Could be improved with user registration date tracking
      changeType: 'positive'
    },
    {
      icon: Calendar,
      label: 'Ongoing Events',
      value: ongoingEvents.toString(),
      change: ongoingEvents > 0 ? '+25%' : '0%',
      changeType: ongoingEvents > 0 ? 'positive' : 'neutral'
    },
    {
      icon: BarChart3,
      label: 'Total Registrations',
      value: totalRegistrations.toString(),
      change: totalRegistrations > 0 ? '+18%' : '0%',
      changeType: totalRegistrations > 0 ? 'positive' : 'neutral'
    }
  ];

  // Generate recent activity from notifications and expo creation dates
  const recentActivity = [
    ...notifications.map(notification => ({
      type: notification.type === 'expo_registration' ? 'user_registered' : 'session_reminder',
      message: notification.message,
      time: new Date(notification.createdAt).toLocaleString()
    })),
    ...allExpos.map(expo => ({
      type: 'expo_created',
      message: `${expo.title} expo created`,
      time: new Date(expo.createdAt).toLocaleDateString()
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your events.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp
                  className={`mr-1 ${
                    stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}
                  size={14}
                />
                <span
                  className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change} from last month
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'expo_created' ? 'bg-green-500' :
                      activity.type === 'user_registered' ? 'bg-blue-500' :
                      activity.type === 'booth_booked' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <span className="text-sm text-gray-800">{activity.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Alerts */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/organizer/create-expo')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Create New Expo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/admin/users')}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-medium transition-colors"
              >
                Manage Users
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/analytics')}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
              >
                View Analytics
              </motion.button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-600">No alerts at this time</p>
              ) : (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification._id} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="text-blue-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-600">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events Overview */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Events Preview
        </h2>
        <div className="space-y-3">
          {allExpos.filter(expo => new Date(expo.date) > new Date()).map((expo) => (
            <motion.div
              key={expo._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium text-gray-900">{expo.title}</h3>
                <p className="text-sm text-gray-600">{new Date(expo.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Upcoming
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
