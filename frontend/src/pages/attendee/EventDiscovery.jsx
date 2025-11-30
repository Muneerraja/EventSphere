import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Star,
  Clock,
  Tag,
  Eye,
  Heart,
  ArrowRight,
  Grid,
  List,
  SlidersHorizontal,
  CheckCircle,
  BookOpen,
  TrendingUp,
  Zap,
  Award,
  Globe,
  Building
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const EventDiscovery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [registeredSessions, setRegisteredSessions] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [registeringSession, setRegisteringSession] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || event.location === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  useEffect(() => {
    if (user) {
      fetchEventsData();
      fetchRegisteredEvents();
    }
  }, [user, searchQuery, filterCategory, filterDate, filterLocation, sortBy]);

  const fetchEventsData = async () => {
    try {
      // Get expos from the public API
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos/public/expos`);
      const expos = response.data.expos || response.data || [];

      // Transform the data to match the filtering and sorting needs
      const transformedEvents = expos.map(expo => ({
        // Keep original Expo model properties
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,

        // Add computed properties for filtering
        category: expo.theme,
        startDate: new Date(expo.date).toISOString().split('T')[0],
        endDate: new Date(expo.date).toISOString().split('T')[0], // Assuming single day by default
      }));

      setEvents(transformedEvents);

      // Extract unique categories and locations for dynamic filters
      const categories = [...new Set(expos.map(expo => expo.theme))];
      const locations = [...new Set(expos.map(expo => expo.location))];
      setAvailableCategories(categories);
      setAvailableLocations(locations);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set empty array on error
      setEvents([]);
      setAvailableCategories([]);
      setAvailableLocations([]);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
      const attendeeData = response.data;
      const registered = attendeeData.registeredExpos ? attendeeData.registeredExpos.map(expo => expo._id) : [];
      setRegisteredEvents(registered);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      setRegisteredEvents([]);
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      setRegisteringEvent(eventId);
      await axios.post(`${import.meta.env.VITE_API_URL}/attendees/register-expo`, { expoId: eventId });

      // Update local state
      setRegisteredEvents(prev => [...prev, eventId]);

      // Show success message or update UI
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event. Please try again.');
    } finally {
      setRegisteringEvent(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'sessions', label: 'Sessions', icon: BookOpen, count: sessions.length }
  ];

  const toggleEventBookmark = async (eventId) => {
    try {
      const isBookmarked = bookmarkedEvents.includes(eventId);

      if (isBookmarked) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendees/unbookmark-expo/${eventId}`);
        setBookmarkedEvents(prev => prev.filter(id => id !== eventId));
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/attendees/bookmark-expo`, { expoId: eventId });
        setBookmarkedEvents(prev => [...prev, eventId]);
      }
    } catch (error) {
      console.error('Error toggling event bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const registerForSession = async (sessionId) => {
    try {
      setRegisteringSession(sessionId);
      // Implement session registration API call
      alert('Session registration functionality will be implemented with backend API');
    } catch (error) {
      console.error('Error registering for session:', error);
      alert('Failed to register for session. Please try again.');
    } finally {
      setRegisteringSession(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-700 text-white rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event & Session Discovery</h1>
            <p className="text-blue-100">Explore upcoming events and discover sessions that match your interests</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{events.length}</div>
          <div className="text-sm text-gray-600">Available Events</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
          <div className="text-sm text-gray-600">Available Sessions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{registeredEvents.length}</div>
          <div className="text-sm text-gray-600">My Registrations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{bookmarkedEvents.length + bookmarkedSessions.length}</div>
          <div className="text-sm text-gray-600">Bookmarked Items</div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={20} />
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

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'events' ? 'events' : 'sessions'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm shadow-sm"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center"
              >
                <SlidersHorizontal size={18} className="text-gray-600 mr-2" />
                <span className="text-gray-700 font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Location</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">All Locations</option>
                    {availableLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Date Range</label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="date">Date (Upcoming First)</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="location">Location</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'events' && (
            <>
              {/* Category Navigation */}
              <section className="py-8">
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Browse by Industry</h2>
                  <p className="text-gray-600 text-sm">Find events in your area of interest</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
                    { name: 'Healthcare', icon: '🏥', color: 'from-green-500 to-emerald-500' },
                    { name: 'Finance', icon: '💰', color: 'from-yellow-500 to-orange-500' },
                    { name: 'Education', icon: '📚', color: 'from-purple-500 to-pink-500' },
                    { name: 'Manufacturing', icon: '🏭', color: 'from-gray-500 to-slate-500' }
                  ].map((category, index) => (
                    <motion.button
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterCategory(category.name)}
                      className={`group p-4 bg-gradient-to-br ${category.color} hover:shadow-xl text-white rounded-xl transition-all duration-300`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-xs font-medium text-center leading-tight">
                          {category.name}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Event Header */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Calendar size={32} className="mx-auto mb-2" />
                        <div className="text-sm font-medium">{formatDate(event.startDate)}</div>
                      </div>
                      <button
                        onClick={() => toggleEventBookmark(event._id)}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                          bookmarkedEvents.includes(event._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart size={16} fill={bookmarkedEvents.includes(event._id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 text-green-500" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-2 text-blue-500" />
                          <span>50+ Attendees</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/expo/${event._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        {registeredEvents.includes(event._id) ? (
                          <button
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            disabled
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Registered
                          </button>
                        ) : (
                          <button
                            onClick={() => registerForEvent(event._id)}
                            disabled={registeringEvent === event._id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            {registeringEvent === event._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                Registering...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} className="mr-1" />
                                Register
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sessions' && (
            <div>
              {/* Sessions will be implemented when backend session data is available */}
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Session Discovery Coming Soon</h3>
                <p className="text-gray-600 mb-6">Individual session registration and discovery will be available once events are scheduled</p>
                <button
                  onClick={() => setActiveTab('events')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Events Instead
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EventDiscovery;
