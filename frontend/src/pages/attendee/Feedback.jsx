import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Calendar,
  Users,
  Building
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Feedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    type: 'general',
    targetId: '',
    rating: 0,
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageCircle, description: 'General feedback about the platform' },
    { value: 'event', label: 'Event Feedback', icon: Calendar, description: 'Feedback about a specific event' },
    { value: 'session', label: 'Session Feedback', icon: Users, description: 'Feedback about a session you attended' },
    { value: 'exhibitor', label: 'Exhibitor Feedback', icon: Building, description: 'Feedback about an exhibitor' },
    { value: 'platform', label: 'Platform Feedback', icon: MessageSquare, description: 'Technical issues or suggestions' }
  ];

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

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please provide a subject for your feedback';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide details for your feedback';
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5 stars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const feedbackData = {
        ...formData,
        rating: formData.rating || undefined // Don't send rating if not provided
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/feedbacks`, feedbackData);

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleRatingChange(i + 1)}
        className="text-2xl focus:outline-none transition-colors"
      >
        <Star
          className={i < formData.rating ? "text-yellow-500 fill-current" : "text-gray-300 hover:text-yellow-400"}
        />
      </button>
    ));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={32} className="text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your input and will review it carefully.
          </p>

          <button
            onClick={() => navigate('/dashboard/attendee')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Submit Feedback</h1>
              <p className="text-blue-100">Help us improve your experience</p>
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
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Share Your Feedback</h2>
                <p className="text-gray-600">
                  Your feedback helps us improve the EventSphere experience for everyone.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What is this feedback about?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <Icon size={20} className={formData.type === type.value ? 'text-blue-600' : 'text-gray-400'} />
                            <div>
                              <div className={`font-medium ${formData.type === type.value ? 'text-blue-900' : 'text-gray-900'}`}>
                                {type.label}
                              </div>
                              <div className={`text-sm ${formData.type === type.value ? 'text-blue-700' : 'text-gray-500'}`}>
                                {type.description}
                              </div>
                            </div>
                          </div>
                          {formData.type === type.value && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Rating (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {renderStars()}
                    </div>
                    {formData.rating > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                        {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.rating}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your feedback..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Please provide detailed feedback..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <MessageSquare size={20} className="mr-2" />
                Feedback Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Be specific about your experience</li>
                <li>• Include suggestions for improvement</li>
                <li>• Mention what you liked and didn't like</li>
                <li>• Rate only if you've had direct experience</li>
                <li>• Keep feedback constructive and respectful</li>
              </ul>
            </motion.div>

            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-green-900 mb-4">
                What Happens Next?
              </h3>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 text-green-600" />
                  <span>Your feedback is reviewed by our team</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 text-green-600" />
                  <span>We may follow up for clarification</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 text-green-600" />
                  <span>Changes are implemented based on feedback</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="mt-0.5 text-green-600" />
                  <span>You'll see improvements in future updates</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
