import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { socket } = useSocket() || {};
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      siteTitle: 'EventSphere',
      contactEmail: 'info@eventsphere.com',
      supportPhone: '+1 (555) 123-4567',
      siteDescription: 'Professional event management platform for organizers, exhibitors, and attendees.',
      timezone: 'Asia/Karachi',
      maintenanceMode: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    } else {
      setLoading(false); // Don't try to fetch if not authenticated
    }
  }, [isAuthenticated]);

  // Real-time settings synchronization
  useEffect(() => {
    if (socket && isAuthenticated) {
      socket.on('settingsUpdated', (updatedSettings) => {
        setSettings(updatedSettings);
      });

      return () => {
        socket.off('settingsUpdated');
      };
    }
  }, [socket, isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/settings`, newSettings);
      setSettings(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    refetchSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
