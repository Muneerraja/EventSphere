const mongoose = require('mongoose');
const { Attendee, Session, Expo, Booth, Exhibitor, User } = require('../models');

exports.getPlatformAnalytics = async (req, res) => {
  try {
    console.log('Starting analytics calculation...');

    // Platform-wide analytics for admin dashboard
    const totalExpos = await Expo.countDocuments();
    console.log('totalExpos:', totalExpos);
    const totalUsers = await User.countDocuments();
    console.log('totalUsers:', totalUsers);

    const activeExpos = await Expo.find({
      date: { $gte: new Date() }
    });

    // Calculate new users this month
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    // Calculate events this month
    const eventsThisMonth = await Expo.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    // Return basic analytics response
    return res.json({
      platformOverview: {
        totalExpos,
        activeExpos: activeExpos.length,
        totalUsers,
        totalRevenue: 0,
        newUsersThisMonth,
        eventsThisMonth
      },
      attendanceTrends: [],
      eventCategories: [],
      userEngagementMetrics: {
        averageSessionDuration: 85,
        completionRate: 0,
        repeatVisitors: 0,
        mobileUsers: 68
      },
      topPerformingExpos: [],
      revenueBreakdown: [
        { source: 'Booth Rentals', amount: 0, percentage: 30 },
        { source: 'Ticket Sales', amount: 0, percentage: 60 },
        { source: 'Sponsorships', amount: 0, percentage: 10 }
      ],
      regionalDistribution: [
        { region: 'Karachi', users: Math.floor(totalUsers * 0.3), events: Math.floor(totalExpos * 0.4) },
        { region: 'Lahore', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.3) },
        { region: 'Islamabad', users: Math.floor(totalUsers * 0.2), events: Math.floor(totalExpos * 0.2) },
        { region: 'Other', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.1) }
      ]
    });
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
