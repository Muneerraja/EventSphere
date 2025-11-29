import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, Eye, CheckCircle, Clock, AlertCircle, Plus, Edit, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ExhibitorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExhibitorData();
    }
  }, [user]);

  const fetchExhibitorData = async () => {
    try {
      // Fetch applications for this user
      const applicationsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/applications/`);
      const userApplications = applicationsResponse.data.filter(app => app.applicant._id === user._id);

      // Transform applications data
      const applicationsData = userApplications.map(app => ({
        id: app._id,
        expoTitle: app.expo?.title || 'Unknown Expo',
        expoDate: app.expo?.date || '',
        status: app.status,
        submittedDate: app.createdAt,
        boothAssigned: app.status === 'approved',
        boothId: null // Will be determined from booths
      }));

      // Fetch booths for this user
      const boothsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/booths/`);
      const userBooths = boothsResponse.data.filter(booth => booth.exhibitor === user._id);

      // Transform booths data
      const boothsData = userBooths.map(booth => ({
        id: booth._id,
        expoTitle: booth.expo?.title || 'Unknown Expo',
        boothId: booth.boothNumber,
        space: booth.size,
        size: booth.size,
        products: booth.features || [],
        visitors: 0, // Placeholder - would need analytics
        inquiries: 0, // Placeholder - would need analytics
        lastUpdated: booth.createdAt
      }));

      setApplications(applicationsData);
      setBooths(boothsData);
    } catch (error) {
      console.error('Error fetching exhibitor data:', error);
      // Set empty arrays on error
      setApplications([]);
      setBooths([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const totalBooths = booths.length;
  const totalVisitors = booths.reduce((sum, booth) => sum + booth.visitors, 0);
  const totalInquiries = booths.reduce((sum, booth) => sum + booth.inquiries, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
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
        <h1 className="text-3xl font-bold text-gray-900">Exhibitor Dashboard</h1>
        <p className="text-gray-600">Manage your expo applications and booth performance</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        {[
          {
            icon: FileText,
            label: 'Total Applications',
            value: totalApplications,
            change: null,
            color: 'blue'
          },
          {
            icon: CheckCircle,
            label: 'Approved',
            value: approvedApplications,
            change: `${Math.round((approvedApplications / totalApplications) * 100)}% success rate`,
            color: 'green'
          },
          {
            icon: Clock,
            label: 'Pending',
            value: pendingApplications,
            change: null,
            color: 'yellow'
          },
          {
            icon: Package,
            label: 'Active Booths',
            value: totalBooths,
            change: null,
            color: 'purple'
          },
          {
            icon: Eye,
            label: 'Total Visitors',
            value: totalVisitors,
            change: null,
            color: 'indigo'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  )}
                </div>
                <div className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/exhibitor/apply')}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            <span>Apply to New Expo</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/exhibitor/booths')}
            className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Package size={20} />
            <span>Manage Products</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/analytics')}
            className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Eye size={20} />
            <span>View Analytics</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Applications Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              New Application
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.expoTitle}</h3>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>{new Date(application.expoDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2" />
                      <span>Applied {new Date(application.submittedDate).toLocaleDateString()}</span>
                    </div>
                    {application.boothAssigned && (
                      <div className="flex items-center">
                        <Package size={16} className="mr-2" />
                        <span>Booth {application.boothId}</span>
                      </div>
                    )}
                  </div>

                  {application.status === 'rejected' && application.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {application.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  {application.status === 'approved' && application.boothAssigned && (
                    <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      <Eye size={16} />
                      <span>View Booth</span>
                    </button>
                  )}
                  {application.status === 'pending' && (
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
                      <Edit size={16} />
                      <span>Edit Application</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start applying to expos to showcase your products</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse Available Expos
            </button>
          </div>
        )}
      </motion.div>

      {/* Active Booths */}
      {booths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Booths</h2>
            <p className="text-gray-600 text-sm">Track performance and manage your exhibition space</p>
          </div>

          <div className="divide-y divide-gray-200">
            {booths.map((booth) => (
              <motion.div
                key={booth.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{booth.expoTitle}</h3>
                        <p className="text-sm text-gray-600">Booth {booth.boothId} • {booth.space}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium ml-1">{booth.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Visitors:</span>
                        <span className="font-medium ml-1 text-blue-600">{booth.visitors}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Inquiries:</span>
                        <span className="font-medium ml-1 text-green-600">{booth.inquiries}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="font-medium ml-1">{new Date(booth.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">Featured Products:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booth.products.map((product, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Last updated: {new Date(booth.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Package size={16} />
                      <span>Manage Booth</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            ...applications.slice(0, 2).map(app => ({
              type: 'application',
              message: `Application ${app.status} for ${app.expoTitle}`,
              time: new Date(app.submittedDate).toLocaleDateString(),
              status: app.status === 'approved' ? 'success' : app.status === 'pending' ? 'info' : 'warning'
            })),
            ...booths.slice(0, 2).map(booth => ({
              type: 'booth',
              message: `Booth ${booth.boothId} assigned for ${booth.expoTitle}`,
              time: new Date(booth.lastUpdated).toLocaleDateString(),
              status: 'success'
            }))
          ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4).map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'info' ? 'bg-blue-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-800">{activity.message}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ExhibitorDashboard;
