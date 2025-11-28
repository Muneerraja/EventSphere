import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Users, Calendar, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import axios from 'axios';

const MyBooths = () => {
  const { user } = useAuth();
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyBooths();
    }
  }, [user]);

  const fetchMyBooths = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/booths`);
      setBooths(response.data);
    } catch (error) {
      console.error('Error fetching booths:', error);
      // Set empty array on error
      setBooths([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Booths</h1>

      {booths.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No booths assigned</h3>
          <p className="mt-1 text-sm text-gray-500">Apply for expos to get booth assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {booths.map((booth, index) => (
            <motion.div
              key={booth._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Booth {booth.space}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>{booth.expo?.title}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span>{booth.expo?.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>{booth.products.join(', ')}</span>
                  </div>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                <p className="text-sm text-gray-600">{booth.contact}</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                  View Full Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooths;
