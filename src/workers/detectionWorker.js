self.importScripts('../utils/objectDetection.js');

self.onmessage = async (event) => {
  const { image } = event.data;
  try {
    const detectedObjects = await self.detectObjects(image);
    if (Array.isArray(detectedObjects)) {
      const processedObjects = detectedObjects.map(obj => ({
        class: obj.class,
        confidence: obj.confidence,
        bbox: obj.bbox
      }));
      self.postMessage(JSON.stringify(processedObjects));
    } else {
      throw new Error('Invalid response from object detection');
    }
  } catch (error) {
    console.error('Error in detection worker:', error);
    self.postMessage(JSON.stringify({ error: error.message }));
  }
};
