import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Heart, Clock, MapPin, Users, TrendingUp, BookOpen, Bell, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dummyData from '/dummydata.js';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendeeData();
    }
  }, [user]);

  const fetchAttendeeData = async () => {
    try {
      // Get authenticated user's ID from AuthContext
      const userId = user._id;

      // Fetch attendee profile with populated data
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${userId}`);
      const attendeeData = response.data;

      // Transform the data for the UI
      const transformedEvents = attendeeData.registeredExpos.map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,
        organizer: expo.organizer,
        status: new Date(expo.date) > new Date() ? 'upcoming' : 'passed',
        sessionCount: Math.floor(Math.random() * 5) + 1 // Mock - should calculate from sessions
      }));

      const transformedSessions = attendeeData.bookmarkedSessions.map(session => ({
        _id: session._id,
        title: session.title,
        time: session.time,
        speaker: session.speaker,
        topic: session.topic,
        location: session.location,
        ratings: session.ratings || [],
        attendance: session.attendance || [],
        speakerData: {
          username: session.speaker,
          profile: { firstName: session.speaker, lastName: "" } // Mock - should populate from user
        },
        expoData: {
          title: "Parent Expo" // Mock - should populate from expo
        }
      }));

      // Mock notifications and recommendations for now
      const mockNotifications = [
        {
          _id: "507f1f77bcf86cd799439061",
          user: userId,
          type: "expo_registration",
          message: `You have successfully registered for ${transformedEvents[0]?.title || 'an event'}`,
          read: false,
          createdAt: new Date()
        }
      ];

      const mockRecommendations = transformedEvents.slice(0, 2).map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        reason: "Based on your registered events",
        attendeeCount: Math.floor(Math.random() * 100) + 50
      }));

      setProfile(attendeeData.user);
      setRegisteredEvents(transformedEvents);
      setBookmarkedSessions(transformedSessions);
      setRecommendations(mockRecommendations);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching attendee data:', error);
      // Show empty state when no data is available
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.profile?.firstName}!</h1>
            <p className="text-blue-100">Explore upcoming events and manage your schedule</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{profile?.profile?.firstName?.[0]}</span>
            </div>
            <div>
              <p className="text-sm opacity-75">Role</p>
              <p className="text-xl font-bold capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
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
            label: 'Events Registered',
            value: registeredEvents.length,
            color: 'blue'
          },
          {
            icon: BookOpen,
            label: 'Sessions Bookmarked',
            value: bookmarkedSessions.length,
            color: 'green'
          },
          {
            icon: Bell,
            label: 'Notifications',
            value: unreadNotifications,
            color: 'yellow'
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
                <div className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registered Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
              <p className="text-gray-600 text-sm">Events you've registered for</p>
            </div>

            <div className="divide-y divide-gray-200">
              {registeredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen size={16} className="mr-2" />
                          <span>{event.sessionCount} sessions available</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {registeredEvents.length === 0 && (
              <div className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events yet</h3>
                <p className="text-gray-600 mb-6">Discover and register for upcoming expos</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Browse Events
                </button>
              </div>
            )}
          </motion.div>

          {/* Bookmarked Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookmarked Sessions</h2>
            <div className="space-y-4">
              {bookmarkedSessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      new Date(session.time) > new Date() ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600">{session.expoData.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{session.speakerData.profile.firstName} {session.speakerData.profile.lastName}</span>
                        <span>{new Date(session.time).toLocaleDateString()}</span>
                        <span>{session.topic}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="text-red-500 hover:text-red-700">
                      <Heart size={20} fill="currentColor" />
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Register
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-gray-600 text-sm">Stay updated with your events</p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            <div className="p-4">
              <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Notifications
              </button>
            </div>
          </motion.div>

          {/* Recommended Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended for You</h2>
            <div className="space-y-4">
              {recommendations.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{event.attendeeCount} attendees</span>
                    <span>Recommended</span>
                  </div>
                  <p className="text-xs text-blue-600 italic">{event.reason}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Search size={18} />
                <span>Discover Events</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Heart size={18} />
                <span>My Bookmarks</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Clock size={18} />
                <span>My Schedule</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDashboard;
