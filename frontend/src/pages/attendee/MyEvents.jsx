import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Bookmark, Users, Star, Eye, Heart, BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registered');

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      // Get authenticated user's ID from AuthContext
      const userId = user._id;
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${userId}`);
      const attendeeData = response.data;

      setAttendee(attendeeData);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set empty attendee data on error
      setAttendee({
        registeredExpos: [],
        registeredSessions: [],
        bookmarkedSessions: [],
        bookmarkedExpos: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'registered', label: 'Registered Events', icon: CheckCircle, count: attendee?.registeredExpos?.length || 0 },
    { id: 'bookmarked', label: 'Bookmarked Events', icon: Heart, count: attendee?.bookmarkedExpos?.length || 0 },
    { id: 'sessions', label: 'Registered Sessions', icon: BookOpen, count: attendee?.registeredSessions?.length || 0 },
    { id: 'bookmarked-sessions', label: 'Bookmarked Sessions', icon: Bookmark, count: attendee?.bookmarkedSessions?.length || 0 }
  ];

  const toggleBookmark = async (sessionId) => {
    try {
      const isBookmarked = attendee.bookmarkedSessions.some(s => s._id === sessionId);

      if (isBookmarked) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendees/unbookmark-session/${sessionId}`);
        setAttendee(prev => ({
          ...prev,
          bookmarkedSessions: prev.bookmarkedSessions.filter(s => s._id !== sessionId)
        }));
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/attendees/bookmark-session`, { sessionId });
        // Refetch to get updated bookmarks
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
        const updatedAttendee = response.data;
        setAttendee(updatedAttendee);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">My Events & Sessions</h1>
            <p className="text-blue-100">Manage your registered events and bookmarked sessions</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{attendee?.registeredExpos?.length || 0}</div>
          <div className="text-sm text-gray-600">Registered Events</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{attendee?.bookmarkedExpos?.length || 0}</div>
          <div className="text-sm text-gray-600">Bookmarked Events</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{attendee?.registeredSessions?.length || 0}</div>
          <div className="text-sm text-gray-600">Registered Sessions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{attendee?.bookmarkedSessions?.length || 0}</div>
          <div className="text-sm text-gray-600">Bookmarked Sessions</div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'registered' && (
            <div>
              {attendee?.registeredExpos?.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No registered events yet</h3>
                  <p className="text-gray-600 mb-6">Browse and register for upcoming expos to see them here.</p>
                  <button
                    onClick={() => navigate('/expos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attendee.registeredExpos.map((expo, index) => (
                    <motion.div
                      key={expo._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{expo.title}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Registered
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={14} className="mr-2" />
                          <span>{new Date(expo.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin size={14} className="mr-2" />
                          <span>{expo.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users size={14} className="mr-2" />
                          <span>{expo.organizer?.username || 'EventSphere'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/expo/${expo._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/attendee/exhibitors')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Find Exhibitors
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarked' && (
            <div>
              {attendee?.bookmarkedExpos?.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked events yet</h3>
                  <p className="text-gray-600 mb-6">Bookmark events you're interested in to keep track of them.</p>
                  <button
                    onClick={() => navigate('/expos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attendee.bookmarkedExpos.map((expo, index) => (
                    <motion.div
                      key={expo._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{expo.title}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Heart size={12} className="mr-1" />
                            Bookmarked
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={14} className="mr-2" />
                          <span>{new Date(expo.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin size={14} className="mr-2" />
                          <span>{expo.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users size={14} className="mr-2" />
                          <span>{expo.organizer?.username || 'EventSphere'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/expo/${expo._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        {attendee.registeredExpos.some(reg => reg._id === expo._id) ? (
                          <button
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            disabled
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Registered
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/expo/${expo._id}`)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              {attendee?.registeredSessions?.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No registered sessions yet</h3>
                  <p className="text-gray-600 mb-6">Register for sessions from event details to see them here.</p>
                  <button
                    onClick={() => navigate('/expos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendee.registeredSessions.map((session, index) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                          <p className="text-gray-600 mb-2">{session.topic}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                            <CheckCircle size={12} className="mr-1" />
                            Registered
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          <span>{new Date(session.time).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-2" />
                          <span>{session.speaker}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/session/${session._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/attendee/feedback')}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Star size={14} className="mr-1" />
                          Rate Session
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarked-sessions' && (
            <div>
              {attendee?.bookmarkedSessions?.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked sessions yet</h3>
                  <p className="text-gray-600 mb-6">Bookmark sessions you're interested in to keep track of them.</p>
                  <button
                    onClick={() => navigate('/expos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendee.bookmarkedSessions.map((session, index) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                          <p className="text-gray-600 mb-2">{session.topic}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-3">
                            <Heart size={12} className="mr-1" />
                            Bookmarked
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(session._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          <span>{new Date(session.time).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-2" />
                          <span>{session.speaker}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/session/${session._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        {attendee.registeredSessions.some(reg => reg._id === session._id) ? (
                          <button
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            disabled
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Registered
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/session/${session._id}`)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Register
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyEvents;
