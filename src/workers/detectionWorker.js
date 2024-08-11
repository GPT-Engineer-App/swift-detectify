import { detectObjects } from '../utils/objectDetection';

self.onmessage = async (event) => {
  const { image } = event.data;
  const detectedObjects = await detectObjects(image);
  self.postMessage(detectedObjects);
};
