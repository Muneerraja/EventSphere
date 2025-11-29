// Simple settings controller using in-memory storage for demo
// In production, this would use a database
let systemSettings = {
  general: {
    siteName: 'EventSphere',
    siteDescription: 'Professional event management platform for organizers, exhibitors, and attendees.',
    contactEmail: 'info@eventsphere.com',
    supportPhone: '+1 (555) 123-4567',
    timezone: 'Asia/Karachi',
    maintenanceMode: false,
    registrationEnabled: true
  },
  email: {
    smtp: {
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: process.env.MAIL_PORT || 587,
      secure: false,
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASS ? '******' : '' // Mask password
    },
    fromName: 'EventSphere',
    fromEmail: process.env.MAIL_USER,
    notificationTemplates: {
      welcome: true,
      eventReminder: true,
      applicationApproved: true,
      applicationRejected: true
    }
  },
  scheduling: {
    defaultExpoDuration: 8, // hours
    minAdvanceBooking: 24, // hours
    maxAdvanceBooking: 365, // days
    calendarSyncEnabled: true,
    timeZone: 'UTC'
  },
  security: {
    sessionTimeout: 24, // hours
    passwordMinLength: 8,
    twoFactorRequired: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30 // minutes
  },
  payments: {
    currency: 'USD',
    paymentGateway: 'stripe',
    commissionRate: 5, // percentage
    transactionFee: 2.99,
    refundsEnabled: true
  },
  limits: {
    maxExposPerOrganizer: 50,
    maxSessionsPerExpo: 20,
    maxBoothsPerExhibitor: 5,
    maxAttendeesPerExpo: 1000,
    fileUploadSizeLimit: 50 // MB
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    reminderAdvanceTime: 24, // hours
    marketingEmails: false,
    systemAlerts: true
  },
  updatedAt: new Date(),
  updatedBy: 'admin'
};

exports.getSettings = async (req, res) => {
  try {
    // Add current user role for frontend permissions
    const settings = {
      ...systemSettings,
      _permissions: {
        canUpdateGeneral: req.user.role === 'admin',
        canUpdateEmail: req.user.role === 'admin',
        canUpdateSecurity: req.user.role === 'admin',
        canUpdatePayments: req.user.role === 'admin',
        canUpdateLimits: req.user.role === 'admin',
        canUpdateNotifications: req.user.role === 'admin'
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Update system settings with new values
    if (updates.general) {
      systemSettings.general = { ...systemSettings.general, ...updates.general };
    }
    if (updates.email) {
      // Handle password update securely
      if (updates.email.smtp?.password && updates.email.smtp.password !== '******') {
        systemSettings.email.smtp.password = updates.email.smtp.password;
        // In production, you'd hash/store this securely
      }
      systemSettings.email = { ...systemSettings.email, ...updates.email };
    }
    if (updates.scheduling) {
      systemSettings.scheduling = { ...systemSettings.scheduling, ...updates.scheduling };
    }
    if (updates.security) {
      systemSettings.security = { ...systemSettings.security, ...updates.security };
    }
    if (updates.payments) {
      systemSettings.payments = { ...systemSettings.payments, ...updates.payments };
    }
    if (updates.limits) {
      systemSettings.limits = { ...systemSettings.limits, ...updates.limits };
    }
    if (updates.notifications) {
      systemSettings.notifications = { ...systemSettings.notifications, ...updates.notifications };
    }

    systemSettings.updatedAt = new Date();
    systemSettings.updatedBy = req.user.id;

    res.json({
      ...systemSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
};
