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
      console.error('Model file not found in IndexedDB');
      throw new Error('Model file not found. Please upload a model file in the settings.');
    }

    try {
      const modelArrayBuffer = modelFile instanceof Uint8Array ? modelFile.buffer : modelFile;
      
      console.log('Model file size:', modelArrayBuffer.byteLength, 'bytes');
      console.log('First few bytes:', new Uint8Array(modelArrayBuffer.slice(0, 10)));

      // Check if it's a compressed file (ZIP)
      if (modelArrayBuffer.byteLength > 2 && new Uint8Array(modelArrayBuffer.slice(0, 2)).every((v, i) => v === [0x50, 0x4B][i])) {
        console.log('Detected compressed model file. Attempting to unzip...');
        const { unzipSync } = await import('fflate');
        const unzipped = unzipSync(new Uint8Array(modelArrayBuffer));
        
        console.log('Unzipped files:', Object.keys(unzipped));

        // Assume the main model file is named 'model.json' or ends with '.onnx'
        const modelEntry = Object.entries(unzipped).find(([name]) => name === 'model.json' || name.endsWith('.onnx'));
        
        if (!modelEntry) {
          throw new Error('No valid model file found in the compressed archive. Expected "model.json" or a file ending with ".onnx".');
        }
        
        const [fileName, fileContent] = modelEntry;
        
        if (fileName.endsWith('.onnx')) {
          const session = await ort.InferenceSession.create(fileContent.buffer);
          loadedModel = {
            type: 'onnx',
            session: session
          };
          console.log('ONNX model loaded successfully from compressed file');
        } else {
          const modelJson = JSON.parse(new TextDecoder().decode(fileContent));
          console.log('Model JSON structure:', Object.keys(modelJson));
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
          console.log('TensorFlow.js model loaded successfully from compressed file');
        }
      } else {
        // Existing logic for non-compressed files
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
          console.log('Model JSON structure:', Object.keys(modelJson));
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
      }
      return loadedModel;
    } catch (error) {
      console.error('Failed to load the model:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  };

  return { settings, updateSettings, getModelFile, loadModel };
}
