export async function detectObjects(imageData) {
  try {
    const response = await fetch("https://detect.roboflow.com/cds-depot-counter-ivjbi/1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer gpvPQE3wHQT6oVIkSX4k"
      },
      body: JSON.stringify({
        image: imageData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Log the full response for debugging

    if (!data.predictions || !Array.isArray(data.predictions)) {
      throw new Error("Unexpected API response format");
    }

    return data.predictions.map(prediction => ({
      class: prediction.class,
      confidence: prediction.confidence,
      x: prediction.x,
      y: prediction.y,
      width: prediction.width,
      height: prediction.height
    }));
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw error;
  }
}
