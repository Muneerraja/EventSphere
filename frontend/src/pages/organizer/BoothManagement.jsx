import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Building,
  Users,
  DollarSign,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertTriangle,
  Grid,
  Layout
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';


const BoothManagement = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpo, setSelectedExpo] = useState(searchParams.get('expo') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userExpos, setUserExpos] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [formData, setFormData] = useState({
    expoId: '',
    boothNumber: '',
    size: 'standard',
    price: '',
    location: '',
    features: []
  });
  const [assignData, setAssignData] = useState({
    boothId: '',
    exhibitorId: '',
    notes: ''
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  useEffect(() => {
    fetchUserExpos();
  }, []);

  useEffect(() => {
    if (userExpos.length > 0) {
      fetchBooths();
      fetchExhibitors();
    } else {
      setBooths([]);
      setApplications([]);
      setLoading(false);
    }
  }, [userExpos, selectedExpo, searchQuery, filterStatus]);

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

  const fetchExhibitors = async () => {
    try {
      // Get all approved exhibitors for user's expos
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/exhibitors`, { timeout: 5000 });
      const approvedExhibitors = response.data.filter(exhibitor =>
        exhibitor.status === 'approved' && userExpos.some(expo => expo._id === exhibitor.expoApplication.toString())
      );
      setApplications(approvedExhibitors);
    } catch (error) {
      console.error('Error fetching exhibitors:', error);
      setApplications([]);
    }
  };

  const fetchBooths = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/booths`, { timeout: 5000 });
      // Admin sees all booths, organizers see only booths for their expos
      const filteredBooths = user.role === 'admin'
        ? response.data
        : response.data.filter(booth =>
            booth.expo && userExpos.some(expo => expo._id === booth.expo._id)
          );

      // Apply client-side filtering
      let filteredData = filteredBooths;

      // Filter by selected expo
      if (selectedExpo !== 'all') {
        filteredData = filteredData.filter(booth => booth.expo && booth.expo._id === selectedExpo);
      }

      // Filter by status
      if (filterStatus !== 'all') {
        filteredData = filteredData.filter(booth => booth.status === filterStatus);
      }

      // Filter by search query
      if (searchQuery) {
        filteredData = filteredData.filter(booth =>
          booth.boothNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booth.assignedTo?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booth.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setBooths(filteredData);
    } catch (error) {
      console.error('Error fetching booths:', error);
      // Set empty array when no data is available
      setBooths([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'assigned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'occupied':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'deluxe':
        return 'bg-blue-100 text-blue-800';
      case 'standard':
        return 'bg-green-100 text-green-800';
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddBooth = () => {
    if (userExpos.length === 0) {
    }

    setFormData({
      expoId: userExpos.length > 0 ? userExpos[0]._id : '',
      boothNumber: '',
      size: 'standard',
      price: '',
      location: '',
      features: []
    });
    setShowAddModal(true);
  };

  const handleAssignBooth = (booth) => {
    setSelectedBooth(booth);
    setAssignData({
      boothId: booth._id,
      exhibitorId: '',
      notes: ''
    });
    setShowAssignModal(true);
  };

  const handleUnassignBooth = async (boothId) => {
    try {
      // Make API call to unassign booth
      await axios.post(`${import.meta.env.VITE_API_URL}/booths/unassign`, {
        boothId: boothId
      });

      // Update local state
      setBooths(booths.map(booth =>
        booth._id === boothId
          ? { ...booth, status: 'available', assignedTo: null }
          : booth
      ));
    } catch (error) {
      console.error('Error unassigning booth:', error);
      alert('Failed to unassign booth. Please try again.');
    }
  };

  const handleEditBooth = (booth) => {
    setSelectedBooth(booth);
    setFormData({
      boothNumber: booth.boothNumber || '',
      size: booth.size || 'standard',
      price: booth.price || '',
      location: booth.location || '',
      features: booth.features || []
    });
    setShowEditModal(true);
  };

  const handleDeleteBooth = async (boothId) => {
    if (window.confirm('Are you sure you want to delete this booth? This action cannot be undone.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/booths/${boothId}`);
        // Remove from local state
        setBooths(booths.filter(booth => booth._id !== boothId));
      } catch (error) {
        console.error('Error deleting booth:', error);
        alert('Failed to delete booth. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/booths`, {
        expoId: formData.expoId,
        boothNumber: formData.boothNumber,
        size: formData.size,
        price: formData.price,
        location: formData.location,
        features: formData.features
      });

      // Add the created booth to the local state
      const newBooth = {
        ...response.data,
        expoName: userExpos.find(expo => expo._id === formData.expoId)?.title || 'Unknown Event'
      };

      setBooths([...booths, newBooth]);
      setShowAddModal(false);
      setFormData({
        expoId: '',
        boothNumber: '',
        size: 'standard',
        price: '',
        location: '',
        features: []
      });
    } catch (error) {
      console.error('Error creating booth:', error);
      alert('Failed to create booth. Please try again.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/booths/assign`, {
        boothId: selectedBooth._id,
        exhibitorId: assignData.exhibitorId
      });

      // Update the booth in local state
      setBooths(booths.map(booth =>
        booth._id === selectedBooth._id
          ? { ...response.data.booth, expoName: booth.expoName }
          : booth
      ));

      setShowAssignModal(false);
      setAssignData({
        boothId: '',
        exhibitorId: '',
        notes: ''
      });
      setSelectedBooth(null);
    } catch (error) {
      console.error('Error assigning booth:', error);
      alert('Failed to assign booth. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/booths/${selectedBooth._id}`, {
        boothNumber: formData.boothNumber,
        size: formData.size,
        price: formData.price,
        location: formData.location,
        features: formData.features
      });

      // Update the booth in local state
      setBooths(booths.map(booth =>
        booth._id === selectedBooth._id
          ? { ...response.data, expoName: booth.expoName }
          : booth
      ));

      setShowEditModal(false);
      setFormData({
        boothNumber: '',
        size: 'standard',
        price: '',
        location: '',
        features: []
      });
      setSelectedBooth(null);
    } catch (error) {
      console.error('Error updating booth:', error);
      alert('Failed to update booth. Please try again.');
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
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
          <h1 className="text-3xl font-bold text-gray-900">Booth Management</h1>
          <p className="text-gray-600">Manage booth spaces, assignments, and allocations for your events</p>
        </div>

        <div className="flex space-x-4 mt-4 lg:mt-0">
          <button
            onClick={handleAddBooth}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus size={20} className="mr-2" />
            {loading ? 'Loading...' : 'Add Booth'}
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
        <motion.div
          key="total"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <div className="text-blue-600 text-xl font-bold">{booths.length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Booths</p>
              <p className="text-2xl font-bold text-gray-900">{booths.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="available"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <div className="text-green-600 text-xl font-bold">{booths.filter(b => b.status === 'available').length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{booths.filter(b => b.status === 'available').length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="assigned"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg mr-4">
              <div className="text-purple-600 text-xl font-bold">{booths.filter(b => b.status === 'assigned').length}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{booths.filter(b => b.status === 'assigned').length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          key="revenue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 * 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <div className="text-green-600 text-xl font-bold">{`$${booths.filter(b => b.status === 'assigned').reduce((sum, b) => sum + parseFloat(b.price || 0), 0).toLocaleString()}`}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{`$${booths.filter(b => b.status === 'assigned').reduce((sum, b) => sum + parseFloat(b.price || 0), 0).toLocaleString()}`}</p>
            </div>
          </div>
        </motion.div>
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
                placeholder="Search booths or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedExpo('all');
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Booths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {booths.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No booths found</h3>
            <p className="text-gray-600 mb-6">Create your first booth to get started</p>
            <button
              onClick={handleAddBooth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add First Booth
            </button>
          </div>
        ) : (
          booths.map((booth, index) => (
            <motion.div
              key={booth.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">Booth {booth.boothNumber || 'N/A'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(booth.size || 'standard')}`}>
                        {(booth.size || 'standard').charAt(0).toUpperCase() + (booth.size || 'standard').slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium mb-3">{booth.expoName}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span>{booth.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign size={16} className="mr-2" />
                        <span>${(booth.price || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(booth.features || []).map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booth.status || 'available')}`}>
                      {(booth.status || 'available').charAt(0).toUpperCase() + (booth.status || 'available').slice(1)}
                    </span>

                    {booth.assignedTo && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">{booth.assignedTo.companyName}</p>
                        <p className="text-xs text-gray-600">{booth.assignedTo.contactEmail}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {booth.status === 'available' && (
                      <button
                        onClick={() => handleAssignBooth(booth)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Assign
                      </button>
                    )}
                    {booth.status === 'assigned' && (
                      <button
                        onClick={() => handleUnassignBooth(booth.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Unassign
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBooth(booth)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Booth"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBooth(booth._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Booth"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Booth Modal */}
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Booth</h2>
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
                    <option value="">
                      {userExpos.length === 0 ? 'Loading events...' : 'Select an event...'}
                    </option>
                    {userExpos.map(expo => (
                      <option key={expo._id} value={expo._id}>{expo.title}</option>
                    ))}
                  </select>
                  {userExpos.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                      No events found. Please create an event first before adding booths.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booth Number</label>
                  <input
                    type="text"
                    value={formData.boothNumber}
                    onChange={(e) => setFormData({...formData, boothNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A1, B5, C12"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Hall - Center, Hall B - Corner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Electricity', 'WiFi', 'Display Table', 'Storage', 'Projector', 'Sound System'].map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-2"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
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
                  Create Booth
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Assign Booth Modal */}
      {showAssignModal && selectedBooth && (
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
            className="bg-white rounded-xl p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assign Booth {selectedBooth.boothNumber}</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Approved Exhibitor</label>
                <select
                  value={assignData.exhibitorId}
                  onChange={(e) => setAssignData({...assignData, exhibitorId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose an exhibitor...</option>
                  {applications.map(exhibitor => (
                    <option key={exhibitor._id} value={exhibitor._id}>
                      {exhibitor.company} - {exhibitor.contact}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={assignData.notes}
                  onChange={(e) => setAssignData({...assignData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the assignment..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Assign Booth
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Booth Modal */}
      {showEditModal && selectedBooth && (
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
              <h2 className="text-2xl font-bold text-gray-900">Edit Booth {selectedBooth.boothNumber}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booth Number</label>
                <input
                  type="text"
                  value={formData.boothNumber}
                  onChange={(e) => setFormData({...formData, boothNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A1, B5, C12"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Hall - Center, Hall B - Corner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Electricity', 'WiFi', 'Display Table', 'Storage', 'Projector', 'Sound System'].map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-2"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
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
                  Update Booth
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BoothManagement;
