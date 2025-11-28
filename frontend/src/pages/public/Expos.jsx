import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Expos = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchExpos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos/public/expos`);
        setExpos(response.data);
      } catch (error) {
        console.error('Error fetching expos:', error);
        // Set empty array on error
        setExpos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpos();
  }, []);

  // Extract unique themes for dynamic filters
  const availableThemes = [...new Set(expos.map(expo => expo.theme))];

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

  const filteredExpos = filter === 'all'
    ? expos
    : expos.filter(expo => expo.theme.toLowerCase().includes(filter));

  const filterOptions = ['all', ...availableThemes];

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
              Upcoming{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Expos
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover the most exciting upcoming events featuring the latest innovations,
              breakthrough technologies, and industry-leading expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {filterOptions.map((option) => (
              <motion.button
                key={option}
                onClick={() => setFilter(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  filter === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Expos Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          >
            {filteredExpos.length === 0 ? (
              <motion.div
                variants={fadeInUp}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="text-gray-400" size={32} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No events found</h3>
                <p className="text-gray-500">Try adjusting your filter or check back later for new events.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExpos.map((expo) => (
                  <motion.div
                    key={expo._id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {expo.theme}
                        </span>
          <div className="flex items-center text-gray-500 text-sm">
                          <Eye size={16} className="mr-1" />
                          0 views
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {expo.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {expo.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={16} className="mr-2 text-blue-600" />
                          {formatDate(expo.date)}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin size={16} className="mr-2 text-green-600" />
                          {expo.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users size={16} className="mr-2 text-purple-600" />
                          Organized by {expo.organizer?.username || 'Unknown Organizer'}
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
                            className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                          >
                            View Details
                          </Link>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Link
                            to={`/auth?expo=${expo._id}`}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                          >
                            Register Now
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Host Your Event?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of organizers who trust EventSphere to power their successful expos.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/auth"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Get Started Today
                <Calendar size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Expos;
