import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const defaultSettings = {
  detectionThreshold: 0.3,
  updateInterval: 500,
  modelFileName: null,
};

let loadedModel = null;

const dbPromise = openDB('SettingsDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings');
    }
    if (!db.objectStoreNames.contains('modelFiles')) {
      db.createObjectStore('modelFiles');
    }
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
      modelFileName: newSettings.modelFile ? newSettings.modelFile.name : settings.modelFileName,
    };
    setSettings(updatedSettings);
    const db = await dbPromise;
    await db.put('settings', updatedSettings, 'appSettings');
    if (newSettings.modelFile && newSettings.modelFile.content) {
      await db.put('modelFiles', newSettings.modelFile.content, newSettings.modelFile.name);
    }
  };

  const getModelFile = async (fileName) => {
    if (!fileName) return null;
    const db = await dbPromise;
    return await db.get('modelFiles', fileName);
  };

  const loadModel = async () => {
    if (loadedModel) return loadedModel;
    
    const modelFile = await getModelFile(settings.modelFileName);
    if (!modelFile) return null;

    try {
      const modelArrayBuffer = modelFile instanceof Uint8Array ? modelFile : new Uint8Array(modelFile);
      const modelJson = JSON.parse(new TextDecoder().decode(modelArrayBuffer));
      loadedModel = await tf.loadGraphModel(tf.io.fromMemory(modelJson));
      console.log('TensorFlow.js model loaded successfully');
      return loadedModel;
    } catch (error) {
      console.error('Failed to load the TensorFlow.js model:', error);
      return null;
    }
  };

  return { settings, updateSettings, getModelFile, loadModel };
}
