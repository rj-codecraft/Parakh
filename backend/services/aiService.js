const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3000";

/**
 * Sends formData to the Question Paper parsing server and gets the response.
 * Returns the exact JSON response from the AI service without any modification.
 *
 * @returns {Object} The parsed question paper JSON (exact format from AI service)
 */
const parseQuestionPaper = async (files) => {
  const formData = new FormData();
  //formData contains key, buffer of file, file header or normal string containing fileName.
  
  files.forEach((file)=>{
    formData.append("QP",file.buffer,
      {
        filename: file.originalname,
        contentType: file.mimetype,
      }
    )
  });
  

  const response = await axios.post(
    `${AI_SERVICE_URL}/ai/parse-question-paper`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 300000, // 5 minutes timeout for AI processing
    }
  );

  // Return the exact JSON response — no transformation
  return response.data;
};

module.exports = { parseQuestionPaper };

