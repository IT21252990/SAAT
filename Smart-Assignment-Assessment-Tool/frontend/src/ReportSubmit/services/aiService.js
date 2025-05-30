import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API,
  dangerouslyAllowBrowser: true,
});
console.log("report");
export const analyzeReport = async (
  reportText,
  criteria,
  assignmentId,
  onProgress,
) => {
  try {
    console.log("Starting analysis...");
    console.log("maeking id:", assignmentId);
    // onProgress(30);

    // Validate inputs
    if (!reportText || !assignmentId) {
      throw new Error("Missing report or marking scheme ID");
    }

    console.log("Fetching marking scheme from DB...");
    onProgress(50);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`,
    );
    const markingScheme = await response.json();
    console.log(
      "Marking scheme fetched:",
      markingScheme.marking_schemes[0].criteria.report,
    );
    const critirions = markingScheme.marking_schemes[0].criteria.report;

    if (!markingScheme || !critirions) {
      throw new Error("Invalid marking scheme format");
    }

    // Prepare criteria for analysis
    const criteriaDescription = critirions.map((criterion) => {
      return {
        description: criterion.criterion,
        weightage: criterion.weightage,
        high_description: criterion.high_description,
        medium_description: criterion.medium_description,
        low_description: criterion.low_description,
      };
    });

    console.log("Sending request to OpenAI...");
    // onProgress(70);

    const prompt = `Analyze this student report according to the following marking scheme.
                    Each criterion includes:
                    - a description
                    - weightage (out of 100)
                    - what constitutes high, medium, and low performance.

                    Return your result as valid JSON in the following structure:
                    {
                      "criteria": [
                        {
                          "description": "criterion description",
                          "weightage": 70,
                          "awarded": 50,
                          "justification": "explanation of score",
                          "suggestions": ["suggestion 1", "suggestion 2"]
                        }
                      ],
                      "totalScore": 80,
                      "feedback": "overall feedback"
                    }

                    Marking Scheme:
                    ${JSON.stringify(criteriaDescription)}

                    Student Report:
                    ${reportText}
                    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert academic assessor. Analyze reports and provide structured feedback in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    console.log("Received response from OpenAI");
    onProgress(90);

    const responseText = completion.choices[0].message.content;
    let analysisResult;

    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Failed to parse response:", responseText);
      throw new Error("Invalid response format from analysis service");
    }

    // onProgress(100);
    return analysisResult;
  } catch (error) {
    console.error("Analysis error:", error);
    if (error.response) {
      console.error("OpenAI API error:", error.response.data);
    }
    throw new Error(`Analysis failed: ${error.message}`);
  }
};
