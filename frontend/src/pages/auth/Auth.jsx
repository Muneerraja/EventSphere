import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, User, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Auth = () => {
  const { login, register, forgotPassword, loading, error } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'attendee'
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const result = await forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage(result.message);
    } catch (error) {
      console.error('Error sending forgot password email:', error);
      setForgotPasswordMessage('Failed to send password reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      }
    } else {
      result = await register(formData);
      if (result.success) {
        setRegisterSuccess(true);
      }
    }
  };

  const tabVariants = {
    active: { backgroundColor: '#2563eb', color: '#ffffff' },
    inactive: { backgroundColor: '#f3f4f6', color: '#374151' }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">EventSphere</h1>
                <p className="text-blue-100">Reset your password</p>
              </div>
            </div>

            {/* Form Container */}
            <div className="px-8 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Login</span>
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
                <p className="text-gray-600 mb-8">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-gray-400" size={20} />
                      </div>
                      <motion.input
                        type="email"
                        id="forgotEmail"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {forgotPasswordMessage && (
                    <div className="text-center p-4 rounded-lg bg-blue-50 text-blue-700">
                      {forgotPasswordMessage}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                      forgotPasswordLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </motion.div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 text-center"
          >
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to Homepage
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">EventSphere</h1>
              <p className="text-blue-100">Welcome back to your event management platform</p>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex bg-gray-100 rounded-t-xl overflow-hidden">
            <motion.button
              variants={tabVariants}
              animate={isLogin ? 'active' : 'inactive'}
              onClick={() => {
                setIsLogin(true);
                setRegisterSuccess(false);
                setFormData({ ...formData, username: '', role: 'attendee' });
              }}
              className="flex-1 py-4 px-6 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>Login</span>
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={!isLogin ? 'active' : 'inactive'}
              onClick={() => {
                setIsLogin(false);
                setRegisterSuccess(false);
                setFormData({ ...formData, password: '' });
              }}
              className="flex-1 py-4 px-6 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
            >
              <UserPlus size={20} />
              <span>Register</span>
            </motion.button>
          </div>

          {/* Form Container */}
          <div className="px-8 py-8">
            {registerSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Welcome to EventSphere! You can now login with your credentials.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLogin(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Login
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {isLogin ? 'Sign in to your account to continue' : 'Join thousands of event organizers and attendees'}
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={20} />
                          </div>
                          <motion.input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required={!isLogin}
                            whileFocus={{ scale: 1.02 }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Choose a username"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                          I am registering as
                        </label>
                        <motion.select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          whileFocus={{ scale: 1.02 }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="attendee">Attendee</option>
                          <option value="exhibitor">Exhibitor</option>
                          <option value="organizer">Event Organizer</option>
                        </motion.select>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-gray-400" size={20} />
                      </div>
                      <motion.input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={20} />
                      </div>
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        whileFocus={{ scale: 1.02 }}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="text-gray-400" size={20} /> : <Eye className="text-gray-400" size={20} />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex justify-between items-center text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <>
                        {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      </>
                    )}
                  </motion.button>
                </form>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-6 text-center"
                >
                  {!isLogin && (
                    <p className="text-gray-600">
                      By registering, you agree to our{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
                    </p>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 text-center"
        >
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← Back to Homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
