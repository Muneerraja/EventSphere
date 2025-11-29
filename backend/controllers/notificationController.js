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
    // Check if user exists and has _id
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);

  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
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
