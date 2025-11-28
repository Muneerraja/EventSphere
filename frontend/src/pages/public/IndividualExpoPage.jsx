import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Building, Clock, User, Mail, Share2, Heart, BookOpen } from 'lucide-react';
import axios from 'axios';

const IndividualExpoPage = () => {
  const { id } = useParams();
  const [expo, setExpo] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchExpoDetails();
  }, [id]);

  const fetchExpoDetails = async () => {
    try {
      const [expoResponse, exhibitorsResponse, sessionsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/expos/public/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/exhibitors/public/by-expo/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/sessions/public/by-expo/${id}`)
      ]);

      setExpo(expoResponse.data);
      setExhibitors(exhibitorsResponse.data);
      setSessions(sessionsResponse.data);
      } catch (error) {
        console.error('Error fetching expo details:', error);
        // Set empty arrays on error
        setExpo(null);
        setExhibitors([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'exhibitors', label: 'Exhibitors', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'floorplan', label: 'Floor Plan', icon: Building }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Expo not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {expo.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join us for an exceptional expo experience featuring innovative companies,
              cutting-edge technologies, and unparalleled networking opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Calendar className="text-blue-600 mx-auto mb-4" size={32} />
                <div className="text-lg font-semibold text-gray-900 mb-2">Date & Time</div>
                <div className="text-gray-600">
                  {new Date(expo.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <MapPin className="text-green-600 mx-auto mb-4" size={32} />
                <div className="text-lg font-semibold text-gray-900 mb-2">Location</div>
                <div className="text-gray-600">{expo.location}</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Register Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Sessions
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{expo.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Users className="text-blue-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">500+ Exhibitors</h3>
                    <p className="text-gray-600">Leading companies showcasing</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Calendar className="text-green-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">50+ Sessions</h3>
                    <p className="text-gray-600">Expert-led presentations</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <Building className="text-purple-500 mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900">3 Floors</h3>
                    <p className="text-gray-600">Dedicated exhibition space</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Duration</div>
                        <div>3 Days • Dec 15-17, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Organizer</div>
                        <div>{expo.organizer?.username || expo.organizer || 'Unknown Organizer'}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">Contact</div>
                        <div>info@techsummit.pk</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Early Bird Registration</h3>
                  <p className="mb-4">Limited time offer: Save 20% on tickets!</p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Register Early
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exhibitors' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Exhibitors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitors.map((exhibitor) => (
                <motion.div
                  key={exhibitor._id || exhibitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    {exhibitor.logo ? (
                      <img
                        src={exhibitor.logo}
                        alt={exhibitor.company}
                        className="w-12 h-12 rounded-lg mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg mr-4 bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{exhibitor.company?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{exhibitor.company}</h3>
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Exhibitor
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{exhibitor.description}</p>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Products/Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {exhibitor.products.map((product, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                      View Details
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium">
                      Message
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Schedule</h2>
            <div className="space-y-6">
              {sessions.map((session) => (
                <motion.div
                  key={session._id || session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <User size={16} className="mr-2" />
                        <span className="font-medium">{session.speaker?.username || session.speaker || 'Unknown Speaker'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar size={16} className="mr-2" />
                        <span>{new Date(session.time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock size={16} className="mr-2" />
                        <span>{new Date(session.time).toLocaleTimeString()}</span>
                        <span className="ml-2 text-sm">({session.duration})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span>{session.location}</span>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {session.category}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{session.description}</p>

                  <div className="flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                      Register for Session
                    </button>
                    <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                      Add to Calendar
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-700">
                      <Heart size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'floorplan' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Floor Plan</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="text-center mb-6">
                <Building size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Interactive floor plan will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Browse available booths, find exhibitors, and navigate the venue
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 mb-6">
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                  {[1, 2, 3, 4].map((row) =>
                    ['A', 'B', 'C', 'D'].map((section) => (
                      <div
                        key={`${section}${row}`}
                        className="aspect-square rounded border-2 flex items-center justify-center text-sm font-medium bg-green-100 border-green-300 text-green-700"
                      >
                        {section}{row}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualExpoPage;
