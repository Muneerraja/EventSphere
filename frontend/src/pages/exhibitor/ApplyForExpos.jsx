import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, FileText, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ApplyForExpos = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpo, setSelectedExpo] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    products: '',
    description: ''
  });
  const [logo, setLogo] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchExpos();
  }, []);

  const fetchExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos`);
      setExpos(response.data);
    } catch (error) {
      console.error('Error fetching expos:', error);
      // Set empty array on error
      setExpos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/applications/`, {
        type: 'exhibitor',
        expoId: selectedExpo._id,
        company: formData.company,
        products: formData.products.split(',').map(p => p.trim()),
        description: formData.description
      });

      alert('Application submitted successfully!');
      setSelectedExpo(null);
      setFormData({ company: '', products: '', description: '' });
      setLogo(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Apply for Expos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expos.map((expo, index) => (
          <motion.div
            key={expo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{expo.title}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar size={16} className="mr-2" />
                <span>{new Date(expo.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={16} className="mr-2" />
                <span>{expo.location}</span>
              </div>
              <p className="text-sm text-gray-600">{expo.description}</p>
            </div>

            <button
              onClick={() => setSelectedExpo(expo)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
            >
              <Send size={16} className="mr-2" />
              Apply Now
            </button>
          </motion.div>
        ))}
      </div>

      {selectedExpo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Apply for {selectedExpo.title}</h2>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Products/Services</label>
                <input
                  type="text"
                  name="products"
                  value={formData.products}
                  onChange={handleInputChange}
                  placeholder="Comma separated list"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedExpo(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:bg-blue-400"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplyForExpos;
