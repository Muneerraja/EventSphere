import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Tag,
  Star,
  Clock,
  TrendingUp,
  Heart,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  ChevronDown,
  Grid,
  List,
  Download,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';


const Expos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredExpos, setRegisteredExpos] = useState([]);
  const [registeringExpo, setRegisteringExpo] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ themes: [], locations: [] });

  // Advanced Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookmarkedExpos, setBookmarkedExpos] = useState([]);
  const [quickFilters, setQuickFilters] = useState([]);

  useEffect(() => {
    fetchExpos();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchFilteredExpos();
    }
  }, [searchQuery, selectedThemes, selectedLocations, dateRange, priceRange, sortBy, sortOrder]);

  const fetchExpos = async () => {
    try {
      const [exposResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/expos/public/expos`)
      ]);

      // Check user registration status if logged in
      if (user) {
        try {
          const attendeeResponse = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
          const attendeeData = attendeeResponse.data;
          setRegisteredExpos(attendeeData.registeredExpos?.map(expo => expo._id) || []);
          setBookmarkedExpos(attendeeData.bookmarkedExpos?.map(expo => expo._id) || []);
        } catch (attendeeError) {
          console.error('Error fetching attendee data:', attendeeError);
          setRegisteredExpos([]);
          setBookmarkedExpos([]);
        }
      }

      const exposData = exposResponse.data.expos || exposResponse.data || [];
      setExpos(exposData);
      setFilterOptions(exposResponse.data.filterOptions || { themes: [], locations: [] });
    } catch (error) {
      console.error('Error fetching expos:', error);
      setExpos([]);
      setFilterOptions({ themes: [], locations: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredExpos = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTheme !== 'all') params.append('theme', selectedTheme);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (dateRange !== 'all') {
        const today = new Date();
        let dateFrom, dateTo;

        switch (dateRange) {
          case 'today':
            dateFrom = today.toISOString().split('T')[0];
            dateTo = today.toISOString().split('T')[0];
            break;
          case 'week':
            const weekFrom = new Date(today);
            weekFrom.setDate(today.getDate() - today.getDay());
            dateFrom = weekFrom.toISOString().split('T')[0];
            const weekTo = new Date(weekFrom);
            weekTo.setDate(weekFrom.getDate() + 6);
            dateTo = weekTo.toISOString().split('T')[0];
            break;
          case 'month':
            const monthFrom = new Date(today.getFullYear(), today.getMonth(), 1);
            dateFrom = monthFrom.toISOString().split('T')[0];
            const monthTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            dateTo = monthTo.toISOString().split('T')[0];
            break;
          case 'upcoming':
            dateFrom = today.toISOString().split('T')[0];
            break;
        }

        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos/public/expos?${params}`);
      setExpos(response.data.expos || response.data || []);
    } catch (error) {
      console.error('Error fetching filtered expos:', error);
    }
  };

  const handleEventRegistration = async (expoId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setRegisteringExpo(expoId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/attendees/register-expo`, {
        expoId
      });

      setRegisteredExpos(prev => [...prev, expoId]);
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event. Please try again.');
    } finally {
      setRegisteringExpo(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedThemes([]);
    setSelectedLocations([]);
    setDateRange('all');
    setPriceRange('all');
    setSortBy('date');
    setSortOrder('desc');
    setQuickFilters([]);
  };

  const handleThemeToggle = (theme) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleBookmarkToggle = async (expoId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (bookmarkedExpos.includes(expoId)) {
        // Unbookmark
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendees/unbookmark-expo/${expoId}`);
        setBookmarkedExpos(prev => prev.filter(id => id !== expoId));
      } else {
        // Bookmark
        await axios.post(`${import.meta.env.VITE_API_URL}/attendees/bookmark-expo`, { expoId });
        setBookmarkedExpos(prev => [...prev, expoId]);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const applyQuickFilter = (filterType) => {
    const today = new Date();
    switch (filterType) {
      case 'featured':
        setQuickFilters(['featured']);
        setDateRange('upcoming');
        setSortBy('date');
        setSortOrder('asc');
        break;
      case 'today':
        setQuickFilters(['today']);
        setDateRange('today');
        break;
      case 'week':
        setQuickFilters(['week']);
        setDateRange('week');
        break;
      case 'free':
        setQuickFilters(['free']);
        setPriceRange('free');
        break;
      case 'nearby':
        setQuickFilters(['nearby']);
        // Could implement location-based filtering
        break;
    }
  };

  const exportResults = () => {
    const data = expos.map(expo => ({
      Title: expo.title,
      Date: formatDate(expo.date),
      Location: expo.location,
      Theme: expo.theme,
      Organizer: expo.organizer?.username || 'EventSphere',
      Description: expo.description
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expos-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (date) => {
    const eventDate = new Date(date);
    const today = new Date();

    if (eventDate < today) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Past Event</span>;
    } else if (eventDate.toDateString() === today.toDateString()) {
      return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Today</span>;
    } else {
      return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Upcoming</span>;
    }
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
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
              Discover{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Amazing Expos
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore the most exciting upcoming events featuring cutting-edge innovations,
              breakthrough technologies, and industry-leading expertise from around the world.
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{expos.length}+</div>
                <div className="text-sm text-gray-600">Upcoming Events</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Industries</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">1000+</div>
                <div className="text-sm text-gray-600">Attendees</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Advanced Filter System */}
      <section className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyQuickFilter('featured')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('featured')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Star size={14} className="inline mr-2" />
              Featured
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyQuickFilter('today')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('today')
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Zap size={14} className="inline mr-2" />
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyQuickFilter('week')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('week')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Calendar size={14} className="inline mr-2" />
              This Week
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyQuickFilter('free')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('free')
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Tag size={14} className="inline mr-2" />
              Free Events
            </motion.button>
          </div>

          {/* Main Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Enhanced Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search events by name, description, organizer, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              />
            </div>

            {/* Advanced Filter Controls */}
            <div className="flex items-center space-x-3">
              {/* Multi-select Themes */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center"
                >
                  <SlidersHorizontal size={18} className="text-gray-600 mr-2" />
                  <span className="text-gray-700 font-medium">Filters</span>
                  <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>

              {/* Sort Controls */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 hover:shadow-md transition-all"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List size={18} />
                </motion.button>
              </div>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportResults}
                className="px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md transition-all text-gray-600 hover:text-blue-600"
                title="Export results"
              >
                <Download size={18} />
              </motion.button>

              {/* Clear Filters */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all text-red-600 hover:text-red-700"
              >
                <X size={18} />
              </motion.button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Themes Multi-select */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-blue-500" />
                    Industries
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.themes?.map(theme => (
                      <label key={theme} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedThemes.includes(theme)}
                          onChange={() => handleThemeToggle(theme)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{theme}</span>
                      </label>
                    )) || []}
                  </div>
                </div>

                {/* Locations Multi-select */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin size={16} className="mr-2 text-green-500" />
                    Locations
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.locations?.map(location => (
                      <label key={location} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationToggle(location)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">{location}</span>
                      </label>
                    )) || []}
                  </div>
                </div>

                {/* Date & Price Filters */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock size={16} className="mr-2 text-purple-500" />
                    Date Range
                  </h4>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(selectedThemes.length > 0 || selectedLocations.length > 0 || dateRange !== 'all' || searchQuery) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedThemes.map(theme => (
                      <motion.span
                        key={theme}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {theme}
                        <X
                          size={12}
                          className="ml-1 cursor-pointer hover:text-blue-900"
                          onClick={() => handleThemeToggle(theme)}
                        />
                      </motion.span>
                    ))}
                    {selectedLocations.map(location => (
                      <motion.span
                        key={location}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                      >
                        {location}
                        <X
                          size={12}
                          className="ml-1 cursor-pointer hover:text-green-900"
                          onClick={() => handleLocationToggle(location)}
                        />
                      </motion.span>
                    ))}
                    {dateRange !== 'all' && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : 'Upcoming'}
                        <X
                          size={12}
                          className="ml-1 cursor-pointer hover:text-purple-900"
                          onClick={() => setDateRange('all')}
                        />
                      </motion.span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Expos Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {expos.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-gray-400" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search criteria or check back later for new exciting events.</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
                  <p className="text-gray-600 mt-1">{expos.length} events found</p>
                </div>
              </div>

              <motion.div
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {expos.map((expo) => (
                  <motion.div
                    key={expo._id}
                    variants={fadeInUp}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Header with theme badge and bookmark */}
                    <div className="relative">
                      <div className="h-3 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full text-xs font-semibold shadow-sm">
                          {expo.theme}
                        </span>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(expo.date)}
                          {user && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleBookmarkToggle(expo._id)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                bookmarkedExpos.includes(expo._id)
                                  ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                                  : 'bg-white/20 text-gray-600 hover:bg-white/40'
                              }`}
                            >
                              <Heart
                                size={16}
                                fill={bookmarkedExpos.includes(expo._id) ? "currentColor" : "none"}
                              />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                        {expo.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {expo.description}
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Calendar size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{formatDate(expo.date)}</div>
                            {getDaysUntil(expo.date) && (
                              <div className="text-xs text-gray-500">{getDaysUntil(expo.date)}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <MapPin size={14} className="text-green-600" />
                          </div>
                          <span>{expo.location}</span>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Users size={14} className="text-purple-600" />
                          </div>
                          <span>Organized by {expo.organizer?.username || 'EventSphere'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Link
                            to={`/expos/${expo._id}`}
                            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                          >
                            View Details
                          </Link>
                        </motion.div>

                        {user ? (
                          registeredExpos.includes(expo._id) ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                              disabled
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Registered
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleEventRegistration(expo._id)}
                              disabled={registeringExpo === expo._id}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                            >
                              {registeringExpo === expo._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <Plus size={16} className="mr-2" />
                                  Register
                                </>
                              )}
                            </motion.button>
                          )
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/auth')}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                          >
                            Register
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Your Next Big Event?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful event organizers who trust EventSphere
              to power their most important events.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/auth"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-2xl"
              >
                <span>Start Organizing Today</span>
                <TrendingUp size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Expos;
