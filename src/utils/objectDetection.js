import * as ort from 'onnxruntime-web';

let model;

export async function loadModel(modelFile) {
  try {
    if (!modelFile || !modelFile.content) {
      throw new Error('Model file is missing or invalid');
    }

    const modelArrayBuffer = modelFile.content;
    const session = await ort.InferenceSession.create(modelArrayBuffer);
    model = session;
    console.log('ONNX model loaded successfully');
  } catch (error) {
    console.error('Failed to load the ONNX model:', error);
    throw new Error(`Failed to load the ONNX model: ${error.message}`);
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
    const feeds = { input: tensor };
    const results = await model.run(feeds);

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
  // Convert base64 to image
  const img = await createImageBitmap(dataURItoBlob(imageData));
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 640, 640);
  const imageData = ctx.getImageData(0, 0, 640, 640);
  
  // Normalize the image
  const float32Data = new Float32Array(imageData.data.length / 4 * 3);
  for (let i = 0, j = 0; i < imageData.data.length; i += 4, j += 3) {
    float32Data[j] = imageData.data[i] / 255.0;
    float32Data[j + 1] = imageData.data[i + 1] / 255.0;
    float32Data[j + 2] = imageData.data[i + 2] / 255.0;
  }
  
  return new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);
}

async function processResults(predictions) {
  // Extract boxes, scores, and classes from the model output
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
