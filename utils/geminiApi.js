const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function processImageWithGemini(imagePath) {
  try {
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                text: 'Extract the following from this bill: amount spent, store name, and category. Return it as JSON in the format {"amount": ..., "store": ..., "category": ...}',
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the JSON response from Gemini's text output
    const responseText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    return {
      amount: parseFloat(extractedData.amount),
      shop_name: extractedData.store,
      purpose: extractedData.category,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error processing image with Gemini:", error);
    throw error;
  }
}

async function processTextWithGemini(text) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Extract expense information from this text and return it as JSON. Text: "${text}". Return in format: {"amount": number, "store": "store name", "category": "expense category"}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the JSON response from Gemini's text output
    const responseText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    return {
      amount: parseFloat(extractedData.amount),
      shop_name: extractedData.store,
      purpose: extractedData.category,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error processing text with Gemini:", error);
    throw error;
  }
}

module.exports = {
  processImageWithGemini,
  processTextWithGemini,
};
