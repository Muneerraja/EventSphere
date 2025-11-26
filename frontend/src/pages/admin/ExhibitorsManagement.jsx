import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Users,
  MapPin,
  Eye,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dummyData from '/dummydata.js';

const ExhibitorsManagement = () => {
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExpo, setFilterExpo] = useState('all');

  useEffect(() => {
    fetchExhibitorsData();
  }, [searchQuery, filterStatus, filterExpo]);

  const fetchExhibitorsData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/exhibitors/`);
      setExhibitors(response.data);
    } catch (error) {
      console.error('Error fetching exhibitors:', error);
      // Fallback to mock data from dummydata.js
      const mockExhibitors = [
        {
          id: '1',
          expoId: 'expo1',
          expoName: 'Tech Innovation Summit 2025',
          companyName: 'TechCorp Solutions',
          companyLogo: '/logo1.png',
          contactPerson: 'John Smith',
          email: 'john@techcorp.com',
          phone: '+1-555-0101',
          website: 'https://techcorp.com',
          description: 'Leading provider of enterprise software solutions',
          businessCategory: 'Software & IT Services',
          products: ['Cloud Solutions', 'AI Platform', 'Data Analytics'],
          requestedBoothSize: 'Premium',
          requestedBoothLocation: 'Main Hall',
          status: 'pending',
          appliedDate: '2025-01-10',
          paymentStatus: 'paid',
          documents: ['business-license.pdf', 'insurance-proof.pdf']
        },
        {
          id: '2',
          expoId: 'expo1',
          expoName: 'Tech Innovation Summit 2025',
          companyName: 'InnovateLabs Inc.',
          companyLogo: '/logo2.png',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@innovatelabs.com',
          phone: '+1-555-0102',
          website: 'https://innovatelabs.com',
          description: 'Research and development company specializing in IoT',
          businessCategory: 'Research & Development',
          products: ['IoT Devices', 'Smart Sensors', 'Connectivity Solutions'],
          requestedBoothSize: 'Standard',
          requestedBoothLocation: 'Innovation Hub',
          status: 'approved',
          appliedDate: '2025-01-08',
          paymentStatus: 'paid',
          assignedBooth: 'A-12',
          documents: ['business-registration.pdf', 'tax-certificates.pdf']
        },
        {
          id: '3',
          expoId: 'expo2',
          expoName: 'Healthcare Tech Conference',
          companyName: 'MediTech Solutions',
          companyLogo: '/logo3.png',
          contactPerson: 'Dr. Michael Chen',
          email: 'mchen@meditech.com',
          phone: '+1-555-0103',
          website: 'https://meditech.com',
          description: 'Healthcare software and medical device company',
          businessCategory: 'Healthcare Technology',
          products: ['Electronic Health Records', 'Medical Devices', 'Telemedicine Solutions'],
          requestedBoothSize: 'Large',
          requestedBoothLocation: 'Healthcare Pavilion',
          status: 'rejected',
          appliedDate: '2025-01-12',
          paymentStatus: 'pending',
          rejectionReason: 'Incomplete documentation provided',
          documents: ['business-license.pdf']
        },
        {
          id: '4',
          expoId: 'expo2',
          expoName: 'Healthcare Tech Conference',
          companyName: 'BioHealth Research',
          companyLogo: '/logo4.png',
          contactPerson: 'Prof. Amanda Taylor',
          email: 'amanda@biohealth.com',
          phone: '+1-555-0104',
          website: 'https://biohealth.com',
          description: 'Biomedical research and pharmaceutical company',
          businessCategory: 'Biomedical Research',
          products: ['Clinical Trials Software', 'Lab Equipment', 'Research Tools'],
          requestedBoothSize: 'Premium',
          requestedBoothLocation: 'Research Center',
          status: 'under_review',
          appliedDate: '2025-01-14',
          paymentStatus: 'paid',
          documents: ['research-license.pdf', 'ethics-committee-approval.pdf', 'insurance.pdf']
        }
      ];
      setExhibitors(dummyData.exhibitors || mockExhibitors);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'under_review':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleStatusChange = (exhibitorId, newStatus, boothNumber = null, rejectionReason = null) => {
    setExhibitors(exhibitors.map(exhibitor =>
      exhibitor.id === exhibitorId
        ? {
            ...exhibitor,
            status: newStatus,
            assignedBooth: boothNumber || exhibitor.assignedBooth,
            rejectionReason: rejectionReason || exhibitor.rejectionReason
          }
        : exhibitor
    ));
  };

  const handleViewDetails = (exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setShowDetailsModal(true);
  };

  const getStatusCounts = () => {
    return {
      total: exhibitors.length,
      approved: exhibitors.filter(e => e.status === 'approved').length,
      pending: exhibitors.filter(e => e.status === 'pending').length,
      rejected: exhibitors.filter(e => e.status === 'rejected').length,
      under_review: exhibitors.filter(e => e.status === 'under_review').length
    };
  };

  const statusCounts = getStatusCounts();

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
          <h1 className="text-3xl font-bold text-gray-900">Exhibitor Management</h1>
          <p className="text-gray-600">Review applications, approve exhibitors, and assign booth spaces</p>
        </div>
      </motion.div>

      {/* Status Overview Cards */}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: 'Total Applications', value: statusCounts.total, icon: Building, color: 'blue' },
          { label: 'Approved', value: statusCounts.approved, icon: CheckCircle, color: 'green' },
          { label: 'Pending Review', value: statusCounts.pending, icon: Clock, color: 'yellow' },
          { label: 'Under Review', value: statusCounts.under_review, icon: Eye, color: 'blue' },
          { label: 'Rejected', value: statusCounts.rejected, icon: XCircle, color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`bg-${stat.color}-50 p-2 rounded-lg`}>
                <stat.icon className={`text-${stat.color}-600`} size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search companies, contacts, or emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={filterExpo}
              onChange={(e) => setFilterExpo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="expo1">Tech Innovation Summit 2025</option>
              <option value="expo2">Healthcare Tech Conference</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Exhibitors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exhibitors.map((exhibitor, index) => (
          <motion.div
            key={exhibitor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{exhibitor.companyName}</h3>
                  <p className="text-sm text-blue-600 font-medium">{exhibitor.expoName}</p>
                  <p className="text-sm text-gray-600">{exhibitor.businessCategory}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(exhibitor.status)}`}>
                  {exhibitor.status.replace('_', ' ').charAt(0).toUpperCase() + exhibitor.status.slice(1).replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2" />
                  <span>{exhibitor.contactPerson}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{exhibitor.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{exhibitor.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package size={16} className="mr-2" />
                  <span>Booth: {exhibitor.requestedBoothSize} - {exhibitor.requestedBoothLocation}</span>
                </div>
                {exhibitor.assignedBooth && (
                  <div className="flex items-center text-sm text-green-600">
                    <MapPin size={16} className="mr-2" />
                    <span>Assigned: Booth {exhibitor.assignedBooth}</span>
                  </div>
                )}
                {exhibitor.rejectionReason && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Rejection: </strong>{exhibitor.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Applied: {new Date(exhibitor.appliedDate).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(exhibitor)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={18} />
                  </button>
                  {exhibitor.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(exhibitor.id, 'approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(exhibitor.id, 'rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  {exhibitor.status === 'under_review' && (
                    <button
                      onClick={() => handleStatusChange(exhibitor.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Exhibitor Details Modal */}
      {showDetailsModal && selectedExhibitor && (
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
            className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedExhibitor.companyName}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Contact Person:</span> {selectedExhibitor.contactPerson}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span> {selectedExhibitor.email}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span> {selectedExhibitor.phone}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    <a href={selectedExhibitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                      {selectedExhibitor.website}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span> {selectedExhibitor.businessCategory}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Payment Status:</span>
                    <span className={`ml-1 ${selectedExhibitor.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedExhibitor.paymentStatus}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Booth Request</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Size:</span> {selectedExhibitor.requestedBoothSize}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span> {selectedExhibitor.requestedBoothLocation}
                  </div>
                  {selectedExhibitor.assignedBooth && (
                    <div>
                      <span className="font-medium text-gray-700">Assigned Booth:</span>
                      <span className="text-green-600 font-bold ml-1">#{selectedExhibitor.assignedBooth}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Products & Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExhibitor.products.map((product, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {product}
                    </span>
                  ))}
                </div>

                {selectedExhibitor.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-medium text-red-800">Rejection Reason:</span>
                    <p className="text-red-700 mt-1">{selectedExhibitor.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Description</h3>
                <p className="text-gray-600 mb-6">{selectedExhibitor.description}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                <div className="space-y-2">
                  {selectedExhibitor.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{doc}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </div>
                  ))}
                </div>

                {selectedExhibitor.status === 'pending' && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          const boothNumber = prompt('Enter booth number:');
                          if (boothNumber) {
                            handleStatusChange(selectedExhibitor.id, 'approved', boothNumber);
                            setShowDetailsModal(false);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      >
                        Approve & Assign Booth
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) {
                            handleStatusChange(selectedExhibitor.id, 'rejected', null, reason);
                            setShowDetailsModal(false);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ExhibitorsManagement;
