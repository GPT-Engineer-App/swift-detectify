self.detectObjects = async function(imageData) {
  try {
    const response = await fetch("https://detect.roboflow.com/cds-depot-counter-ivjbi/1", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        api_key: "gpvPQE3wHQT6oVIkSX4k",
        image: imageData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.predictions;
  } catch (error) {
    console.error("Error detecting objects:", error);
    throw error;
  }
};
