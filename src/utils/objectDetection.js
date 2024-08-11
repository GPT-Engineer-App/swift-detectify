import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let model;

export async function loadModel(modelPath) {
  try {
    model = await tf.loadGraphModel(`file://${modelPath}`);
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Failed to load the model:', error);
    throw new Error(`Failed to load the model: ${error.message}`);
  }
}

export async function detectObjects(imageData, confidenceThreshold) {
  if (!model) {
    await loadModel();
  }

  try {
    // Convert base64 image to tensor
    const imgTensor = tf.browser.fromPixels(await createImageBitmap(dataURItoBlob(imageData)));
    const input = tf.image.resizeBilinear(imgTensor, [224, 224]).div(255.0).expandDims();

    // Run inference
    const predictions = await model.executeAsync(input);

    // Process predictions
    const boxes = await predictions[0].array();
    const scores = await predictions[1].array();
    const classes = await predictions[2].array();

    // Filter predictions based on confidence threshold
    const detections = [];
    for (let i = 0; i < scores[0].length; i++) {
      if (scores[0][i] > confidenceThreshold) {
        detections.push({
          class: getClassName(classes[0][i]),
          confidence: scores[0][i],
          bbox: boxes[0][i]
        });
      }
    }

    return detections;
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw new Error(`Unexpected error during object detection: ${error.message}`);
  }
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
  // Map class IDs to class names based on your model's classes
  const classMap = {
    1: 'glass',
    2: 'can',
    3: 'pet1',
    4: 'hdpe2',
    5: 'carton'
  };
  return classMap[classId] || 'unknown';
}
