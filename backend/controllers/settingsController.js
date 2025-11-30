// Simple settings controller using in-memory storage for demo
// In production, this would use a database
let systemSettings = {
  general: {
    siteTitle: 'EventSphere',
    siteDescription: 'Professional event management platform for organizers, exhibitors, and attendees.',
    contactEmail: 'info@eventsphere.com',
    supportPhone: '+1 (555) 123-4567',
    timezone: 'Asia/Karachi',
    maintenanceMode: false
  },
  security: {
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireTwoFactor: false,
    enableCaptcha: true
  },
  email: {
    smtpHost: process.env.MAIL_HOST || 'smtp.gmail.com',
    smtpPort: process.env.MAIL_PORT || 587,
    smtpUsername: process.env.MAIL_USER || '',
    fromEmail: process.env.MAIL_USER || '',
    fromName: 'EventSphere',
    smtpUseTLS: true
  },
  database: {
    backupFrequency: 'daily',
    maxConnections: 100,
    queryTimeout: 30,
    logQueries: false
  },
  appearance: {
    theme: 'light',
    primaryColor: '#2563EB',
    logoUrl: '',
    faviconUrl: ''
  },
  features: {
    allowSelfRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    enableAnalytics: true,
    maxEventsPerUser: 10,
    maxSessionsPerEvent: 20
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
    if (updates.security) {
      systemSettings.security = { ...systemSettings.security, ...updates.security };
    }
    if (updates.email) {
      systemSettings.email = { ...systemSettings.email, ...updates.email };
    }
    if (updates.database) {
      systemSettings.database = { ...systemSettings.database, ...updates.database };
    }
    if (updates.appearance) {
      systemSettings.appearance = { ...systemSettings.appearance, ...updates.appearance };
    }
    if (updates.features) {
      systemSettings.features = { ...systemSettings.features, ...updates.features };
    }

    systemSettings.updatedAt = new Date();
    systemSettings.updatedBy = req.user.id;

    // Emit real-time settings update to all connected users
    if (global.emitToAll) {
      global.emitToAll('settingsUpdated', systemSettings);
    }

    res.json({
      ...systemSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
};
