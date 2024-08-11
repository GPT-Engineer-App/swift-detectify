import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as ort from 'onnxruntime-web';

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
    if (!modelFile) {
      console.error('Model file not found');
      return null;
    }

    try {
      const modelArrayBuffer = modelFile instanceof Uint8Array ? modelFile.buffer : modelFile;
      
      // Check if it's an ONNX model
      if (settings.modelFileName.endsWith('.onnx')) {
        const session = await ort.InferenceSession.create(modelArrayBuffer);
        loadedModel = {
          type: 'onnx',
          session: session
        };
        console.log('ONNX model loaded successfully');
      } else {
        // Assume it's a TensorFlow.js model
        const modelJson = JSON.parse(new TextDecoder().decode(modelArrayBuffer));
        const modelArtifacts = {
          modelTopology: modelJson.modelTopology,
          weightSpecs: modelJson.weightSpecs,
          weightData: modelJson.weightData ? new Uint8Array(modelJson.weightData).buffer : null,
          format: modelJson.format,
          generatedBy: modelJson.generatedBy,
          convertedBy: modelJson.convertedBy
        };
        loadedModel = {
          type: 'tfjs',
          model: await tf.loadGraphModel(tf.io.fromMemory(modelArtifacts))
        };
        console.log('TensorFlow.js model loaded successfully');
      }
      return loadedModel;
    } catch (error) {
      console.error('Failed to load the model:', error);
      return null;
    }
  };

  return { settings, updateSettings, getModelFile, loadModel };
}
