import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'EventSphere',
      contactEmail: 'info@eventsphere.com',
      supportPhone: '+1 (555) 123-4567',
      siteDescription: 'Professional event management platform for organizers, exhibitors, and attendees.',
      timezone: 'Asia/Karachi',
      maintenanceMode: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

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
