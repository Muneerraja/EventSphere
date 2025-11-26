import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Upload, Plus, X, Save, Eye, Star, MapPin, Phone, Mail, Globe, Edit } from 'lucide-react';

const ExhibitorProfile = () => {
  const [profile, setProfile] = useState({
    companyName: 'TechCorp Solutions',
    tagline: 'Leading Technology Solutions Provider',
    description: 'TechCorp Solutions is a premier technology services company specializing in cloud infrastructure, digital transformation, and enterprise software solutions. With over 10 years of experience, we have successfully delivered projects for Fortune 500 companies across multiple industries.',
    industry: 'Technology Services',
    foundedYear: '2014',
    companySize: '51-200',
    logo: '/api/placeholder/150/150',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
    contactEmail: 'business@techcorp.com',
    contactPhone: '+92-21-123-4567',
    address: '123 Business Avenue, Karachi, Pakistan'
  });

  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Cloud Infrastructure Solutions',
      description: 'Comprehensive cloud migration and infrastructure management services',
      category: 'Cloud Services',
      featured: true
    },
    {
      id: '2',
      name: 'AI & Machine Learning Consulting',
      description: 'Expert consulting for AI implementation and machine learning solutions',
      category: 'AI/ML Services',
      featured: false
    },
    {
      id: '3',
      name: 'Cybersecurity Solutions',
      description: 'Advanced security solutions and compliance management',
      category: 'Security',
      featured: true
    }
  ]);

  const [booths, setBooths] = useState([
    {
      id: '1',
      expoTitle: 'Tech Innovation Summit 2025',
      boothId: 'A1',
      status: 'active',
      space: 'Premium Corner Booth - 12x12 sq ft',
      date: '2025-12-15T09:00:00Z'
    }
  ]);

  const [activeTab, setActiveTab] = useState('company');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    featured: false
  });

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload to server
      const reader = new FileReader();
      reader.onload = (e) => {
        handleProfileUpdate('logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.description) {
      setProducts(prev => [...prev, { ...newProduct, id: Date.now().toString() }]);
      setNewProduct({ name: '', description: '', category: '', featured: false });
      setShowAddProduct(false);
      setHasChanges(true);
    }
  };

  const removeProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setHasChanges(true);
  };

  const toggleProductFeatured = (productId) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, featured: !p.featured } : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'products', label: 'Products & Services', icon: Star },
    { id: 'booths', label: 'My Booths', icon: MapPin }
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-1000', '1000+'
  ];

  const industries = [
    'Technology Services', 'Manufacturing', 'Healthcare', 'Financial Services',
    'Education', 'Retail', 'Consulting', 'Media & Entertainment', 'Other'
  ];

  const productCategories = [
    'Software Solutions', 'Cloud Services', 'AI/ML Services', 'Cybersecurity',
    'Consulting', 'Training', 'Hardware', 'Mobile Apps', 'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exhibitor Profile</h1>
          <p className="text-gray-600">Manage your company profile and showcase your products</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profile Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Preview</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={profile.logo}
                  alt="Company Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{profile.companyName}</p>
                  <p className="text-xs text-gray-600">{profile.tagline}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Globe size={14} className="mr-2" />
                  <span>{profile.industry}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={14} className="mr-2" />
                  <span className="truncate">{profile.contactEmail}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={14} className="mr-2" />
                  <span>{profile.contactPhone}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Featured Products:</p>
                <div className="flex flex-wrap gap-1">
                  {products.filter(p => p.featured).slice(0, 2).map(product => (
                    <span key={product.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {product.name.split(' ')[0]}
                    </span>
                  ))}
                  {products.filter(p => p.featured).length > 2 && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{products.filter(p => p.featured).length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            {activeTab === 'company' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Company Information</h2>

                {/* Logo Section */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <img
                      src={profile.logo}
                      alt="Company Logo"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>
                    <p className="text-gray-600 text-sm">Upload a high-quality logo (JPG, PNG, max 5MB)</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 200x200px</p>
                  </div>
                </div>

                {/* Company Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => handleProfileUpdate('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={profile.tagline}
                      onChange={(e) => handleProfileUpdate('tagline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="A brief description of your company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={profile.industry}
                      onChange={(e) => handleProfileUpdate('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      value={profile.companySize}
                      onChange={(e) => handleProfileUpdate('companySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size} employees</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={profile.foundedYear}
                      onChange={(e) => handleProfileUpdate('foundedYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleProfileUpdate('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={profile.contactEmail}
                      onChange={(e) => handleProfileUpdate('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={profile.contactPhone}
                      onChange={(e) => handleProfileUpdate('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                    <textarea
                      rows={3}
                      value={profile.address}
                      onChange={(e) => handleProfileUpdate('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={(e) => handleProfileUpdate('linkedin', e.target.value)}
                        placeholder="LinkedIn URL"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="url"
                        value={profile.twitter}
                        onChange={(e) => handleProfileUpdate('twitter', e.target.value)}
                        placeholder="Twitter URL"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="url"
                        placeholder="Facebook URL (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                    <textarea
                      rows={5}
                      value={profile.description}
                      onChange={(e) => handleProfileUpdate('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your company, mission, and what makes you unique..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Products & Services</h2>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {product.featured ? 'Featured' : 'Standard'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{product.description}</p>
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleProductFeatured(product.id)}
                            className={`p-2 rounded-lg ${
                              product.featured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <Star size={16} fill={product.featured ? 'currentColor' : 'none'} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products added yet</h3>
                    <p className="text-gray-600 mb-6">Showcase your products and services to attract more visitors</p>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Add Your First Product
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'booths' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">My Booth Assignments</h2>

                <div className="space-y-4">
                  {booths.map((booth) => (
                    <motion.div
                      key={booth.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <MapPin className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{booth.expoTitle}</h3>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>Booth ID: <strong>{booth.boothId}</strong></span>
                              <span>•</span>
                              <span>Status: <span className="text-green-600 font-medium">Active</span></span>
                              <span>•</span>
                              <span>{new Date(booth.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 mt-2">{booth.space}</p>
                          </div>
                        </div>
                        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          <Eye size={16} />
                          <span>View Booth</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {booths.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No booth assignments</h3>
                    <p className="text-gray-600 mb-6">Apply for expo events to get booth assignments</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                      Browse Available Expos
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
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
              <Plus size={24} className="text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Add New Product/Service</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {productCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your product/service..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as featured product
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewProduct({ name: '', description: '', category: '', featured: false });
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addProduct}
                disabled={!newProduct.name || !newProduct.description}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ExhibitorProfile;
