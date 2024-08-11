import * as ort from 'onnxruntime-web';

let session;

export async function loadModel(modelPath) {
  try {
    session = await ort.InferenceSession.create(modelPath);
    console.log('ONNX model loaded successfully');
  } catch (error) {
    console.error('Failed to load the ONNX model:', error);
    throw new Error(`Failed to load the ONNX model: ${error.message}`);
  }
}

export async function detectObjects(imageData, confidenceThreshold) {
  if (!session) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  try {
    // Preprocess the image
    const tensor = await preprocessImage(imageData);

    // Run inference
    const feeds = { images: tensor };
    const results = await session.run(feeds);

    // Process results
    const [boxes, scores, classes] = processResults(results);

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
  // Implement image preprocessing here
  // This should convert the image to the format expected by your ONNX model
  // You may need to resize, normalize, and convert to the correct data type
  // Return a tensor in the format expected by your model
}

function processResults(results) {
  // Implement result processing here
  // This should extract boxes, scores, and classes from the model output
  // Return [boxes, scores, classes]
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
