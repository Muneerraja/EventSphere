import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Building, Clock, User, Mail, Share2, Heart, BookOpen, CheckCircle, Plus, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const IndividualExpoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expo, setExpo] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredSessions, setRegisteredSessions] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'general', message: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchExpoDetails();
  }, [id, user]);

  const fetchExpoDetails = async () => {
    try {
      const [expoResponse, exhibitorsResponse, sessionsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/expos/public/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/exhibitors/public/by-expo/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/sessions/public/by-expo/${id}`)
      ]);

      setExpo(expoResponse.data);
      setExhibitors(exhibitorsResponse.data);
      setSessions(sessionsResponse.data);

      // Check user registration status and preferences if logged in
      if (user) {
        try {
          const attendeeResponse = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
          const attendeeData = attendeeResponse.data;

          // Check if user is registered for this expo
          setIsRegistered(attendeeData.registeredExpos?.some(expo => expo._id === expoResponse.data._id) || false);

          // Get registered and bookmarked sessions
          setRegisteredSessions(attendeeData.registeredSessions || []);
          setBookmarkedSessions(attendeeData.bookmarkedSessions?.map(s => s._id) || []);
        } catch (attendeeError) {
          console.error('Error fetching attendee data:', attendeeError);
          setIsRegistered(false);
          setRegisteredSessions([]);
          setBookmarkedSessions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching expo details:', error);
      // Set empty arrays on error
      setExpo(null);
      setExhibitors([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegistration = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isRegistered) {
      alert('You are already registered for this event!');
      return;
    }

    setRegistering(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/attendees/register-expo`, {
        expoId: id
      });

      setIsRegistered(true);
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleSessionRegistration = async (sessionId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isRegistered) {
      alert('You must be registered for the event to register for sessions.');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/attendees/register-session`, {
        sessionId
      });

      setRegisteredSessions(prev => [...prev, sessionId]);
      alert('Successfully registered for the session!');
    } catch (error) {
      console.error('Error registering for session:', error);
      alert('Failed to register for the session. Please try again.');
    }
  };

  const handleBookmarkSession = async (sessionId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (bookmarkedSessions.includes(sessionId)) {
        // Unbookmark
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendees/unbookmark-session/${sessionId}`);
        setBookmarkedSessions(prev => prev.filter(id => id !== sessionId));
      } else {
        // Bookmark
        await axios.post(`${import.meta.env.VITE_API_URL}/attendees/bookmark-session`, { sessionId });
        setBookmarkedSessions(prev => [...prev, sessionId]);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleScheduleAppointment = (exhibitorId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    navigate(`/dashboard/attendee/appointment/${exhibitorId}`);
  };

  const handleMessageExhibitor = (exhibitorId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    navigate(`/dashboard/messages?user=${exhibitorId}`);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/feedbacks`, {
        type: feedback.type,
        message: feedback.message,
        expoId: id
      });

      setFeedback({ type: 'general', message: '' });
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'exhibitors', label: 'Exhibitors', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'floorplan', label: 'Floor Plan', icon: Building }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Expo not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {expo.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join us for an exceptional expo experience featuring innovative companies,
              cutting-edge technologies, and unparalleled networking opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Calendar className="text-blue-600 mx-auto mb-4" size={32} />
                <div className="text-lg font-semibold text-gray-900 mb-2">Date & Time</div>
                <div className="text-gray-600">
                  {new Date(expo.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <MapPin className="text-green-600 mx-auto mb-4" size={32} />
                <div className="text-lg font-semibold text-gray-900 mb-2">Location</div>
                <div className="text-gray-600">{expo.location}</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                isRegistered ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                    disabled
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Registered
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEventRegistration}
                    disabled={registering}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    {registering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Register Now
                      </>
                    )}
                  </motion.button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Register Now
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('sessions')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Sessions
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{expo.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Users className="text-blue-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">{exhibitors.length}+ Exhibitors</h3>
                    <p className="text-gray-600">Leading companies showcasing</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Calendar className="text-green-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">{sessions.length}+ Sessions</h3>
                    <p className="text-gray-600">Expert-led presentations</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Building className="text-purple-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">{expo.capacity || '500+'} Capacity</h3>
                    <p className="text-gray-600">Expected attendees</p>
                  </div>
                </div>

                {/* Event Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{isRegistered ? '1' : '0'}</div>
                    <div className="text-sm text-blue-700">Your Registrations</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{registeredSessions.length}</div>
                    <div className="text-sm text-green-700">Session Registrations</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{bookmarkedSessions.length}</div>
                    <div className="text-sm text-purple-700">Bookmarked Sessions</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{Math.max(0, new Date(expo.date) - new Date()) / (1000 * 60 * 60 * 24) | 0}</div>
                    <div className="text-sm text-orange-700">Days Until Event</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Duration</div>
                        <div>{expo.duration || 'Full Day Event'}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Organizer</div>
                        <div className="flex items-center space-x-2">
                          <span>{expo.organizer?.username || 'EventSphere Team'}</span>
                          {expo.organizer?.role === 'organizer' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Verified Organizer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Contact</div>
                        <div>{expo.organizer?.email || 'info@eventsphere.com'}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Expected Attendees</div>
                        <div>{expo.capacity || '500+'} people</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Event Category</div>
                        <div>{expo.theme || 'Technology & Innovation'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Early Bird Registration</h3>
                  <p className="mb-4">Limited time offer: Save 20% on tickets!</p>
                  {user ? (
                    isRegistered ? (
                      <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed" disabled>
                        Already Registered
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEventRegistration}
                        disabled={registering}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-75"
                      >
                        {registering ? 'Registering...' : 'Register Early'}
                      </motion.button>
                    )
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/auth')}
                      className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Register Early
                    </motion.button>
                  )}
                </div>

                {/* Feedback Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Feedback</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Help us improve future events by sharing your thoughts about this expo.
                  </p>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Type
                      </label>
                      <select
                        value={feedback.type}
                        onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Feedback</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="complaint">Complaint</option>
                        <option value="praise">Praise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message
                      </label>
                      <textarea
                        value={feedback.message}
                        onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us what you think..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submittingFeedback || !feedback.message.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {submittingFeedback ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exhibitors' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Exhibitors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitors.map((exhibitor) => (
                <motion.div
                  key={exhibitor._id || exhibitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    {exhibitor.logo ? (
                      <img
                        src={exhibitor.logo}
                        alt={exhibitor.company}
                        className="w-12 h-12 rounded-lg mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg mr-4 bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{exhibitor.company?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{exhibitor.company}</h3>
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Exhibitor
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{exhibitor.description}</p>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Products/Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {exhibitor.products.map((product, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/exhibitor/${exhibitor.user}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Profile
                    </motion.button>
                    {user ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMessageExhibitor(exhibitor.user)}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Message
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/auth')}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Message
                      </motion.button>
                    )}
                  </div>

                  {user && isRegistered && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleScheduleAppointment(exhibitor.user)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <CalendarIcon size={14} className="mr-1" />
                        Book Meeting
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Schedule</h2>
            <div className="space-y-6">
              {sessions.map((session) => (
                <motion.div
                  key={session._id || session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <User size={16} className="mr-2" />
                        <span className="font-medium">{session.speaker?.username || session.speaker || 'Unknown Speaker'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar size={16} className="mr-2" />
                        <span>{new Date(session.time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock size={16} className="mr-2" />
                        <span>{new Date(session.time).toLocaleTimeString()}</span>
                        <span className="ml-2 text-sm">({session.duration})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span>{session.location}</span>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {session.category}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{session.description}</p>

                  <div className="flex space-x-3">
                    {user ? (
                      isRegistered ? (
                        registeredSessions.includes(session._id) ? (
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center" disabled>
                            <CheckCircle size={16} className="mr-2" />
                            Registered
                          </button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSessionRegistration(session._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Register
                          </motion.button>
                        )
                      ) : (
                        <button
                          onClick={() => alert('You must be registered for the event to register for sessions.')}
                          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                        >
                          Register
                        </button>
                      )
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/auth')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Register
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/session/${session._id}`)}
                      className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </motion.button>

                    {user ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookmarkSession(session._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedSessions.includes(session._id)
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <Heart
                          size={20}
                          fill={bookmarkedSessions.includes(session._id) ? "currentColor" : "none"}
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/auth')}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        <Heart size={20} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'floorplan' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Floor Plan</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-center mb-6">
                <Building size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Interactive floor plan</p>
                <p className="text-sm text-gray-500 mt-2">
                  Browse available booths, find exhibitors, and navigate the venue
                </p>
              </div>

              {expo.floorPlan && expo.floorPlan.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 mb-6">
                  <div className="relative max-w-4xl mx-auto">
                    {/* Floor plan grid */}
                    <div className="grid grid-cols-10 gap-2 p-4 bg-white rounded-lg border">
                      {expo.floorPlan.map((booth) => (
                        <motion.div
                          key={booth.boothId}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.1 }}
                          className={`aspect-square rounded border-2 flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                            booth.available
                              ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                          }`}
                          style={{
                            gridColumn: `span ${Math.max(1, Math.floor(booth.size.width / 50))}`,
                            gridRow: `span ${Math.max(1, Math.floor(booth.size.height / 50))}`
                          }}
                          title={`Booth ${booth.boothId} - ${booth.available ? 'Available' : 'Occupied'}`}
                        >
                          <div className="text-center">
                            <div className="font-bold">{booth.boothId}</div>
                            <div className="text-xs opacity-75">
                              {booth.available ? 'Available' : 'Occupied'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center space-x-8 mt-6 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                        <span>Occupied</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 mb-6">
                  <div className="text-center">
                    <Building size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Floor plan not yet configured</p>
                    <p className="text-sm text-gray-500 mt-2">
                      The organizer will set up the floor plan soon
                    </p>
                  </div>
                </div>
              )}

              {/* Exhibitor List */}
              {exhibitors.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exhibitors by Booth</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exhibitors.map((exhibitor) => (
                      <motion.div
                        key={exhibitor._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exhibitor.company}</h4>
                            <p className="text-sm text-gray-600">{exhibitor.description}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                            Booth Available
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualExpoPage;
