import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../services/storageService';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  theme: 'light',
  defaultOvers: 10,
  defaultPlayersPerTeam: 11,
  soundEnabled: false,
  confirmBeforeWicket: true
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const value = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
