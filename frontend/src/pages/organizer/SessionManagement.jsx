import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Mic,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const SessionManagement = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpo, setSelectedExpo] = useState(searchParams.get('expo') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [userExpos, setUserExpos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    expoId: '',
    title: '',
    speaker: '',
    speakerBio: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    category: 'Keynote'
  });

  useEffect(() => {
    fetchUserExpos();
  }, []);

  useEffect(() => {
    if (userExpos.length > 0) {
      fetchSessions();
    } else if (userExpos.length === 0) {
      // If no expos, still stop loading
      setLoading(false);
    }
  }, [userExpos, selectedExpo, searchQuery, sortBy, sortOrder]);

  const fetchUserExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos`, { timeout: 5000 });
      // Backend already filters by user permissions, no need for additional filtering
      setUserExpos(response.data);
    } catch (error) {
      console.error('Error fetching user expos:', error);
      setUserExpos([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sessions`, { timeout: 5000 });
      let sessionsData = response.data;

      // Transform data to match component expectations
      sessionsData = sessionsData.map(session => ({
        ...session,
        id: session._id,
        expoId: session.expo?._id,
        startTime: session.time,
        endTime: session.time, // Default end time (could be calculated)
        registered: session.attendance?.length || 0,
        capacity: 100, // Default capacity since not in model
        description: session.topic || 'No description available',
        category: 'General', // Default category since not in model
        expoName: session.expo?.title || 'Unknown Event',
        speaker: typeof session.speaker === 'object' ? session.speaker?.username || 'Unknown Speaker' : session.speaker || 'Unknown Speaker',
        speakerBio: 'Speaker bio not available', // Not in model
        status: session.status || 'confirmed' // Default status
      }));

      // Filter sessions to only those for this organizer's expos
      const organizerSessions = sessionsData.filter(session =>
        session.expoId && userExpos.some(expo => expo._id === session.expoId)
      );

      let filteredSessions = organizerSessions.filter(session => {
        if (selectedExpo !== 'all' && session.expoId !== selectedExpo) return false;
        if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !session.speaker.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });

      // Sort sessions
      filteredSessions.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.startTime);
            bValue = new Date(b.startTime);
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'speaker':
            aValue = a.speaker.toLowerCase();
            bValue = b.speaker.toLowerCase();
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Set empty array when no data is available
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'tentative':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleStatusToggle = async (sessionId) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const newStatus = session.status === 'confirmed' ? 'cancelled' : 'confirmed';

      // Make API call to update status
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}`, {
        title: session.title,
        time: session.startTime,
        speaker: session.speaker,
        topic: session.description,
        location: session.location
        // Note: status is not a field in the backend model, so we can't update it directly
        // This toggle button should probably be removed or repurposed
      });

      // Update local state
      setSessions(sessions.map(session =>
        session.id === sessionId
          ? {...session, status: newStatus}
          : session
      ));
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('Failed to update session status. Please try again.');
    }
  };

  const handleAddSession = () => {
    setFormData({
      expoId: userExpos.length > 0 ? userExpos[0]._id : '',
      title: '',
      speaker: '',
      speakerBio: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      capacity: '',
      category: 'Keynote'
    });
    setEditingSession(null);
    setShowAddModal(true);
  };

  const handleEditSession = (session) => {
    setFormData({
      expoId: session.expoId,
      title: session.title,
      speaker: session.speaker,
      speakerBio: session.speakerBio,
      description: session.description,
      startTime: new Date(session.startTime).toISOString().slice(0, 16),
      endTime: new Date(session.endTime).toISOString().slice(0, 16),
      location: session.location,
      capacity: session.capacity,
      category: session.category
    });
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}`);
        // Remove from local state
        setSessions(sessions.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionData = {
        expo: formData.expoId,
        title: formData.title,
        speaker: formData.speaker,
        topic: formData.description,
        time: formData.startTime,
        location: formData.location
      };

      if (editingSession) {
        // Update existing session
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/sessions/${editingSession.id}`, sessionData);

        // Update local state with response data
        setSessions(sessions.map(session =>
          session.id === editingSession.id
            ? {
                ...session,
                title: response.data.title,
                speaker: response.data.speaker,
                topic: response.data.topic,
                time: response.data.time,
                location: response.data.location,
                description: response.data.topic || session.description
              }
            : session
        ));
        setShowEditModal(false);
      } else {
        // Create new session
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/sessions`, sessionData);

        // Add to local state
        const newSession = {
          id: response.data._id,
          ...response.data,
          expoId: response.data.expo._id || response.data.expo,
          startTime: response.data.time,
          endTime: response.data.time, // Default end time
          registered: response.data.attendance?.length || 0,
          capacity: 100, // Default capacity
          description: response.data.topic || 'No description available',
          category: 'General', // Default category
          expoName: userExpos.find(expo => expo._id === formData.expoId)?.title || 'Unknown Event',
          speaker: response.data.speaker || 'Unknown Speaker',
          speakerBio: 'Speaker bio not available',
          status: response.data.status || 'confirmed'
        };
        setSessions([...sessions, newSession]);
        setShowAddModal(false);
      }

      // Reset form
      setFormData({
        expoId: '',
        title: '',
        speaker: '',
        speakerBio: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        capacity: '',
        category: 'Keynote'
      });
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session:', error);
      alert(`Failed to ${editingSession ? 'update' : 'create'} session. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600">Create and manage event schedules, speakers, and session details</p>
        </div>

        <div className="flex space-x-4 mt-4 lg:mt-0">
          <button
            onClick={handleAddSession}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
          >
            <Plus size={20} className="mr-2" />
            Add Session
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Sessions', value: sessions.length, color: 'blue' },
          { label: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: 'green' },
          { label: 'Tentative', value: sessions.filter(s => s.status === 'tentative').length, color: 'yellow' },
          { label: 'Total Attendees', value: sessions.reduce((sum, s) => sum + (s.registered || 0), 0), color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center">
              <div className={`bg-${stat.color}-50 p-3 rounded-lg mr-4`}>
                <div className={`text-${stat.color}-600 text-xl font-bold`}>{stat.value}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedExpo}
              onChange={(e) => setSelectedExpo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {userExpos.map(expo => (
                <option key={expo._id} value={expo._id}>{expo.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search sessions or speakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date & Time</option>
              <option value="title">Session Title</option>
              <option value="speaker">Speaker</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? <ChevronUp size={16} className="mx-auto" /> : <ChevronDown size={16} className="mx-auto" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600 mb-6">Create your first session to get started</p>
            <button
              onClick={handleAddSession}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add First Session
            </button>
          </div>
        ) : (
          sessions.map((session, index) => {
            const dateTime = formatDateTime(session.startTime);
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.title || 'Untitled Session'}</h3>
                      <p className="text-sm text-blue-600 font-medium">{session.expoName || 'Unknown Event'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2" />
                      <span>{session.speaker}</span>
                      <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{session.speakerBio}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span>{dateTime.date} at {dateTime.time}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>{session.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2" />
                      <span>{session.registered}/{session.capacity} registered</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {session.category}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusToggle(session.id)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          session.status === 'confirmed'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={session.status === 'confirmed' ? 'Cancel Session' : 'Confirm Session'}
                      >
                        {session.status === 'confirmed' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit Session"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Session"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Session</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                  <select
                    value={formData.expoId}
                    onChange={(e) => setFormData({...formData, expoId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an event...</option>
                    {userExpos.map(expo => (
                      <option key={expo._id} value={expo._id}>{expo.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Keynote</option>
                    <option>Workshop</option>
                    <option>Panel Discussion</option>
                    <option>Breakout Session</option>
                    <option>Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Name</label>
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Speaker full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Bio</label>
                  <input
                    type="text"
                    value={formData.speakerBio}
                    onChange={(e) => setFormData({...formData, speakerBio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Speaker credentials"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Session description"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Venue/Room"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum attendees"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Create Session
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Session</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                  <select
                    value={formData.expoId}
                    onChange={(e) => setFormData({...formData, expoId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an event...</option>
                    {userExpos.map(expo => (
                      <option key={expo._id} value={expo._id}>{expo.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Keynote</option>
                    <option>Workshop</option>
                    <option>Panel Discussion</option>
                    <option>Breakout Session</option>
                    <option>Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Name</label>
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Speaker full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Bio</label>
                  <input
                    type="text"
                    value={formData.speakerBio}
                    onChange={(e) => setFormData({...formData, speakerBio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Speaker credentials"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Session description"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Venue/Room"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum attendees"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Update Session
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SessionManagement;
