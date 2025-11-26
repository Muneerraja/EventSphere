import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Tag, Eye, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ViewExpo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpoDetails();
  }, [id]);

  const fetchExpoDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos/${id}`);
      setExpo(response.data);
    } catch (error) {
      console.error('Error fetching expo details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expo? This action cannot be undone.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/expos/${id}`);
        alert('Expo deleted successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting expo:', error);
        alert('Failed to delete expo. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Expo Not Found</h2>
        <p className="text-gray-600">The expo you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">View Expo</h1>
            <p className="text-gray-600">Detailed information about your event</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/dashboard/organizer/expo/${id}/edit`)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Edit3 size={16} />
            <span>Edit Expo</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete Expo</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Expo Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Hero Image */}
        {expo.image && (
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/${expo.image}`}
              alt={expo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{expo.title}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  new Date(expo.date) >= new Date() ? 'bg-green-100 text-green-800' :
                  new Date(expo.date) < new Date() ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {new Date(expo.date) >= new Date() ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Event Date</p>
                      <p className="font-medium">{new Date(expo.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      <p className="text-sm text-gray-600">{new Date(expo.date).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{expo.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Attendees</p>
                      <p className="font-medium">{(expo.totalAttendees || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Tag className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Theme</p>
                      <p className="font-medium">{expo.theme || 'No theme specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{expo.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Event Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exhibitors</span>
                    <span className="font-medium">{expo.totalExhibitors || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">${(expo.revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions</span>
                    <span className="font-medium">{expo.totalSessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">{new Date(expo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floor Plan - Placeholder for now */}
      {(expo.floorPlan && expo.floorPlan.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Floor Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expo.floorPlan.map((booth, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  booth.available
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="font-medium text-sm">{booth.boothId}</div>
                <div className={`text-xs ${
                  booth.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {booth.available ? 'Available' : 'Occupied'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ViewExpo;
