import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Heart, Clock, MapPin, Users, TrendingUp, BookOpen, Bell, Search, Eye, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [registeredSessions, setRegisteredSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ given: 0, received: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendeeData();
    }
  }, [user]);

  const fetchAttendeeData = async () => {
    try {
      // Fetch attendee profile with registered events and bookmarked sessions
      const attendeeResponse = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
      const attendeeData = attendeeResponse.data;

      // Fetch all public expos for discovery
      const allExposResponse = await axios.get(`${import.meta.env.VITE_API_URL}/expos/public/expos`);
      const allExpos = allExposResponse.data.expos || allExposResponse.data || [];

      // Fetch notifications
      const notificationsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`);
      const notifications = notificationsResponse.data || [];

      // Transform registered events
      const registeredEvents = attendeeData.registeredExpos ? attendeeData.registeredExpos.map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,
        organizer: expo.organizer,
        status: new Date(expo.date) > new Date() ? 'upcoming' : 'passed'
      })) : [];

      // Transform bookmarked sessions
      const bookmarkedSessions = attendeeData.bookmarkedSessions ? attendeeData.bookmarkedSessions.map(session => ({
        _id: session._id,
        title: session.title,
        time: session.time,
        speaker: session.speaker,
        topic: session.topic,
        location: session.location,
        expo: session.expo
      })) : [];

      // Transform bookmarked events
      const bookmarkedEvents = attendeeData.bookmarkedExpos ? attendeeData.bookmarkedExpos.map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,
        organizer: expo.organizer,
        status: new Date(expo.date) > new Date() ? 'upcoming' : 'passed'
      })) : [];

      // Transform upcoming events for discovery
      const availableEvents = allExpos.map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,
        organizer: expo.organizer,
        status: new Date(expo.date) > new Date() ? 'upcoming' : 'passed',
        isRegistered: registeredEvents.some(reg => reg._id === expo._id)
      }));

      // Show upcoming events as recommendations
      const recommendations = allExpos
        .filter(expo => new Date(expo.date) > new Date() && !registeredEvents.some(reg => reg._id === expo._id))
        .slice(0, 3)
        .map(expo => ({
          _id: expo._id,
          title: expo.title,
          date: expo.date,
          attendeeCount: expo.totalAttendees || 0,
          reason: 'Upcoming event you might be interested in'
        }));

      setProfile(user);
      setRegisteredEvents(registeredEvents);
      setBookmarkedSessions(bookmarkedSessions);
      setBookmarkedEvents(bookmarkedEvents);
      setRecommendations(recommendations);
      setUpcomingEvents(availableEvents);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching attendee data:', error);
      // Set empty states
      setProfile(user);
      setRegisteredEvents([]);
      setBookmarkedSessions([]);
      setRecommendations([]);
      setUpcomingEvents([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (sessionId) => {
    try {
      const isBookmarked = bookmarkedSessions.some(s => s._id === sessionId);

      if (isBookmarked) {
        // Unbookmark - remove from bookmarked sessions
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendees/unbookmark-session/${sessionId}`);
        setBookmarkedSessions(prev => prev.filter(s => s._id !== sessionId));
      } else {
        // Bookmark - add to bookmarked sessions
        await axios.post(`${import.meta.env.VITE_API_URL}/attendees/bookmark-session`, { sessionId });
        // Refetch to get updated bookmarks
        const attendeeResponse = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
        const attendeeData = attendeeResponse.data;
        const updatedBookmarked = attendeeData.bookmarkedSessions ? attendeeData.bookmarkedSessions.map(session => ({
          _id: session._id,
          title: session.title,
          time: session.time,
          speaker: session.speaker,
          topic: session.topic,
          location: session.location,
          expo: session.expo
        })) : [];
        setBookmarkedSessions(updatedBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
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
            <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.username || 'Attendee'}!</h1>
            <p className="text-blue-100">Explore upcoming events and manage your schedule</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{profile?.username?.[0]?.toUpperCase() || 'A'}</span>
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
            icon: Heart,
            label: 'Events Bookmarked',
            value: bookmarkedEvents.length,
            color: 'red'
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
                          <span>Sessions available</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/expo/${event._id}`)}
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
                <button
                  onClick={() => navigate('/expos')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Events
                </button>
              </div>
            )}
          </motion.div>

          {/* Bookmarked Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookmarked Events</h2>
            <div className="space-y-4">
              {bookmarkedEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      event.status === 'upcoming' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.theme}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate(`/expo/${event._id}`)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              {bookmarkedEvents.length === 0 && (
                <div className="text-center py-8">
                  <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No bookmarked events yet</p>
                  <p className="text-sm text-gray-400 mt-2">Bookmark events you're interested in to see them here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bookmarked Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                      <p className="text-sm text-gray-600">{session.topic}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{new Date(session.time).toLocaleDateString()}</span>
                        <span>{session.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleBookmark(session._id)}
                      className={`${bookmarkedSessions.some(s => s._id === session._id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                    >
                      <Heart size={20} fill={bookmarkedSessions.some(s => s._id === session._id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => navigate(`/session/${session._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
              {bookmarkedSessions.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No bookmarked sessions yet</p>
                  <p className="text-sm text-gray-400 mt-2">Bookmark sessions you're interested in to see them here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity & Session Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity & Sessions</h2>

            {/* Session Management Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button key="registered" className="flex-1 py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm">
                  Registered Sessions
                </button>
                <button key="upcoming" className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Upcoming Sessions
                </button>
                <button key="past" className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Past Sessions
                </button>
              </div>
            </div>

            {/* Session List */}
            <div className="space-y-4">
              {bookmarkedSessions.slice(0, 3).map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      new Date(session.time) > new Date() ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{session.title}</h4>
                      <p className="text-xs text-gray-600">{session.speaker}</p>
                      <p className="text-xs text-gray-500">{new Date(session.time).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/session/${session._id}`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}

              {bookmarkedSessions.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No registered sessions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Register for sessions from event details</p>
                </div>
              )}
            </div>

            {bookmarkedSessions.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/dashboard/attendee/my-events')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All Sessions →
                </button>
              </div>
            )}
          </motion.div>

          {/* Communication Hub */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Communication Hub</h2>

            <div className="space-y-4">
              {/* Messages */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Messages</h4>
                    <p className="text-xs text-gray-600">Connect with exhibitors</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/messages')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                >
                  Open
                </button>
              </div>

              {/* Appointments */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Appointments</h4>
                    <p className="text-xs text-gray-600">Schedule meetings</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/attendee/appointments')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                >
                  View
                </button>
              </div>

              {/* Exhibitor Search */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Find Exhibitors</h4>
                    <p className="text-xs text-gray-600">Search and connect</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/attendee/exhibitors')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
                >
                  Search
                </button>
              </div>
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
                onClick={() => navigate('/expos')}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Search size={18} />
                <span>Discover Events</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/attendee/my-events')}
                className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Heart size={18} />
                <span>My Events</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/attendee/exhibitors')}
                className="w-full flex items-center justify-center space-x-2 border border-green-600 text-green-600 hover:bg-green-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Search size={18} />
                <span>Find Exhibitors</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/attendee/discovery')}
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Clock size={18} />
                <span>Event Discovery</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/attendee/appointments')}
                className="w-full flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <Calendar size={18} />
                <span>My Appointments</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/attendee/feedback')}
                className="w-full flex items-center justify-center space-x-2 border border-orange-600 text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <MessageSquare size={18} />
                <span>Give Feedback</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeDashboard;
