import axios from "axios";

// Function to detect plagiarism using Hugging Face API
export const detectPlagiarism = async (content, progressCallback) => {
  const huggingFaceApiKey = '';
  const endpoint = "https://router.huggingface.co/hf-inference/models/jpwahle/longformer-base-plagiarism-detection";
  

  const cleanedContent = content.trim().replace(/\s+/g, ' '); // Clean up the content

  console.log("plagiarism")
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
      // The model returns an array of label-confidence pairs
      const result = response.data[0];
      console.log("Plagiarism detection result:", result);
      
      // Find the PLAGIARISM result
      const fakeResult = response.data[0].find(item => item.label === 'PLAGIARISM');
      
      console.log(fakeResult)
    //   if (fakeResult) {
          const plagiarismScore = fakeResult.score * 100000;
          console.log("Plagiarism Score:", plagiarismScore);
    //   } else {
    //       console.log("No plagiarism detected.");
    //   }
      
      // Optionally, use progressCallback to track progress
    //   if (progressCallback) {
    //     progressCallback(plagiarismScore);
    //   }

      return plagiarismScore;
    } else {
      throw new Error('No response from Hugging Face API');
    }
  } catch (error) {
    console.error('Error during Hugging Face plagiarism detection:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
};

// Example retry logic for improving accuracy
const retryRequest = async (content, retries = 3) => {
  let attempts = 0;
  let error;
  while (attempts < retries) {
    try {
      return await detectPlagiarism(content);
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
