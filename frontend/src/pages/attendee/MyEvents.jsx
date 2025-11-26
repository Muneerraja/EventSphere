import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Bookmark, Users, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dummyData from '/dummydata.js';

const MyEvents = () => {
  const { user } = useAuth();
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    try {
      // Get authenticated user's ID from AuthContext
      const userId = user._id;
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendees/public/profile/${userId}`);
      const attendeeData = response.data;

      setAttendee(attendeeData);
    } catch (error) {
      console.error('Error fetching events:', error);

      // Fallback to mock data from dummydata.js filtered by authenticated user
      const attendee = dummyData.attendees.find(a => a.user === userId);
      if (attendee) {
        const registeredExpos = attendee.registeredExpos.map(expoId => {
          const expo = dummyData.expos.find(e => e._id === expoId) || {};
          return {
            _id: expo._id,
            title: expo.title,
            date: expo.date,
            location: expo.location,
            description: expo.description
          };
        });

        const bookmarkedSessions = attendee.bookmarkedSessions.map(sessionId => {
          const session = dummyData.sessions.find(s => s._id === sessionId) || {};
          return {
            _id: session._id,
            title: session.title,
            time: session.time,
            speaker: session.speaker,
            topic: session.topic,
            location: session.location
          };
        });

        setAttendee({
          registeredExpos,
          bookmarkedSessions
        });
      }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Events</h1>

      <div className="space-y-8">
        {/* Registered Expos */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Expos</h2>
          {attendee?.registeredExpos?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No registered expos</h3>
              <p className="mt-1 text-sm text-gray-500">Browse expos and register for events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendee?.registeredExpos?.map((expo, index) => (
                <motion.div
                  key={expo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{expo.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>{new Date(expo.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-2" />
                    <span>{expo.location}</span>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                    View Expo Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Bookmarked Sessions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookmarked Sessions</h2>
          {attendee?.bookmarkedSessions?.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarked sessions</h3>
              <p className="mt-1 text-sm text-gray-500">Bookmark sessions to keep track of them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendee?.bookmarkedSessions?.map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                      <p className="text-gray-600 mb-2">{session.topic}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Clock size={14} className="mr-1" />
                        <span>{new Date(session.time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" />
                        <span>{session.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">
                        Speaker: {session.speaker}
                      </div>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                        <Bookmark size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      View Session
                    </button>
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center">
                      <Star size={16} className="mr-1" />
                      Rate Session
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyEvents;
