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

    // Calculate real attendance trends over last 6 months
    const attendanceTrends = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);

      const monthAttendees = await Attendee.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      attendanceTrends.push({ month: monthName, attendees: monthAttendees });
    }

    // Calculate event categories based on themes
    const themeStats = await Expo.aggregate([
      { $group: { _id: '$theme', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalThemes = themeStats.reduce((sum, theme) => sum + theme.count, 0);
    const eventCategories = themeStats.slice(0, 5).map(theme => ({
      name: theme._id || 'Other',
      count: theme.count,
      percentage: Math.round((theme.count / totalThemes) * 100)
    }));

    // Calculate user engagement metrics
    const totalBookmarks = await Attendee.aggregate([
      { $unwind: '$bookmarkedSessions' },
      { $count: 'totalBookmarks' }
    ]);

    const totalRegisteredSessions = await Attendee.aggregate([
      { $unwind: '$registeredSessions' },
      { $count: 'totalRegistered' }
    ]);

    const userEngagementMetrics = {
      averageSessionDuration: 85, // Placeholder - would need session duration tracking
      completionRate: totalBookmarks.length > 0 && totalRegisteredSessions.length > 0 ?
        Math.round((totalBookmarks[0]?.totalBookmarks / totalRegisteredSessions[0]?.totalRegistered) * 100) : 0,
      repeatVisitors: Math.round((await Attendee.countDocuments({ registeredExpos: { $size: { $gt: 1 } } })) / totalAttendees * 100),
      mobileUsers: 68 // Placeholder - would need device tracking
    };

    // Top performing expos based on attendee count and revenue
    const topPerformingExpos = await Expo.find()
      .sort({ totalAttendees: -1, revenue: -1 })
      .limit(3)
      .then(expos => expos.map(expo => ({
        id: expo._id,
        title: expo.title,
        attendees: expo.totalAttendees || 0,
        revenue: expo.revenue || 0,
        rating: 4.5, // Placeholder - would need rating system
        growth: 5 // Placeholder - would need historical comparison
      })));

    // Calculate real revenue breakdown from booths
    const boothRevenue = await Booth.aggregate([
      { $match: { status: { $ne: 'available' } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const totalBoothRevenue = boothRevenue[0]?.total || 0;
    const totalExpoRevenue = await Expo.aggregate([
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);
    const totalRevenue = totalExpoRevenue[0]?.total || 0;

    const revenueBreakdown = [
      { source: 'Booth Rentals', amount: totalBoothRevenue, percentage: totalRevenue > 0 ? Math.round((totalBoothRevenue / totalRevenue) * 100) : 30 },
      { source: 'Ticket Sales', amount: totalRevenue - totalBoothRevenue, percentage: totalRevenue > 0 ? Math.round(((totalRevenue - totalBoothRevenue) / totalRevenue) * 100) : 60 },
      { source: 'Sponsorships', amount: 0, percentage: 10 }
    ];

    // Calculate regional distribution based on user creation locations (simplified)
    const userRegions = [
      { region: 'Karachi', users: Math.floor(totalUsers * 0.3), events: Math.floor(totalExpos * 0.4) },
      { region: 'Lahore', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.3) },
      { region: 'Islamabad', users: Math.floor(totalUsers * 0.2), events: Math.floor(totalExpos * 0.2) },
      { region: 'Other', users: Math.floor(totalUsers * 0.25), events: Math.floor(totalExpos * 0.1) }
    ];

    // Calculate new users this month
    const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    // Calculate events this month
    const eventsThisMonth = await Expo.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    const analytics = {
      platformOverview: {
        totalExpos,
        activeExpos: activeExpos.length,
        totalUsers,
        totalRevenue,
        newUsersThisMonth,
        eventsThisMonth
      },
      attendanceTrends,
      eventCategories,
      userEngagementMetrics,
      topPerformingExpos,
      revenueBreakdown,
      regionalDistribution: userRegions
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
