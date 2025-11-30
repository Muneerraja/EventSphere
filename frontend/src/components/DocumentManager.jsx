import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const DocumentManager = () => {
  const { settings } = useSettings();

  // Update document title
  useEffect(() => {
    if (settings?.general?.siteTitle) {
      document.title = settings.general.siteTitle;
    }
  }, [settings?.general?.siteTitle]);

  // Update meta description
  useEffect(() => {
    if (settings?.general?.siteDescription) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = settings.general.siteDescription;
    }
  }, [settings?.general?.siteDescription]);

  // Update favicon
  useEffect(() => {
    if (settings?.appearance?.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.appearance.faviconUrl;
    }
  }, [settings?.appearance?.faviconUrl]);

  // Update theme CSS variables
  useEffect(() => {
    if (settings?.appearance?.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', settings.appearance.primaryColor);
    }
  }, [settings?.appearance?.primaryColor]);

  // Update theme class on body
  useEffect(() => {
    if (settings?.appearance?.theme) {
      const body = document.body;
      // Remove existing theme classes
      body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      // Add current theme class
      body.classList.add(`theme-${settings.appearance.theme}`);
    }
  }, [settings?.appearance?.theme]);

  return null; // This component doesn't render anything
};

export default DocumentManager;
