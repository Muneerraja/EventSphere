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
  SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';
import dummyData from '/dummydata.js';

const EventDiscovery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchEventsData();
  }, [searchQuery, filterCategory, filterDate, filterLocation, sortBy]);

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

        // Mock properties (would come from backend in real implementation)
        capacity: 1000 + Math.floor(Math.random() * 1000),
        registered: Math.floor(Math.random() * 500) + 100,
        price: { min: 25, max: 150 },
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 10,
        tags: [expo.theme],
        featured: Math.random() > 0.6
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);

      // Fallback to mock data from dummydata.js
      const fallbackEvents = dummyData.expos.map(expo => ({
        _id: expo._id,
        title: expo.title,
        date: expo.date,
        location: expo.location,
        description: expo.description,
        theme: expo.theme,
        category: expo.theme,
        startDate: new Date(expo.date).toISOString().split('T')[0],
        endDate: new Date(expo.date).toISOString().split('T')[0],
        capacity: 1000 + Math.floor(Math.random() * 1000),
        registered: Math.floor(Math.random() * 500) + 100,
        price: { min: 25, max: 150 },
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 10,
        tags: [expo.theme],
        featured: Math.random() > 0.6
      }));
      setEvents(fallbackEvents);
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search events, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
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
              <option value="karachi">Karachi</option>
              <option value="islamabad">Islamabad</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  <Calendar size={16} className="inline mr-1" />
                  {formatDate(event.startDate)}
                </span>
                <span className="text-lg font-bold text-gray-900">${event.price.min}</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventDiscovery;
