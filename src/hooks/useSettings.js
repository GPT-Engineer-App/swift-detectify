import { useState, useEffect } from 'react';
import { openDB } from 'idb';

const defaultSettings = {
  detectionThreshold: 0.3,
  updateInterval: 500,
  modelFileName: null,
};

const dbPromise = openDB('SettingsDB', 1, {
  upgrade(db) {
    db.createObjectStore('settings');
    db.createObjectStore('modelFiles');
  },
});

export function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const db = await dbPromise;
      const storedSettings = await db.get('settings', 'appSettings');
      if (storedSettings) {
        setSettings(storedSettings);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const updatedSettings = {
      detectionThreshold: parseFloat(newSettings.detectionThreshold) || defaultSettings.detectionThreshold,
      updateInterval: parseInt(newSettings.updateInterval, 10) || defaultSettings.updateInterval,
      modelFileName: newSettings.modelFile ? newSettings.modelFile.name : null,
    };
    setSettings(updatedSettings);
    const db = await dbPromise;
    await db.put('settings', updatedSettings, 'appSettings');
    if (newSettings.modelFile) {
      await db.put('modelFiles', newSettings.modelFile.content, newSettings.modelFile.name);
    }
  };

  const getModelFile = async (fileName) => {
    if (!fileName) return null;
    const db = await dbPromise;
    return await db.get('modelFiles', fileName);
  };

  return { settings, updateSettings, getModelFile };
}
