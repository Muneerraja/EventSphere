import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building,
  Mail,
  Eye
} from 'lucide-react';
import axios from 'axios';



const ExhibitorSearch = () => {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    fetchExhibitorsData();
  }, [searchQuery, filterCategory]);

  const fetchExhibitorsData = async () => {
    try {
      const params = {};
      if (searchQuery) params.keywords = searchQuery;
      if (filterCategory !== 'all') params.category = filterCategory;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/exhibitors/public/search`,
        { params }
      );

      const apiExhibitors = response.data.map(exhibitor => ({
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

    } catch (error) {
      console.error('Error fetching exhibitors:', error);
      setExhibitors([]);
    } finally {
      setLoading(false);
    }
  };

  // FIXED loading return
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover innovative companies and exhibitors showcasing cutting-edge solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-gray-50 rounded-xl shadow-lg border border-gray-100 p-8"
          >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Search Companies
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by company, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="technology">Technology</option>
                </select>
              </div>

            </div>

          </motion.div>
        </div>
      </section>

      {/* Exhibitors Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {exhibitors.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-20"
            >
              <Building size={64} className="mx-auto text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No exhibitors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >

              {exhibitors.map((exhibitor) => (
              <motion.div
                key={exhibitor._id}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Building className="text-white" size={20} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exhibitor.company}
                        </h3>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            exhibitor.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : exhibitor.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {exhibitor.status}
                        </span>

                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{exhibitor.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-700">
                      <strong>Products:</strong> {exhibitor.products.join(', ')}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2" />
                      <span>{exhibitor.contact}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center"
                    >
                      <Eye size={16} className="mr-2" />
                      View Profile
                    </motion.button>
                  </div>

                </div>

              </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
};

export default ExhibitorSearch;
