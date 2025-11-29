import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const EventDiscovery = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedExhibitors, setSelectedExhibitors] = useState([]);

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
      const expos = response.data;

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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Discovery</h1>
          <p className="text-gray-600">Explore and find your next great event experience</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        {/* Basic Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events, exhibitors, locations, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: showAdvancedFilters ? 'auto' : 0,
            opacity: showAdvancedFilters ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
                {availableLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date (Upcoming First)</option>
                <option value="title">Title (A-Z)</option>
                <option value="location">Location</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={16} />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {filteredEvents.length} events found
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <Calendar className="text-white" size={48} />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600">
                  <Calendar size={16} className="inline mr-1" />
                  {formatDate(event.startDate)}
                </span>
              </div>

              {registeredEvents.includes(event._id) ? (
                <button
                  disabled
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Registered
                </button>
              ) : (
                <button
                  onClick={() => registerForEvent(event._id)}
                  disabled={registeringEvent === event._id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  {registeringEvent === event._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    'Register for Event'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventDiscovery;
