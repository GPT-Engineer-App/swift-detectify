import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let model;

export async function loadModel(modelFile) {
  try {
    if (!modelFile || !modelFile.content) {
      throw new Error('Model file is missing or invalid');
    }

    const modelArrayBuffer = modelFile.content instanceof Uint8Array ? modelFile.content : new Uint8Array(modelFile.content.split(',').map(Number));
    model = await tf.loadGraphModel(tf.io.browserFiles([new File([modelArrayBuffer], 'model.json')]));
    console.log('TensorFlow.js model loaded successfully');
  } catch (error) {
    console.error('Failed to load the TensorFlow.js model:', error);
    throw new Error(`Failed to load the TensorFlow.js model: ${error.message}`);
  }
}

export async function detectObjects(imageData, confidenceThreshold) {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  try {
    // Preprocess the image
    const tensor = await preprocessImage(imageData);

    // Run inference
    const predictions = await model.predict(tensor);

    // Process results
    const [boxes, scores, classes] = await processResults(predictions);

    // Filter predictions based on confidence threshold
    const detections = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > confidenceThreshold) {
        detections.push({
          class: getClassName(classes[i]),
          confidence: scores[i],
          bbox: boxes[i]
        });
      }
    }

    return detections;
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw new Error(`Unexpected error during object detection: ${error.message}`);
  }
}

async function preprocessImage(imageData) {
  const img = await createImageBitmap(dataURItoBlob(imageData));
  const tensor = tf.tidy(() => {
    return tf.browser.fromPixels(img)
      .resizeBilinear([640, 640])
      .expandDims(0)
      .toFloat()
      .div(tf.scalar(255));
  });
  return tensor;
}

async function processResults(predictions) {
  const boxes = await predictions[0].array();
  const scores = await predictions[1].array();
  const classes = await predictions[2].array();

  return [boxes[0], scores[0], classes[0]];
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

function getClassName(classId) {
  // Update this mapping based on your custom model's classes
  const classMap = {
    0: 'glass',
    1: 'can',
    2: 'pet1',
    3: 'hdpe2',
    4: 'carton'
  };
  return classMap[classId] || 'unknown';
}
