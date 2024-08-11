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

    let predictions;
    if (model.type === 'onnx') {
      // Run inference for ONNX model
      const feeds = { input: tensor.arraySync() };
      const results = await model.session.run(feeds);
      predictions = [
        results.boxes,
        results.scores,
        results.classes
      ];
    } else if (model.type === 'tfjs') {
      // Run inference for TensorFlow.js model
      predictions = await model.model.predict(tensor);
    } else {
      throw new Error('Unsupported model type');
    }

    if (!Array.isArray(predictions) || predictions.length < 3) {
      throw new Error('Invalid predictions format');
    }

    // Process results
    const [boxes, scores, classes] = await processResults(predictions);

    if (!boxes || !scores || !classes) {
      throw new Error('Invalid results after processing');
    }

    // Filter predictions based on confidence threshold and perform non-max suppression
    const detections = await performNMS(boxes, scores, classes, confidenceThreshold);

    return detections;
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw new Error(`Unexpected error during object detection: ${error.message}`);
  } finally {
    // Clean up tensors to prevent memory leaks
    if (tensor) tensor.dispose();
  }
}

async function performNMS(boxes, scores, classes, confidenceThreshold, iouThreshold = 0.5) {
  const detections = [];
  const indices = await tf.image.nonMaxSuppressionAsync(
    tf.tensor2d(boxes),
    tf.tensor1d(scores),
    100, // Max number of detections
    iouThreshold,
    confidenceThreshold
  );

  const indicesArray = await indices.array();
  for (let i = 0; i < indicesArray.length; i++) {
    const idx = indicesArray[i];
    detections.push({
      class: getClassName(classes[idx]),
      confidence: scores[idx],
      bbox: boxes[idx]
    });
  }

  return detections;
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
