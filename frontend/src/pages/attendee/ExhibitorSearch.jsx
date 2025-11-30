import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building,
  Mail,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  Star,
  Filter,
  Tag,
  X,
  SlidersHorizontal,
  Grid,
  List,
  Heart,
  Phone,
  Globe,
  Award,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ExhibitorSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [registeredExpos, setRegisteredExpos] = useState([]);
  const [selectedExpo, setSelectedExpo] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterBooth, setFilterBooth] = useState('');
  const [sortBy, setSortBy] = useState('company');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [floorPlan, setFloorPlan] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedExpo) {
      fetchExhibitors();
    }
  }, [selectedExpo, searchQuery, filterCategory]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${user._id}`);
      const attendeeData = response.data;

      const expos = attendeeData.registeredExpos || [];
      setRegisteredExpos(expos);

      // Auto-select first expo if available
      if (expos.length > 0) {
        setSelectedExpo(expos[0]._id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setRegisteredExpos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExhibitors = async () => {
    try {
      setLoading(true);

      // Use the enhanced search API that supports category filtering
      const params = new URLSearchParams();
      if (searchQuery) params.append('keywords', searchQuery);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (selectedExpo) params.append('expoId', selectedExpo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/exhibitors/search?${params}`
      );

      const filteredExhibitors = response.data.exhibitors || [];

      // Add logo URLs and format data
      const formattedExhibitors = filteredExhibitors.map(exhibitor => ({
        ...exhibitor,
        logo: exhibitor.logo
          ? `${import.meta.env.VITE_API_URL}/uploads/${exhibitor.logo}`
          : "/api/placeholder/100/100",
        company: exhibitor.company || 'Unknown Company',
        description: exhibitor.description || 'No description available',
        products: exhibitor.products || [],
        contact: exhibitor.contact || 'No contact info'
      }));

      setExhibitors(formattedExhibitors);
    } catch (error) {
      console.error('Error fetching exhibitors:', error);
      setExhibitors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageExhibitor = (exhibitor) => {
    // Navigate to messages page with the exhibitor's user ID
    navigate(`/dashboard/messages?user=${exhibitor.user}`);
  };

  const handleViewProfile = (exhibitor) => {
    navigate(`/dashboard/attendee/exhibitor/${exhibitor._id}`);
  };

  const handleScheduleAppointment = (exhibitor) => {
    navigate(`/dashboard/attendee/appointment/${exhibitor._id}`);
  };

  if (loading && registeredExpos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterLocation('all');
    setFilterBooth('');
    setSortBy('company');
  };

  const toggleFavorite = (exhibitorId) => {
    setFavorites(prev =>
      prev.includes(exhibitorId)
        ? prev.filter(id => id !== exhibitorId)
        : [...prev, exhibitorId]
    );
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
            <h1 className="text-3xl font-bold mb-2">Exhibitor Directory</h1>
            <p className="text-blue-100">Discover exhibitors, find products, and schedule meetings</p>
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
          <div className="text-2xl font-bold text-green-600">{exhibitors.length}</div>
          <div className="text-sm text-gray-600">Total Exhibitors</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{filterCategory !== 'all' ? exhibitors.filter(e => e.products?.includes(filterCategory)).length : exhibitors.length}</div>
          <div className="text-sm text-gray-600">Filtered Results</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{favorites.length}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{registeredExpos.length}</div>
          <div className="text-sm text-gray-600">Your Events</div>
        </div>
      </motion.div>

      {/* Premium Advanced Filter System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg rounded-2xl p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Expo Selector */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={selectedExpo}
              onChange={(e) => setSelectedExpo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm"
            >
              <option value="">Choose an event to explore exhibitors...</option>
              {registeredExpos.map(expo => (
                <option key={expo._id} value={expo._id}>
                  {expo.title} - {new Date(expo.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Enhanced Search */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Exhibitors
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by company name, products, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center"
            >
              <SlidersHorizontal size={18} className="text-gray-600 mr-2" />
              <span className="text-gray-700 font-medium">Filters</span>
            </motion.button>

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

            {/* Clear Filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all text-red-600 hover:text-red-700"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag size={16} className="mr-2 text-blue-500" />
                  Industry Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Industries</option>
                  {['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Automotive', 'Energy', 'Food & Beverage', 'Construction', 'Real Estate', 'Transportation', 'Entertainment', 'Tourism', 'Agriculture', 'Pharmaceuticals', 'Telecommunications', 'Consulting', 'Legal', 'Insurance'].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Booth Number Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Building size={16} className="mr-2 text-green-500" />
                  Booth Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., A101, B205"
                  value={filterBooth}
                  onChange={(e) => setFilterBooth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Award size={16} className="mr-2 text-purple-500" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="company">Company Name</option>
                  <option value="booth">Booth Number</option>
                  <option value="category">Category</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap size={16} className="mr-2 text-orange-500" />
                  Quick Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilterCategory('Technology')}
                    className="w-full text-left px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                  >
                    🖥️ Tech Companies
                  </button>
                  <button
                    onClick={() => setFilterCategory('Healthcare')}
                    className="w-full text-left px-3 py-1 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                  >
                    🏥 Healthcare
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Category Navigation */}
      {selectedExpo && (
        <section className="py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Industry</h2>
            <p className="text-gray-600">Find exhibitors in your industry of interest</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6">
            {[
              { name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
              { name: 'Healthcare', icon: '🏥', color: 'from-green-500 to-emerald-500' },
              { name: 'Finance', icon: '💰', color: 'from-yellow-500 to-orange-500' },
              { name: 'Education', icon: '📚', color: 'from-purple-500 to-pink-500' },
              { name: 'Manufacturing', icon: '🏭', color: 'from-gray-500 to-slate-500' },
              { name: 'Retail', icon: '🛍️', color: 'from-red-500 to-pink-500' },
              { name: 'Automotive', icon: '🚗', color: 'from-blue-600 to-indigo-600' },
              { name: 'Energy', icon: '⚡', color: 'from-yellow-400 to-orange-400' },
              { name: 'Food & Beverage', icon: '🍽️', color: 'from-orange-500 to-red-500' },
              { name: 'Construction', icon: '🏗️', color: 'from-stone-500 to-gray-500' }
            ].map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilterCategory(category.name);
                  setShowFilters(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group p-6 bg-gradient-to-br ${category.color} hover:shadow-xl text-white rounded-xl transition-all duration-300`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{category.icon}</span>
                  <span className="text-sm font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Exhibitors Display */}
      {!selectedExpo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center"
        >
          <Building size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Select an Event</h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Choose an event you're registered for to discover and connect with exhibitors
          </p>
          <div className="flex justify-center space-x-4">
            <Globe size={24} className="text-blue-500" />
            <span className="text-gray-500">Interactive floor plans available</span>
          </div>
        </motion.div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      ) : exhibitors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center"
        >
          <Search size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Exhibitors Found</h3>
          <p className="text-gray-600 text-lg mb-8">
            Try adjusting your search criteria or browse different categories
          </p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <>
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-gray-600">
              <span className="font-medium">{exhibitors.length}</span> exhibitors found
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <List size={16} />
              </button>
            </div>
          </motion.div>

          {/* Exhibitors Grid/List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }
          >
            {exhibitors.map((exhibitor, index) => (
              <motion.div
                key={exhibitor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Company Header */}
                <div className={`${viewMode === 'list' ? 'w-1/3 p-6' : 'p-4'} bg-gradient-to-r from-blue-500 to-purple-600`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {exhibitor.logo ? (
                        <img src={exhibitor.logo} alt={exhibitor.company} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Building className="text-white" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{exhibitor.company}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 bg-green-500/20 text-green-100 text-xs rounded-full">
                          Verified Exhibitor
                        </span>
                        {favorites.includes(exhibitor._id) && (
                          <Heart size={12} className="text-red-400 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`${viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}`}>
                  {viewMode === 'grid' && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exhibitor.description}</p>
                  )}

                  {/* Products */}
                  {exhibitor.products && exhibitor.products.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Products & Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {exhibitor.products.slice(0, viewMode === 'grid' ? 3 : 5).map((product, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {product}
                          </span>
                        ))}
                        {exhibitor.products.length > (viewMode === 'grid' ? 3 : 5) && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{exhibitor.products.length - (viewMode === 'grid' ? 3 : 5)} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact & Booth Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-blue-500" />
                      <span className="truncate">{exhibitor.contact}</span>
                    </div>
                    {exhibitor.boothNumber && (
                      <div className="flex items-center">
                        <Building size={14} className="mr-2 text-green-500" />
                        <span>Booth {exhibitor.boothNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`space-y-3 ${viewMode === 'list' ? 'flex items-center space-x-3 space-y-0' : ''}`}>
                    <button
                      onClick={() => handleViewProfile(exhibitor)}
                      className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${
                        viewMode === 'list' ? 'flex-1' : 'w-full'
                      }`}
                    >
                      <Eye size={16} className="mr-2" />
                      View Profile
                    </button>

                    <div className={`grid grid-cols-2 gap-3 ${viewMode === 'list' ? 'flex-1 grid-cols-1 flex' : 'w-full'}`}>
                      <button
                        onClick={() => handleMessageExhibitor(exhibitor)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                      >
                        <MessageCircle size={14} className="mr-2" />
                        Message
                      </button>
                      <button
                        onClick={() => handleScheduleAppointment(exhibitor)}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                      >
                        <Calendar size={14} className="mr-2" />
                        Book Meeting
                      </button>
                    </div>

                    {viewMode === 'list' && (
                      <button
                        onClick={() => toggleFavorite(exhibitor._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.includes(exhibitor._id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <Heart size={16} fill={favorites.includes(exhibitor._id) ? "currentColor" : "none"} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ExhibitorSearch;
