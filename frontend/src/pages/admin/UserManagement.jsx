import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Calendar, Crown, Shield, User, Edit, Trash2, X, Check, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'attendee',
    isVerified: false
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    roles: [],
    verificationStatus: 'all', // 'all', 'verified', 'pending'
    dateRange: {
      from: '',
      to: ''
    }
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Crown;
      case 'organizer':
        return Shield;
      case 'exhibitor':
        return Users;
      case 'attendee':
        return User;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'organizer':
        return 'bg-blue-100 text-blue-800';
      case 'exhibitor':
        return 'bg-green-100 text-green-800';
      case 'attendee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = (user) => {
    setDeletingUser(user);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    setError('');

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/${editingUser._id}`, formData);

      // Update user in the list
      setUsers(users.map(u => u._id === editingUser._id ? response.data : u));

      setSuccess('User updated successfully');
      setEditingUser(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    setError('');

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${deletingUser._id}`);

      // Remove user from the list
      setUsers(users.filter(u => u._id !== deletingUser._id));

      setSuccess('User deleted successfully');
      setDeletingUser(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (filters.roles.length > 0) {
      filtered = filtered.filter(user => filters.roles.includes(user.role));
    }

    // Apply verification status filter
    if (filters.verificationStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.verificationStatus === 'verified') return user.isVerified;
        if (filters.verificationStatus === 'pending') return !user.isVerified;
        return true;
      });
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

        if (fromDate && userDate < fromDate) return false;
        if (toDate && userDate > toDate) return false;
        return true;
      });
    }

    return filtered;
  }, [users, debouncedSearchQuery, filters]);

  // Filter handlers
  const handleRoleToggle = (role) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      roles: [],
      verificationStatus: 'all',
      dateRange: { from: '', to: '' }
    });
  };

  const closeModals = () => {
    setEditingUser(null);
    setDeletingUser(null);
    setError('');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
          >
            <Check className="text-green-500 mr-2" size={20} />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Clear Filters */}
          {(searchQuery || filters.roles.length > 0 || filters.verificationStatus !== 'all' || filters.dateRange.from || filters.dateRange.to) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XIcon size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <div className="space-y-2">
                      {['admin', 'organizer', 'exhibitor', 'attendee'].map((role) => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.roles.includes(role)}
                            onChange={() => handleRoleToggle(role)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Verification Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.verificationStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="verified">Verified Only</option>
                      <option value="pending">Pending Only</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        placeholder="From"
                        value={filters.dateRange.from}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        placeholder="To"
                        value={filters.dateRange.to}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.roles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {role}
              <button
                onClick={() => handleRoleToggle(role)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <XIcon size={12} />
              </button>
            </span>
          ))}
          {filters.verificationStatus !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              {filters.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
              <button
                onClick={() => setFilters(prev => ({ ...prev, verificationStatus: 'all' }))}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Date Range
              <button
                onClick={() => setFilters(prev => ({ ...prev, dateRange: { from: '', to: '' } }))}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="text-gray-400 mb-2" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                      <p className="text-gray-600">
                        {searchQuery || filters.roles.length > 0 || filters.verificationStatus !== 'all' || filters.dateRange.from || filters.dateRange.to
                          ? 'Try adjusting your search or filters'
                          : 'No users available'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => {
                  const RoleIcon = getRoleIcon(userItem.role);
                  return (
                    <motion.tr key={userItem._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User size={16} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userItem.username}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail size={14} className="mr-1" />
                              {userItem.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                          <RoleIcon size={14} className="mr-1" />
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userItem.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(userItem)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(userItem)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          disabled={userItem._id === currentUser._id}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={editingUser._id === currentUser._id}
                  >
                    <option value="attendee">Attendee</option>
                    <option value="exhibitor">Exhibitor</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editingUser._id === currentUser._id && (
                    <p className="text-xs text-gray-500 mt-1">Cannot change your own role</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVerified" className="ml-2 text-sm text-gray-700">
                    Verified Account
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deletingUser.username}</strong>?
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
