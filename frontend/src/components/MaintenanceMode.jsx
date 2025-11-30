import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { Settings, Clock } from 'lucide-react';

const MaintenanceMode = () => {
  const { settings } = useSettings();

  if (!settings?.general?.maintenanceMode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Settings className="w-8 h-8 text-blue-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {settings.general.siteTitle || 'EventSphere'} is Under Maintenance
        </h1>

        <p className="text-gray-600 mb-6">
          We're currently performing some scheduled maintenance to improve your experience.
          We'll be back online shortly.
        </p>

        <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span>Expected downtime: A few minutes</span>
        </div>

        <div className="text-xs text-gray-400">
          If you need immediate assistance, please contact us at{' '}
          <a
            href={`mailto:${settings.general.contactEmail || 'info@eventsphere.com'}`}
            className="text-blue-600 hover:underline"
          >
            {settings.general.contactEmail || 'info@eventsphere.com'}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MaintenanceMode;
