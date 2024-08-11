import axios from 'axios';

export async function detectObjects(imageData) {
  try {
    const response = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/cds-depot-counter-ivjbi/1",
      params: {
        api_key: "gpvPQE3wHQT6oVIkSX4k"
      },
      data: imageData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    return response.data.predictions;
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw error;
  }
}
