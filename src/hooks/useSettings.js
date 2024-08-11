import { useState, useEffect } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState({
    detectionThreshold: 0.3,
    updateInterval: 500,
    modelPath: '',
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}
