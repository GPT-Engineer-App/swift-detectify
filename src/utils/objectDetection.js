import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export async function detectObjects(imageData, confidenceThreshold, model) {
  if (!model) {
    throw new Error('Model not provided. Make sure the model is loaded.');
  }

  try {
    // Preprocess the image
    const tensor = await preprocessImage(imageData);

    if (!tensor || tensor.shape.length !== 4) {
      throw new Error('Invalid tensor shape after preprocessing');
    }

    // Run inference
    const predictions = await model.predict(tensor);

    if (!Array.isArray(predictions) || predictions.length < 3) {
      throw new Error('Invalid predictions format');
    }

    // Process results
    const [boxes, scores, classes] = await processResults(predictions);

    if (!boxes || !scores || !classes) {
      throw new Error('Invalid results after processing');
    }

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
  } finally {
    // Clean up tensors to prevent memory leaks
    if (tensor) tensor.dispose();
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
