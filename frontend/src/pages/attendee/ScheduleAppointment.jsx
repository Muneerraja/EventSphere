import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ScheduleAppointment = () => {
  const { id } = useParams(); // exhibitor ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exhibitor, setExhibitor] = useState(null);
  const [booths, setBooths] = useState([]);
  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    dateTime: '',
    duration: 30,
    boothId: '',
    purpose: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchExhibitorData();
  }, [id]);

  const fetchExhibitorData = async () => {
    try {
      // Fetch exhibitor details
      const exhibitorResponse = await axios.get(`${import.meta.env.VITE_API_URL}/exhibitors/${id}`);
      const exhibitorData = exhibitorResponse.data;
      setExhibitor(exhibitorData);

      // Fetch booths for this exhibitor
      const boothsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/booths/exhibitor/${id}`);
      const boothsData = boothsResponse.data.filter(booth => booth.status === 'assigned');
      setBooths(boothsData);

      // Get expo information from the first booth
      if (boothsData.length > 0) {
        const expoResponse = await axios.get(`${import.meta.env.VITE_API_URL}/expos/${boothsData[0].expo}`);
        setExpo(expoResponse.data);
      }
    } catch (error) {
      console.error('Error fetching exhibitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!expo) return [];

    const expoDate = new Date(expo.date);
    const slots = [];

    // Generate slots from 9 AM to 6 PM on the expo date
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(expoDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Only include future slots
        if (slotTime > new Date()) {
          slots.push({
            value: slotTime.toISOString(),
            label: slotTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          });
        }
      }
    }

    return slots;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dateTime) {
      newErrors.dateTime = 'Please select a date and time';
    } else {
      const selectedDateTime = new Date(formData.dateTime);
      const now = new Date();

      if (selectedDateTime <= now) {
        newErrors.dateTime = 'Please select a future date and time';
      }

      // Check if the selected time is during expo hours
      if (expo) {
        const expoDate = new Date(expo.date);
        const expoStart = new Date(expoDate);
        expoStart.setHours(9, 0, 0, 0); // Assuming 9 AM start
        const expoEnd = new Date(expoDate);
        expoEnd.setHours(18, 0, 0, 0); // Assuming 6 PM end

        if (selectedDateTime < expoStart || selectedDateTime > expoEnd) {
          newErrors.dateTime = 'Selected time must be during expo hours (9 AM - 6 PM)';
        }
      }
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please specify the purpose of the meeting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData = {
        exhibitorId: id,
        expoId: booths[0]?.expo, // Assuming all booths are for the same expo
        boothId: formData.boothId || null,
        dateTime: formData.dateTime,
        duration: parseInt(formData.duration),
        purpose: formData.purpose,
        notes: formData.notes
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/appointments`,
        appointmentData
      );

      // Show success message
      alert('Appointment request sent successfully! The exhibitor will be notified and can confirm or decline your request.');

      // Navigate back to exhibitor profile
      navigate(`/dashboard/attendee/exhibitor/${id}`);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to schedule appointment. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
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

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Schedule Meeting</h1>
              <p className="text-blue-100">with {exhibitor.company}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Meeting Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <select
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a time slot...</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  {errors.dateTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.dateTime}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                {/* Booth Selection */}
                {booths.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Booth (Optional)
                    </label>
                    <select
                      name="boothId"
                      value={formData.boothId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any booth</option>
                      {booths.map(booth => (
                        <option key={booth._id} value={booth._id}>
                          Booth {booth.boothNumber} - {booth.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Purpose *
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Briefly describe what you'd like to discuss..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.purpose ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.purpose}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Any specific questions or requirements..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} className="mr-2" />
                        Send Meeting Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exhibitor Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Meeting With</h3>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{exhibitor.company}</h4>
                  <p className="text-sm text-gray-600">{exhibitor.description}</p>
                  {expo && (
                    <div className="mt-2 text-xs text-gray-500">
                      {expo.title} - {new Date(expo.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <CheckCircle size={20} className="mr-2" />
                Important Notes
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Meeting requests are subject to exhibitor approval</li>
                <li>• You'll receive a notification once the request is reviewed</li>
                <li>• Meetings can be rescheduled if needed</li>
                <li>• Please arrive 5 minutes early for your scheduled meeting</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointment;
