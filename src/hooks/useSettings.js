import { useState, useEffect } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState({
    detectionThreshold: 0.3,
    updateInterval: 500,
    modelFile: null,
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings,
          detectionThreshold: parseFloat(parsedSettings.detectionThreshold) || 0.3,
          updateInterval: parseInt(parsedSettings.updateInterval, 10) || 500,
          modelFile: parsedSettings.modelFile ? parsedSettings.modelFile : null,
        }));
      } catch (error) {
        console.error('Error parsing stored settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = {
      ...newSettings,
      detectionThreshold: parseFloat(newSettings.detectionThreshold),
      updateInterval: parseInt(newSettings.updateInterval, 10),
      modelFile: newSettings.modelFile,
    };
    setSettings(updatedSettings);
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  };

  return { settings, updateSettings };
}
