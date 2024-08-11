self.importScripts('../utils/objectDetection.js');

self.onmessage = async (event) => {
  const { image } = event.data;
  const detectedObjects = await self.detectObjects(image);
  self.postMessage(detectedObjects);
};
