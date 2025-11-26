const mongoose = require('mongoose');
const { Attendee, Session, Expo, Booth, Exhibitor, User } = require('../models');

exports.getPlatformAnalytics = async (req, res) => {
  try {
    // Platform-wide analytics for admin dashboard
    const totalExpos = await Expo.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAttendees = await Attendee.countDocuments();
    const totalSessions = await Session.countDocuments();

    const activeExpos = await Expo.find({
      date: { $gte: new Date() }
    });

    // Attendance trends (simplified)
    const attendanceTrends = [
      { month: 'Jan', attendees: Math.floor(Math.random() * 1000) + 500 },
      { month: 'Feb', attendees: Math.floor(Math.random() * 1000) + 600 },
      { month: 'Mar', attendees: Math.floor(Math.random() * 1000) + 700 },
      { month: 'Apr', attendees: Math.floor(Math.random() * 1000) + 800 },
      { month: 'May', attendees: Math.floor(Math.random() * 1000) + 900 },
      { month: 'Jun', attendees: Math.floor(Math.random() * 1000) + 1000 }
    ];

    // Event categories (hardcoded for demo)
    const eventCategories = [
      { name: 'Technology', count: Math.floor(totalExpos * 0.4), percentage: 40 },
      { name: 'Healthcare', count: Math.floor(totalExpos * 0.25), percentage: 25 },
      { name: 'Business', count: Math.floor(totalExpos * 0.2), percentage: 20 },
      { name: 'Education', count: Math.floor(totalExpos * 0.1), percentage: 10 },
      { name: 'Other', count: Math.floor(totalExpos * 0.05), percentage: 5 }
    ];

    // User engagement metrics
    const userEngagementMetrics = {
      averageSessionDuration: 85,
      completionRate: 72,
      repeatVisitors: 58,
      mobileUsers: 68
    };

    // Top performing expos
    const topPerformingExpos = await Expo.find()
      .limit(3)
      .then(expos => expos.map(expo => ({
        id: expo._id,
        title: expo.title,
        attendees: Math.floor(Math.random() * 100) + 200,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        rating: 4.5 + Math.random() * 0.5,
        growth: Math.floor(Math.random() * 20) - 5
      })));

    // Revenue breakdown
    const revenueBreakdown = [
      { source: 'Ticket Sales', amount: 25600, percentage: 60 },
      { source: 'Booth Rentals', amount: 12800, percentage: 30 },
      { source: 'Sponsorships', amount: 4000, percentage: 10 }
    ];

    // Regional distribution
    const regionalDistribution = [
      { region: 'Karachi', users: Math.floor(totalUsers * 0.3), events: Math.floor(totalExpos * 0.4) },
      { region: 'Lahore', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.3) },
      { region: 'Islamabad', users: Math.floor(totalUsers * 0.2), events: Math.floor(totalExpos * 0.2) },
      { region: 'Other', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.1) }
    ];

    const analytics = {
      platformOverview: {
        totalExpos,
        activeExpos: activeExpos.length,
        totalUsers,
        totalRevenue: Math.floor(Math.random() * 100000) + 50000,
        newUsersThisMonth: Math.floor(totalUsers * 0.1),
        eventsThisMonth: Math.floor(activeExpos.length * 0.3)
      },
      attendanceTrends,
      eventCategories,
      userEngagementMetrics,
      topPerformingExpos,
      revenueBreakdown,
      regionalDistribution
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error generating platform analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getExpoAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const expo = await Expo.findById(id);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });

    // Attendee Engagement Metrics
    const totalAttendees = await Attendee.countDocuments({ registeredExpos: id });
    const sessionBookmarked = await Attendee.find({ bookmarkedSessions: { $exists: true, $ne: [] } })
      .populate({
        path: 'bookmarkedSessions',
        match: { expo: id }
      });
    const activeBookmarkers = sessionBookmarked.filter(attendee =>
      attendee.bookmarkedSessions.some(session => session._id)
    ).length;

    // Hall Capacity KPI (if floorPlan defines capacity)
    const totalBoothSpaces = expo.floorPlan ? expo.floorPlan.length : 0;
    const assignedBooths = expo.floorPlan ? expo.floorPlan.filter(booth => booth.available === false).length : 0;
    const boothUtilizationRate = totalBoothSpaces > 0 ? (assignedBooths / totalBoothSpaces * 100).toFixed(1) : 0;

    // Session Popularity Stats - using aggregation
    const sessionStats = await Session.aggregate([
      { $match: { expo: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalAttendance: { $sum: { $size: '$attendance' } },
          averageAttendance: { $avg: { $size: '$attendance' } },
          totalRatings: { $sum: { $size: '$ratings' } }
        }
      }
    ]);

    const sessionAnalytics = sessionStats[0] || {
      totalSessions: 0,
      totalAttendance: 0,
      averageAttendance: 0,
      totalRatings: 0,
      averageRating: 0
    };

    // Real-time KPIs
    const totalExhibitors = await Exhibitor.countDocuments({ expoApplication: id });
    const approvedExhibitors = await Exhibitor.countDocuments({ expoApplication: id, status: 'approved' });

    // Response structure
    const analytics = {
      expoId: id,
      expoTitle: expo.title,
      date: expo.date,

      attendeeEngagement: {
        totalRegistered: totalAttendees,
        activeBookmarkers: activeBookmarkers,
        engagementRate: totalAttendees > 0 ? ((activeBookmarkers / totalAttendees) * 100).toFixed(1) : 0
      },

      boothTraffic: {
        totalSpaces: totalBoothSpaces,
        assignedBooths: assignedBooths,
        utilizationRate: `${boothUtilizationRate}%`,
        availableBooths: totalBoothSpaces - assignedBooths
      },

      sessionPopularity: {
        totalSessions: sessionAnalytics.totalSessions,
        totalAttendance: sessionAnalytics.totalAttendance,
        averageAttendancePerSession: Math.round(sessionAnalytics.averageAttendance || 0),
        totalRatingsGiven: sessionAnalytics.totalRatings,
        averageRating: sessionAnalytics.averageRating ? sessionAnalytics.averageRating.toFixed(1) : 'N/A'
      },

      realTimeKPIs: {
        totalExhibitors: totalExhibitors,
        approvedExhibitors: approvedExhibitors,
        approvalRate: totalExhibitors > 0 ? ((approvedExhibitors / totalExhibitors) * 100).toFixed(1) : 0,
        totalCapacityRatio: `${totalAttendees}/${totalBoothSpaces * 3 || '∞'}`, // Rough estimate
        lastUpdated: new Date()
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: error.message });
  }
};
