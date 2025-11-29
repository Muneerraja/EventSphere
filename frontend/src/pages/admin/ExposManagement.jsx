import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, X, Check, AlertTriangle, Eye, Upload, Grid3X3, PlusCircle, MinusCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ExposManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingExpo, setCreatingExpo] = useState(false);
  const [editingExpo, setEditingExpo] = useState(null);
  const [deletingExpo, setDeletingExpo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    theme: '',
    image: null
  });

  // Floor Plan State
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [floorPlan, setFloorPlan] = useState([]);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 8 });

  useEffect(() => {
    fetchExpos();
  }, []);

  const fetchExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos/`);
      setExpos(response.data);
    } catch (error) {
      console.error('Error fetching expos:', error);
      setExpos([]);
      setError('Failed to load expos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      date: '',
      location: '',
      description: '',
      theme: '',
      image: null
    });
    setCreatingExpo(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (expo) => {
    setFormData({
      title: expo.title,
      date: expo.date ? new Date(expo.date).toISOString().split('T')[0] : '',
      location: expo.location,
      description: expo.description,
      theme: expo.theme,
      image: null
    });

    // Load existing floor plan if available
    if (expo.floorPlan && expo.floorPlan.length > 0) {
      setFloorPlan(expo.floorPlan);

      // Calculate grid size from existing floor plan
      const maxX = Math.max(...expo.floorPlan.map(booth => booth.position.x)) + 1;
      const maxY = Math.max(...expo.floorPlan.map(booth => booth.position.y)) + 1;
      setGridSize({ rows: maxY, cols: maxX });
    } else {
      // Reset to default if no floor plan
      setFloorPlan([]);
      setGridSize({ rows: 5, cols: 8 });
    }

    setEditingExpo(expo);
    setError('');
    setSuccess('');
  };

  const handleDelete = (expo) => {
    setDeletingExpo(expo);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      setError('Title, date, and location are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('theme', formData.theme);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Include floor plan data if it exists
      if (floorPlan.length > 0) {
        formDataToSend.append('floorPlan', JSON.stringify(floorPlan));
      }

      if (editingExpo) {
        // Update existing expo
        await axios.put(`${import.meta.env.VITE_API_URL}/expos/${editingExpo._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Expo updated successfully');
      } else {
        // Create new expo
        await axios.post(`${import.meta.env.VITE_API_URL}/expos/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Expo created successfully');
      }

      // Refresh expos list
      await fetchExpos();

      // Reset floor plan state
      setFloorPlan([]);
      setGridSize({ rows: 5, cols: 8 });
      setShowFloorPlan(false);

      // Close modal
      setCreatingExpo(false);
      setEditingExpo(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving expo:', error);
      setError(error.response?.data?.error || 'Failed to save expo');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpo) return;

    setDeleting(true);
    setError('');

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/expos/${deletingExpo._id}`);
      setSuccess('Expo deleted successfully');

      // Remove from local state
      setExpos(expos.filter(expo => expo._id !== deletingExpo._id));
      setDeletingExpo(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting expo:', error);
      setError(error.response?.data?.error || 'Failed to delete expo');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (expoId) => {
    navigate(`/dashboard/admin/expo/${expoId}/view`);
  };

  const closeModals = () => {
    setCreatingExpo(false);
    setEditingExpo(null);
    setDeletingExpo(null);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  // Floor Plan Functions
  const initializeFloorPlan = () => {
    const newFloorPlan = [];
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        newFloorPlan.push({
          boothId: `B${row + 1}-${col + 1}`,
          position: { x: col, y: row },
          size: { width: 1, height: 1 },
          available: true,
          assignedTo: null
        });
      }
    }
    setFloorPlan(newFloorPlan);
  };

  const toggleBoothAvailability = (boothId) => {
    setFloorPlan(prev => prev.map(booth =>
      booth.boothId === boothId
        ? { ...booth, available: !booth.available }
        : booth
    ));
  };

  const adjustGridSize = (type, operation) => {
    setGridSize(prev => {
      const newSize = { ...prev };
      if (operation === 'increase') {
        newSize[type] = Math.min(newSize[type] + 1, 10); // Max 10
      } else {
        newSize[type] = Math.max(newSize[type] - 1, 3); // Min 3
      }
      return newSize;
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Expos Management</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Create Expo</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
          >
            <Check className="text-green-500 mr-2" size={20} />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expos Grid */}
      {expos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expos found</h3>
          <p className="text-gray-600 mb-6">Create your first expo to get started</p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Expo
          </button>
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
              <div className="mb-4 flex flex-col justify-between flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 truncate">{expo.title}</h3>
                <div className="flex items-center text-gray-700 mb-2">
                  <Calendar size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{new Date(expo.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{expo.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users size={16} className="mr-2 flex-shrink-0" />
                  <span>{(expo.totalAttendees || 0).toLocaleString()} attendees</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex justify-between items-center space-x-2">
                  <button
                    onClick={() => handleEdit(expo)}
                    className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-2 rounded-lg transition-transform transform hover:scale-105 flex justify-center items-center"
                  >
                    <Edit size={18} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expo)}
                    className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white py-2 rounded-lg transition-transform transform hover:scale-105 flex justify-center items-center"
                  >
                    <Trash2 size={18} className="mr-1" /> Delete
                  </button>
                </div>

                <button
                  onClick={() => handleViewDetails(expo._id)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg shadow-md transition-transform transform hover:scale-105 flex justify-center items-center"
                >
                  <Eye size={18} className="mr-1" />
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Expo Modal */}
      <AnimatePresence>
        {(creatingExpo || editingExpo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingExpo ? 'Edit Expo' : 'Create New Expo'}
                </h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter expo title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter expo location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter expo theme"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter expo description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="expo-image"
                    />
                    <label
                      htmlFor="expo-image"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload size={16} />
                      <span>{formData.image ? formData.image.name : 'Choose image'}</span>
                    </label>
                  </div>
                </div>

                {/* Floor Plan Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Floor Plan Setup</h3>
                    <button
                      type="button"
                      onClick={() => setShowFloorPlan(!showFloorPlan)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Grid3X3 size={16} />
                      <span>{showFloorPlan ? 'Hide' : 'Show'} Floor Plan</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {showFloorPlan && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                      >
                        {/* Grid Size Controls */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Rows:</span>
                            <button
                              type="button"
                              onClick={() => adjustGridSize('rows', 'decrease')}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <MinusCircle size={16} />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{gridSize.rows}</span>
                            <button
                              type="button"
                              onClick={() => adjustGridSize('rows', 'increase')}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <PlusCircle size={16} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Columns:</span>
                            <button
                              type="button"
                              onClick={() => adjustGridSize('cols', 'decrease')}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <MinusCircle size={16} />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{gridSize.cols}</span>
                            <button
                              type="button"
                              onClick={() => adjustGridSize('cols', 'increase')}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <PlusCircle size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={initializeFloorPlan}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Initialize Grid
                          </button>
                        </div>

                        {/* Floor Plan Grid */}
                        {floorPlan.length > 0 && (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Click booths to toggle availability (Green = Available, Red = Occupied)
                            </h4>
                            <div
                              className="grid gap-1 mx-auto"
                              style={{
                                gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                                maxWidth: `${gridSize.cols * 40}px`
                              }}
                            >
                              {floorPlan.map((booth) => (
                                <button
                                  key={booth.boothId}
                                  type="button"
                                  onClick={() => toggleBoothAvailability(booth.boothId)}
                                  className={`w-10 h-10 text-xs font-medium rounded border-2 transition-colors ${
                                    booth.available
                                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                                      : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                                  }`}
                                  title={`${booth.boothId} - ${booth.available ? 'Available' : 'Occupied'}`}
                                >
                                  {booth.boothId.split('-')[1]}
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-gray-600 text-center">
                              Total Booths: {floorPlan.length} | Available: {floorPlan.filter(b => b.available).length} | Occupied: {floorPlan.filter(b => !b.available).length}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingExpo ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      {editingExpo ? 'Update Expo' : 'Create Expo'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingExpo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Delete Expo</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deletingExpo.title}</strong>?
                This action cannot be undone and will remove all associated data.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete Expo
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExposManagement;
