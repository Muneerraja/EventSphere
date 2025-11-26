const { Notification, User } = require('../models');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.createNotification = async (userId, title, message, data = {}, sendEmail = true) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      data,
      sendEmail
    });
    await notification.save();

    // Send email if enabled
    if (sendEmail) {
      const user = await User.findById(userId);
      if (user) {
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: user.email,
          subject: title,
          html: `<p>${message}</p>`
        };
        await transporter.sendMail(mailOptions);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

exports.sendSessionReminder = async (sessionId) => {
  try {
    // This would be called by a scheduler for upcoming sessions
    // For now, just create the function
    console.log('Sending reminder for session:', sessionId);
  } catch (error) {
    console.error('Error sending session reminder:', error);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    console.log('=== DEBUGGING NOTIFICATIONS ===');
    console.log('Request user object:', req.user);
    console.log('User ID:', req.user ? req.user._id : 'No user ID');
    console.log('User role:', req.user ? req.user.role : 'No user role');

    // Check if user exists and has _id
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found!');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Querying notifications with user ID:', req.user._id);

    // Try the query and catch any mongoose-specific errors
    let notifications;
    try {
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Successfully found notifications:', notifications.length);
    res.json(notifications);

  } catch (error) {
    console.error('=== NOTIFICATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);

    // Check if it's a mongoose connection error
    if (error.name === 'MongooseError') {
      console.error('Mongoose connection error detected');
    }

    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
