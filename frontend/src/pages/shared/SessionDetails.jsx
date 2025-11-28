import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Star,
  Heart,
  Share2,
  BookOpen,
  PlayCircle,
  Download,
  Plus,
  Check
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const SessionDetails = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [expo, setExpo] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sessions/${id}/`);
      setSession(response.data);
      // TODO: Set expo from response.data.expoData
    } catch (error) {
      console.error('Error fetching session details:', error);
      setSession(null);
      setExpo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = () => {
    if (!isRegistered) {
      // Handle registration logic
      setIsRegistered(true);
    } else {
      // Handle unregistration
      setIsRegistered(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const submitRating = (userRating, comment) => {
    // Handle rating submission
    setShowRatingModal(false);
  };

  const renderStars = (stars) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < stars ? "text-yellow-500 fill-current" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center text-sm text-blue-100 mb-4">
            <span>Home</span>
            <span className="mx-2"></span>
            <span>{expo?.title}</span>
            <span className="mx-2"></span>
            <span>Session Details</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:flex-1 mb-6 lg:mb-0">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
                  <p className="text-blue-100 text-lg">Part of {expo?.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{new Date(session.time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{new Date(session.time).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{session.location}</span>
                </div>
              </div>

              {/* Tags and Capacity */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                  {session.category}
                </div>
                <div className="flex items-center text-sm">
                  <Users size={14} className="mr-1" />
                  <span>{session.registeredCount}/{session.capacity} registered</span>
                </div>
                <div className="flex items-center text-sm">
                  {renderStars(Math.floor(session.rating))}
                  <span className="ml-1">({session.rating}) • {session.totalRatings} reviews</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:ml-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                <button
                  onClick={handleRegistration}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    isRegistered
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <Check size={18} className="mr-2" />
                      Registered
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      Register for Session
                    </>
                  )}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleBookmark}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                      isBookmarked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <Heart size={16} className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button className="flex-1 py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-sm font-medium transition-colors flex items-center justify-center">
                    <Share2 size={16} className="mr-2" />
                    Share
                  </button>
                </div>

                {!isRegistered && (
                  <p className="text-xs text-blue-100 text-center">
                    Registration closes 24 hours before the session
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Speaker Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Speaker</h2>
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {session.speakerData?.profile?.firstName?.[0]}
                    {session.speakerData?.profile?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {session.speakerData?.profile?.firstName} {session.speakerData?.profile?.lastName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {session.speakerData?.role === 'organizer' ? 'Event Organizer' : 'Speaker'} - Topic: {session.topic}
                  </p>
                  <div className="flex items-center mt-3">
                    {renderStars(Math.floor(session.rating))}
                    <span className="ml-2 text-sm text-gray-600">
                      {session.totalRatings > 0 ? `${session.rating.toFixed(1)} average rating` : 'New Speaker'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Session Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Session</h2>
              <div className="prose max-w-none text-gray-700">
                {session.description.split('\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'mb-4' : 'mb-3'}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Learning Objectives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Objectives</h2>
              <ul className="space-y-3">
                {session.learningObjectives?.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Session Materials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Materials</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {session.materials?.map((material, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download size={20} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">{material}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                * Materials will be available after session completion
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(session.time).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">
                    {new Date(session.time).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{session.location.split(',')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prerequisites</span>
                  <span className="font-medium text-right">{session.prerequisites}</span>
                </div>
              </div>
            </motion.div>

            {/* Rating Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Rating</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex mr-3">
                    {renderStars(session.rating)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{session.rating}</div>
                    <div className="text-sm text-gray-600">{session.totalRatings} ratings</div>
                  </div>
                </div>
                {/* Rate button would appear for attendees who attended */}
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Rate Session
                </button>
              </div>

              {/* Recent Reviews Summary */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Recent Feedback</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center mb-1">
                      {renderStars(5)}
                      <span className="ml-2 text-sm text-gray-600">"Excellent content and speaker"</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      {renderStars(5)}
                      <span className="ml-2 text-sm text-gray-600">"Very informative and engaging"</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Related Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Sessions</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Machine Learning in Practice</h4>
                  <p className="text-xs text-gray-600 mb-2">Dr. Ahmed Khan • Dec 15, 2:00 PM</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {renderStars(4.7)}
                    <span className="ml-1">4.7 (89 reviews)</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Data Science Fundamentals</h4>
                  <p className="text-xs text-gray-600 mb-2">Sarah Ahmed • Dec 16, 10:00 AM</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {renderStars(4.9)}
                    <span className="ml-1">4.9 (124 reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate This Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      <Star
                        className={star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts about this session..."
                ></textarea>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitRating(rating, '')}
                disabled={!rating}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SessionDetails;
