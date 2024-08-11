import { useState, useEffect } from 'react';

const defaultSettings = {
  detectionThreshold: 0.3,
  updateInterval: 500,
  modelFile: null,
};

export function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({
          detectionThreshold: parseFloat(parsedSettings.detectionThreshold) || defaultSettings.detectionThreshold,
          updateInterval: parseInt(parsedSettings.updateInterval, 10) || defaultSettings.updateInterval,
          modelFile: parsedSettings.modelFile ? {
            name: parsedSettings.modelFile.name,
            content: new Uint8Array(parsedSettings.modelFile.content),
          } : null,
        });
      } catch (error) {
        console.error('Error parsing stored settings:', error);
        setSettings(defaultSettings);
      }
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = {
      detectionThreshold: parseFloat(newSettings.detectionThreshold) || defaultSettings.detectionThreshold,
      updateInterval: parseInt(newSettings.updateInterval, 10) || defaultSettings.updateInterval,
      modelFile: newSettings.modelFile ? {
        name: newSettings.modelFile.name,
        content: Array.from(newSettings.modelFile.content), // Convert Uint8Array to regular array for JSON serialization
      } : null,
    };
    setSettings(updatedSettings);
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  };

  return { settings, updateSettings };
}
