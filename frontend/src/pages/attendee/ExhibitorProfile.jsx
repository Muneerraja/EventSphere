import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Star,
  MessageCircle,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ExhibitorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibitor, setExhibitor] = useState(null);
  const [booths, setBooths] = useState([]);
  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchExhibitorProfile();
  }, [id]);

  const fetchExhibitorProfile = async () => {
    try {
      // Fetch exhibitor details
      const exhibitorResponse = await axios.get(`${import.meta.env.VITE_API_URL}/exhibitors/${id}`);
      const exhibitorData = exhibitorResponse.data;

      // Fetch booths for this exhibitor
      const boothsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/booths/exhibitor/${id}`);
      const boothsData = boothsResponse.data;

      // Get expo information from the first booth (assuming all booths are for the same expo)
      let expoData = null;
      if (boothsData.length > 0) {
        const expoResponse = await axios.get(`${import.meta.env.VITE_API_URL}/expos/${boothsData[0].expo}`);
        expoData = expoResponse.data;
      }

      setExhibitor({
        ...exhibitorData,
        logo: exhibitorData.logo
          ? `${import.meta.env.VITE_API_URL}/uploads/${exhibitorData.logo}`
          : "/api/placeholder/100/100"
      });
      setBooths(boothsData);
      setExpo(expoData);
    } catch (error) {
      console.error('Error fetching exhibitor profile:', error);
      setExhibitor(null);
      setBooths([]);
      setExpo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/dashboard/messages?user=${exhibitor.user}`);
  };

  const handleScheduleAppointment = () => {
    navigate(`/dashboard/attendee/appointment/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Exhibitor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{exhibitor.company}</h1>
              <p className="text-blue-100">Exhibitor Profile</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center"
            >
              <MessageCircle size={18} className="mr-2" />
              Send Message
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScheduleAppointment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center"
            >
              <Calendar size={18} className="mr-2" />
              Book Meeting
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{exhibitor.company}</h2>
                  <p className="text-gray-600 mb-4">{exhibitor.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <span>{exhibitor.contact}</span>
                    </div>
                    {exhibitor.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe size={16} className="mr-2" />
                        <a
                          href={exhibitor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          {exhibitor.website}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products/Services */}
            {exhibitor.products && exhibitor.products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Products & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exhibitor.products.map((product, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                    >
                      <span className="text-blue-800 font-medium">{product}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* About Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">About the Company</h3>
              <div className="prose max-w-none text-gray-700">
                <p>{exhibitor.description}</p>
                {exhibitor.companyDetails && (
                  <p className="mt-4">{exhibitor.companyDetails}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booth Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booth Information</h3>

              {booths.length === 0 ? (
                <div className="text-center py-4">
                  <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">No booth information available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {booths.map((booth, index) => (
                    <div key={booth._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Booth {booth.boothNumber}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booth.status === 'assigned'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booth.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2" />
                          <span>Size: {booth.size}</span>
                        </div>
                        {booth.location && (
                          <div className="flex items-center">
                            <Info size={14} className="mr-2" />
                            <span>{booth.location}</span>
                          </div>
                        )}
                      </div>

                      {expo && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Event:</p>
                          <p className="text-sm font-medium text-gray-900">{expo.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(expo.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span className="text-gray-700">{exhibitor.contact}</span>
                </div>
                {exhibitor.phone && (
                  <div className="flex items-center">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span className="text-gray-700">{exhibitor.phone}</span>
                  </div>
                )}
                {exhibitor.website && (
                  <div className="flex items-center">
                    <Globe size={16} className="mr-3 text-gray-400" />
                    <a
                      href={exhibitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleMessage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Send Message
                </button>
                <button
                  onClick={handleScheduleAppointment}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  <Calendar size={18} className="mr-2" />
                  Schedule Meeting
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorProfile;
