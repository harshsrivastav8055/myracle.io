const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

var cors = require("cors");
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDSlj5s9hXALsXbhP9QgktqIMoIrGn8oFE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Convert file to Generative Part
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

// Endpoint to handle the test generation
app.post("/api/generate", upload.array("screenshots"), async (req, res) => {
  try {
    const { context } = req.body;
    const screenshots = req.files;

    // Log received context and number of screenshots
    console.log("Received context:", context);
    console.log("Received screenshots:", screenshots.length);

    if (!screenshots || screenshots.length === 0) {
      return res.status(400).json({ error: "No screenshots uploaded" });
    }

    // Create a base prompt with optional context
    let prompt = context ? `${context}\n\n` : "";
    prompt += "Describe the following images in detail:";

    // Convert images and prepare the generative request
    const imageParts = screenshots.map((file) => {
      console.log(`Processing file: ${file.filename}`);
      return fileToGenerativePart(file.path, file.mimetype);
    });

    // Generate content using the Gemini API
    console.log("Sending request to Gemini API...");
    const result = await model.generateContent([prompt, ...imageParts]);

    // Log the result for debugging
    console.log("Received result from Gemini API:", result);

    // Check if the result is valid
    if (result && result.response && result.response.text) {
      const description = await result.response.text(); // Ensure proper handling of result
      console.log("Generated description:", description);

      // Send back the generated description
      res.json({ instructions: description });
    } else {
      console.error("Invalid response from Gemini API:", result);
      res.status(500).json({ error: "Failed to generate valid instructions" });
    }

    // Clean up uploaded files
    screenshots.forEach((file) => fs.unlinkSync(file.path));
  } catch (error) {
    console.error("Error generating instructions:", error);
    res.status(500).json({ error: "Failed to generate instructions" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
