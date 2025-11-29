import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, Filter, Eye, User, Building, Calendar, AlertTriangle, Building2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ExhibitorApprovals = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExpo, setFilterExpo] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingApplication, setRejectingApplication] = useState(null);
  const [userExpos, setUserExpos] = useState([]);

  useEffect(() => {
    fetchUserExpos();
  }, []);

  useEffect(() => {
    if (userExpos.length > 0) {
      fetchPendingApplications();
    } else if (userExpos.length === 0) {
      // If no expos, still stop loading
      setLoading(false);
    }
  }, [userExpos]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterStatus, filterExpo]);

  const fetchUserExpos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/expos`, { timeout: 5000 });
      // Admin sees all expos, organizers see only their own
      const filteredExpos = user.role === 'admin'
        ? response.data
        : response.data.filter(expo => expo.organizer === user._id);
      setUserExpos(filteredExpos);
    } catch (error) {
      console.error('Error fetching user expos:', error);
      setUserExpos([]);
    }
  };

  const fetchPendingApplications = async () => {
    try {
      console.log('ExhibitorApprovals: Fetching applications...');
      console.log('ExhibitorApprovals: API URL:', import.meta.env.VITE_API_URL);
      console.log('ExhibitorApprovals: User expos:', userExpos);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/applications/`, { timeout: 5000 });
      console.log('ExhibitorApprovals: Raw response data:', response.data);

      // Filter applications to only those for this organizer's expos
      const organizerApplications = response.data.filter(app => {
        // Handle different possible structures
        const expoId = app.expo?.id || app.expo?._id;
        console.log('ExhibitorApprovals: Checking app:', app.id, 'expoId:', expoId);
        return userExpos.some(expo => expo._id === expoId);
      });

      console.log('ExhibitorApprovals: Filtered applications:', organizerApplications);
      setApplications(organizerApplications);
    } catch (error) {
      console.error('ExhibitorApprovals: Error fetching applications:', error);
      console.error('ExhibitorApprovals: Error details:', error.response?.data || error.message);

      // Set empty array when no data is available
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.expo?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by expo
    if (filterExpo !== 'all') {
      filtered = filtered.filter(app => {
        const expoId = app.expo?.id || app.expo?._id;
        return expoId === filterExpo;
      });
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = async (application) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/applications/${application.id}/approve`);
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id ? { ...app, status: 'approved', approvedDate: new Date().toISOString() } : app
        )
      );
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const handleReject = (application) => {
    setRejectingApplication(application);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (rejectingApplication && rejectReason.trim()) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/applications/${rejectingApplication.id}/reject`, {
          reason: rejectReason
        });
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === rejectingApplication.id
              ? { ...app, status: 'rejected', rejectionReason: rejectReason, rejectedDate: new Date().toISOString() }
              : app
          )
        );
        setShowRejectModal(false);
        setRejectReason('');
        setRejectingApplication(null);
      } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Failed to reject application. Please try again.');
      }
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Approve all selected applications
      await Promise.all(
        selectedApplications.map(appId =>
          axios.put(`${import.meta.env.VITE_API_URL}/applications/${appId}/approve`)
        )
      );

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          selectedApplications.includes(app.id)
            ? { ...app, status: 'approved', approvedDate: new Date().toISOString() }
            : app
        )
      );
      setSelectedApplications([]);
    } catch (error) {
      console.error('Error bulk approving applications:', error);
      alert('Failed to approve some applications. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
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
      >
        <h1 className="text-3xl font-bold text-gray-900">Exhibitor Approvals</h1>
        <p className="text-gray-600">Review and manage exhibitor applications for your events</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Pending Reviews', value: applications.filter(app => app.status === 'pending').length, color: 'yellow' },
          { label: 'Approved', value: applications.filter(app => app.status === 'approved').length, color: 'green' },
          { label: 'Rejected', value: applications.filter(app => app.status === 'rejected').length, color: 'red' },
          { label: 'Total Applications', value: applications.length, color: 'blue' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100`}
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

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterExpo}
              onChange={(e) => setFilterExpo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {userExpos.map(expo => (
                <option key={expo._id} value={expo._id}>{expo.title}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                const pendingApps = filteredApplications.filter(app => app.status === 'pending').map(app => app.id);
                setSelectedApplications(pendingApps.length === selectedApplications.length ? [] : pendingApps);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              {selectedApplications.length === filteredApplications.filter(app => app.status === 'pending').length && selectedApplications.length > 0
                ? 'Deselect All'
                : 'Select All Pending'
              }
            </button>
            {selectedApplications.length > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleBulkApprove}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <CheckCircle size={18} className="mr-2" />
                Approve Selected ({selectedApplications.length})
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 rounded-full mt-1 bg-blue-500" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.applicant?.name || 'Unknown Applicant'}
                        </h3>
                        <p className="text-gray-600">{application.applicant?.email || 'No email provided'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {application.applicant?.type || 'Exhibitor'}
                          </span>
                          <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center">
                            <Building2 size={14} className="mr-1" />
                            {application.expo?.title || 'Unknown Event'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </span>
                      {application.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications(prev => [...prev, application.id]);
                            } else {
                              setSelectedApplications(prev => prev.filter(id => id !== application.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Applied: {new Date(application.submittedDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Priority: <span className="capitalize font-medium">{application.priority || 'Normal'}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="space-y-1">
                        {application.documents?.map((doc, idx) => (
                          <div key={idx} className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            <Eye size={14} className="mr-2" />
                            {doc}
                          </div>
                        ))}
                        {!application.documents?.length && (
                          <span className="text-sm text-gray-500">No documents uploaded</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-600">{application.notes || 'No additional notes'}</p>

                      {application.status === 'rejected' && application.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">
                            <strong>Rejection Reason:</strong><br />
                            {application.rejectionReason}
                          </p>
                        </div>
                      )}

                      {(application.status === 'approved') && application.approvedDate && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-700">
                            <strong>Approved:</strong> {new Date(application.approvedDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="flex space-x-3 mt-6 lg:mt-0 lg:ml-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(application)}
                      className="flex-1 lg:flex-none lg:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(application)}
                      className="flex-1 lg:flex-none lg:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <XCircle size={18} className="mr-2" />
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Rejection Modal */}
      {showRejectModal && (
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
            <div className="flex items-center mb-4">
              <XCircle size={24} className="text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this application. This will be communicated to the applicant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectingApplication(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Application
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ExhibitorApprovals;
