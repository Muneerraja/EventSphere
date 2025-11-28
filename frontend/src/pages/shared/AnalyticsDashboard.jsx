import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Building,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExpo, setSelectedExpo] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedExpo, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set analytics to null on error
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Analytics data not available</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and event metrics</p>
        </div>

        <div className="flex space-x-4 mt-4 lg:mt-0">
          <select
            value={selectedExpo}
            onChange={(e) => setSelectedExpo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="active">Active Events</option>
            <option value="completed">Completed Events</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            icon: Calendar,
            label: 'Total Events',
            value: analytics.platformOverview.totalExpos,
            change: `+${analytics.platformOverview.eventsThisMonth} this month`,
            changeType: 'positive'
          },
          {
            icon: Users,
            label: 'Total Users',
            value: analytics.platformOverview.totalUsers.toLocaleString(),
            change: `+${analytics.platformOverview.newUsersThisMonth} this month`,
            changeType: 'positive'
          },
          {
            icon: DollarSign,
            label: 'Total Revenue',
            value: formatCurrency(analytics.platformOverview.totalRevenue),
            change: '+12% from last month',
            changeType: 'positive'
          },
          {
            icon: Activity,
            label: 'Active Events',
            value: analytics.platformOverview.activeExpos,
            change: 'Currently running',
            changeType: 'neutral'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp
                      className={`mr-1 ${
                        metric.changeType === 'positive' ? 'text-green-500' :
                        metric.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                      }`}
                      size={14}
                    />
                    <span className={`text-sm ${
                      metric.changeType === 'positive' ? 'text-green-600' :
                      metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            Attendance Trends
          </h2>
          <div className="space-y-4">
            {analytics.attendanceTrends.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{month.month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(month.attendees / 1050) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="bg-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                  {month.attendees}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Total attendance growth: +134% over 6 months</p>
          </div>
        </motion.div>

        {/* Event Categories Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart size={20} className="mr-2" />
            Event Categories
          </h2>
          <div className="space-y-4">
            {analytics.eventCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{category.count} events</span>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Performing Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Top Performing Events</h2>
          <p className="text-gray-600 text-sm">Events ranked by attendance and engagement</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topPerformingExpos.map((expo, index) => (
                <motion.tr
                  key={expo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expo.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {expo.attendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(expo.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Star className="text-yellow-400 mr-1" size={14} />
                      {expo.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      expo.growth > 0 ? 'text-green-600' : expo.growth < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {expo.growth > 0 ? <TrendingUp size={14} className="mr-1" /> : expo.growth < 0 ? <TrendingDown size={14} className="mr-1" /> : null}
                      {expo.growth > 0 ? '+' : ''}{expo.growth}%
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Engagement & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">User Engagement</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock size={24} className="mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{analytics.userEngagementMetrics.averageSessionDuration}min</div>
              <div className="text-sm text-gray-600">Avg Session Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{analytics.userEngagementMetrics.completionRate}%</div>
              <div className="text-sm text-gray-600">Session Completion</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users size={24} className="mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{analytics.userEngagementMetrics.repeatVisitors}%</div>
              <div className="text-sm text-gray-600">Repeat Visitors</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Eye size={24} className="mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{analytics.userEngagementMetrics.mobileUsers}%</div>
              <div className="text-sm text-gray-600">Mobile Users</div>
            </div>
          </div>
        </motion.div>

        {/* Regional Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Regional Distribution</h2>
          <div className="space-y-4">
            {analytics.regionalDistribution.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{region.region}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">{region.users} users</span>
                  <span className="text-gray-600">{region.events} events</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.revenueBreakdown.map((source, index) => (
            <div key={source.source} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(source.amount)}</div>
              <div className="text-sm text-gray-600 mt-1">{source.source}</div>
              <div className="text-lg font-semibold text-blue-600 mt-1">{source.percentage}%</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${source.percentage}%` }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
