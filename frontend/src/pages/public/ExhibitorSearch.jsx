import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building,
  Mail,
  Eye,
  MessageCircle,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Users,
  Package,
  Star,
  Award,
  TrendingUp,
  Briefcase,
  Heart,
  BookmarkCheck,
  SlidersHorizontal,
  ChevronDown,
  Grid,
  List,
  Download,
  Zap,
  Tag,
  MapPin,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';


const ExhibitorSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ products: [] });

  // Advanced Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [sortBy, setSortBy] = useState('company');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookmarkedExhibitors, setBookmarkedExhibitors] = useState([]);
  const [quickFilters, setQuickFilters] = useState([]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Debounced search function
  const fetchExhibitorsData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('keywords', searchQuery);
      if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));
      if (selectedLocations.length > 0) params.append('locations', selectedLocations.join(','));
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/exhibitors/public/search?${params}`
      );

      const apiExhibitors = (response.data.exhibitors || response.data || []).map(exhibitor => ({
        ...exhibitor,
        logo: exhibitor.logo
          ? `${import.meta.env.VITE_API_URL}/uploads/${exhibitor.logo}`
          : "/api/placeholder/100/100",
        booths: [],
        company: exhibitor.company || 'Unknown Company',
        description: exhibitor.description || 'No description available',
        products: exhibitor.products || [],
        contact: exhibitor.contact || 'No contact info',
        status: exhibitor.status || 'approved'
      }));

      setExhibitors(apiExhibitors);
      setFilterOptions(response.data.filterOptions || { products: [] });

    } catch (error) {
      console.error('Error fetching exhibitors:', error);
      setExhibitors([]);
      setFilterOptions({ products: [] });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedLocations, sortBy, sortOrder]);

  // Load initial data
  useEffect(() => {
    fetchExhibitorsData();
  }, []);

  // Handle filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '' || selectedCategories.length > 0 || selectedLocations.length > 0 || sortBy !== 'company' || sortOrder !== 'desc') {
        fetchExhibitorsData();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategories, selectedLocations, sortBy, sortOrder, fetchExhibitorsData]);

  const handleMessageExhibitor = (exhibitor) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/dashboard/messages?user=${exhibitor.user}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSortBy('company');
    setSortOrder('desc');
    setQuickFilters([]);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleBookmarkToggle = async (exhibitorId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (bookmarkedExhibitors.includes(exhibitorId)) {
        setBookmarkedExhibitors(prev => prev.filter(id => id !== exhibitorId));
      } else {
        setBookmarkedExhibitors(prev => [...prev, exhibitorId]);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const applyQuickFilter = (filterType) => {
    switch (filterType) {
      case 'featured':
        setQuickFilters(['featured']);
        setSelectedCategories(['Technology', 'Healthcare', 'Finance']);
        break;
      case 'verified':
        setQuickFilters(['verified']);
        // Could filter by verified status
        break;
      case 'local':
        setQuickFilters(['local']);
        // Could implement location-based filtering
        break;
    }
  };

  const exportResults = () => {
    const data = exhibitors.map(exhibitor => ({
      Company: exhibitor.company,
      Description: exhibitor.description,
      Products: exhibitor.products.join(', '),
      Contact: exhibitor.contact,
      Status: exhibitor.status
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exhibitors-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">Verified</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold">Pending</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">Exhibitor</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
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
              Exhibitor{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Directory
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover innovative companies and industry leaders showcasing cutting-edge solutions,
              breakthrough technologies, and unparalleled expertise across all sectors.
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{exhibitors.length}+</div>
                <div className="text-sm text-gray-600">Exhibitors</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Industries</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">1000+</div>
                <div className="text-sm text-gray-600">Products</div>
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
              onClick={() => applyQuickFilter('verified')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('verified')
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Award size={14} className="inline mr-2" />
              Verified
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyQuickFilter('local')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                quickFilters.includes('local')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Globe size={14} className="inline mr-2" />
              Local
            </motion.button>
          </div>

          {/* Main Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Enhanced Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search exhibitors by company name, description, products, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              />
            </div>

            {/* Advanced Filter Controls */}
            <div className="flex items-center space-x-3">
              {/* Multi-select Categories */}
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
                <option value="company-asc">A-Z</option>
                <option value="company-desc">Z-A</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories Multi-select */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-blue-500" />
                    Categories
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Automotive', 'Energy', 'Food & Beverage', 'Construction', 'Real Estate', 'Transportation', 'Entertainment', 'Tourism', 'Agriculture', 'Pharmaceuticals', 'Telecommunications', 'Consulting', 'Legal', 'Insurance'].map(category => (
                      <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Locations Multi-select */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin size={16} className="mr-2 text-green-500" />
                    Locations
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'].map(location => (
                      <label key={location} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationToggle(location)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(selectedCategories.length > 0 || selectedLocations.length > 0 || searchQuery) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                      <motion.span
                        key={category}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {category}
                        <X
                          size={12}
                          className="ml-1 cursor-pointer hover:text-blue-900"
                          onClick={() => handleCategoryToggle(category)}
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
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Exhibitors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {exhibitors.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="text-gray-400" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No exhibitors found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search criteria or check back later for new exhibitors.</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Featured Exhibitors</h2>
                  <p className="text-gray-600 mt-1">{exhibitors.length} exhibitors found</p>
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
                {exhibitors.map((exhibitor) => (
                  <motion.div
                    key={exhibitor._id}
                    variants={fadeInUp}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Header with status badge and bookmark */}
                    <div className="relative">
                      <div className="h-3 bg-gradient-to-r from-green-500 to-blue-600"></div>
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-600 rounded-full text-xs font-semibold shadow-sm">
                          {exhibitor.status === 'approved' ? 'Verified' : exhibitor.status}
                        </span>
                        <div className="flex items-center space-x-2">
                          {user && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleBookmarkToggle(exhibitor._id)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                bookmarkedExhibitors.includes(exhibitor._id)
                                  ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                                  : 'bg-white/20 text-gray-600 hover:bg-white/40'
                              }`}
                            >
                              <Heart
                                size={16}
                                fill={bookmarkedExhibitors.includes(exhibitor._id) ? "currentColor" : "none"}
                              />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          {exhibitor.logo ? (
                            <img
                              src={exhibitor.logo}
                              alt={exhibitor.company}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          ) : (
                            <Building className="text-white" size={24} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                            {exhibitor.company}
                          </h3>
                          <p className="text-sm text-gray-500">Verified Exhibitor</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {exhibitor.description}
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                            <Package size={14} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Products & Services</h4>
                            <div className="flex flex-wrap gap-2">
                              {exhibitor.products.slice(0, 3).map((product, index) => (
                                <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                  {product}
                                </span>
                              ))}
                              {exhibitor.products.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  +{exhibitor.products.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 text-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Mail size={14} className="text-blue-600" />
                          </div>
                          <span className="truncate">{exhibitor.contact}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <button
                            onClick={() => navigate(`/exhibitor/${exhibitor.user}`)}
                            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                          >
                            View Profile
                          </button>
                        </motion.div>

                        {user ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleMessageExhibitor(exhibitor)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <MessageCircle size={16} className="mr-2" />
                            Message
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/auth')}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <MessageCircle size={16} className="mr-2" />
                            Contact
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
              Ready to Become an Exhibitor?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of successful companies showcasing their products and services
              to thousands of potential customers and partners.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-2xl"
              >
                <span>Apply to Exhibit</span>
                <Award size={24} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ExhibitorSearch;
