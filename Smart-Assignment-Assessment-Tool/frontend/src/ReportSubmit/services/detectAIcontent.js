import React, { useState, useEffect } from "react";
import axios from "axios";

// Function to detect AI content using Hugging Face API
export const detectAIcontent = async (content, progressCallback) => {
  const huggingFaceApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY; 
  const endpoint = 'https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector';

  const cleanedContent = content.trim().replace(/\s+/g, ' '); // Clean up the content, remove extra space

  try {
    const response = await axios.post(
      endpoint,
      {
        inputs: cleanedContent, // Send cleaned content to the API
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${huggingFaceApiKey}`, // Include API key in Authorization header
        },
      }
    );

    if (response.data) {
      // Hugging Face returns an object containing the result, adjust based on the model output
      const result = response.data[0]; // Usually the first result is the AI detection output

      console.log("AI detection result:", result);

      // Check if result contains the AI detection label
      if (result && result.label === "LABEL_1") { // If model labels "LABEL_1" as AI-generated
        console.warn("High likelihood that content is AI-generated.");
      }

      // Optionally, use progressCallback to track progress
      progressCallback(result);
      return result;
    } else {
      throw new Error('No response from Hugging Face API');
    }
  } catch (error) {
    console.error('Error during Hugging Face AI content detection:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
};

// Example retry logic for improving accuracy
const retryRequest = async (content, retries = 3) => {
  let attempts = 0;
  let error;
  while (attempts < retries) {
    try {
      return await detectAIcontent(content);
    } catch (err) {
      error = err;
      attempts++;
      console.log(`Retry attempt ${attempts} failed: ${err.message}`);
      if (attempts === retries) {
        throw new Error('Maximum retry attempts reached');
      }
    }
  }
};
