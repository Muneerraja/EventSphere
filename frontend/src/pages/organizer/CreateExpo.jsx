import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Grid3X3, PlusCircle, MinusCircle, Upload, Check, AlertTriangle, Eye } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EXPO_THEMES = [
  'Technology',
  'Business',
  'Healthcare',
  'Education',
  'Entertainment',
  'Sports',
  'Food & Beverage',
  'Fashion',
  'Art & Culture',
  'Science',
  'Automotive',
  'Real Estate',
  'Travel & Tourism',
  'Finance',
  'Marketing',
  'Sustainability',
  'Gaming',
  'Music',
  'Film & Media',
  'Agriculture'
];

const CreateExpo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    theme: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Floor Plan State
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [floorPlan, setFloorPlan] = useState([]);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 8 });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
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

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Expo title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.date) {
      errors.date = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate <= now) {
        errors.date = 'Expo date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (image) submitData.append("image", image);

      // Include floor plan data if it exists
      if (floorPlan.length > 0) {
        submitData.append('floorPlan', JSON.stringify(floorPlan));
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/expos`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess('Expo created successfully! Redirecting...');

      // Clear form data
      setFormData({ title: "", date: "", location: "", description: "", theme: "" });
      setImage(null);
      setImagePreview(null);
      setFloorPlan([]);
      setGridSize({ rows: 5, cols: 8 });
      setShowFloorPlan(false);
      setValidationErrors({});

      // Redirect to MyExpos after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/organizer/my-expos');
      }, 2000);

    } catch (error) {
      console.error("Expo creation failed:", error);
      const errorMessage = error.response?.data?.error || 'Failed to create expo. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center sm:text-left">
          Create New Expo
        </h1>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" size={20} />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
            >
              <Check className="text-green-500 mr-3 flex-shrink-0" size={20} />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expo Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => {
                handleInputChange(e);
                // Clear validation error when user starts typing
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Enter expo title"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md ${
                validationErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={(e) => {
                handleInputChange(e);
                // Clear validation error when user starts typing
                if (validationErrors.date) {
                  setValidationErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md ${
                validationErrors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {validationErrors.date}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <select
              name="location"
              value={formData.location}
              onChange={(e) => {
                handleInputChange(e);
                // Clear validation error when user selects
                if (validationErrors.location) {
                  setValidationErrors(prev => ({ ...prev, location: '' }));
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md ${
                validationErrors.location ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a location...</option>
              {['New York', 'London', 'Tokyo', 'Singapore', 'Dubai', 'Berlin'].map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
              <option value="other">Other (specify below)</option>
            </select>
            {formData.location === 'other' && (
              <input
                type="text"
                name="customLocation"
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter custom location"
                className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md"
              />
            )}
            {validationErrors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {validationErrors.location}
              </p>
            )}
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md"
            >
              <option value="">Select a theme...</option>
              {EXPO_THEMES.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
              <option value="other">Other (specify below)</option>
            </select>
            {formData.theme === 'other' && (
              <input
                type="text"
                name="customTheme"
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="Enter custom theme"
                className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => {
                handleInputChange(e);
                // Clear validation error when user starts typing
                if (validationErrors.description) {
                  setValidationErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              rows={5}
              placeholder="Describe your expo..."
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow shadow-sm hover:shadow-md ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                {validationErrors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expo Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 hover:bg-gradient-to-l transition-colors">
              <div className="space-y-1 text-center">
                <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 px-3 py-1">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {image && <p className="mt-2 text-sm text-gray-600">Selected: {image.name}</p>}
          </div>

          {/* Floor Plan Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Floor Plan Setup (Optional)</h3>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70"
          >
            {loading ? "Creating Expo..." : "Create Expo"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateExpo;
