self.importScripts('../utils/objectDetection.js');

self.onmessage = async (event) => {
  const { image } = event.data;
  try {
    const detectedObjects = await self.detectObjects(image);
    const processedObjects = detectedObjects.map(obj => ({
      class: obj.class,
      confidence: obj.confidence,
      bbox: obj.bbox
    }));
    self.postMessage(JSON.stringify(processedObjects));
  } catch (error) {
    self.postMessage(JSON.stringify({ error: error.message }));
  }
};
