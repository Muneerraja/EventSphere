import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyExpos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyExpos();
  }, []);

  const fetchMyExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos`);
      setExpos(response.data);
    } catch (error) {
      console.error('Error fetching expos:', error);
      setExpos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (expoId) => navigate(`/dashboard/organizer/expo/${expoId}/view`);
  const handleEdit = (expoId) => navigate(`/dashboard/organizer/expo/${expoId}/edit`);
  const handleDelete = async (expoId, expoTitle) => {
    if (window.confirm(`Are you sure you want to delete "${expoTitle}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/expos/${expoId}`);
        alert('Expo deleted successfully!');
        fetchMyExpos();
      } catch (error) {
        console.error('Error deleting expo:', error);
        alert('Failed to delete expo. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center sm:text-left">
        My Expos
      </h1>

      {expos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          You haven't created any expos yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {expos.map((expo, index) => (
            <motion.div
              key={expo._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300 w-full"
            >
              {/* Expo Info */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 truncate">
                  {expo.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{new Date(expo.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{expo.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2 flex-shrink-0" />
                  <span>{(expo.totalAttendees || 0).toLocaleString()} attendees</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-4 space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleView(expo._id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-1"
                  title="View Expo"
                >
                  <Eye className="mx-auto" size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(expo._id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-1"
                  title="Edit Expo"
                >
                  <Edit className="mx-auto" size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(expo._id, expo.title)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-1"
                  title="Delete Expo"
                >
                  <Trash2 className="mx-auto" size={20} />
                </motion.button>
              </div>

              {/* Manage Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  Manage Sessions
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                  Manage Exhibitors
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyExpos;
