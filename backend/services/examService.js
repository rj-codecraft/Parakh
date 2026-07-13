const supabase = require("../config/supabase");

/**
 * Stores the parsed exam paper data in Supabase.
 * The parsed JSON is stored exactly as received from the AI service —
 * no normalization, no restructuring, not a single character changed.
 *
 * @param {Object} parsedData - The exact JSON from the AI service (questionPaper.json format)
 * @param {string} pdfFilename - The original PDF filename
 * @returns {Object} The inserted record with its generated ID
 */
const storeExamPaper = async (parsedData, pdfFilename) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .insert({
      pdf_filename: pdfFilename,
      parsed_data: parsedData, // Exact JSON, stored as-is in JSONB
    })
    .select("id, created_at")
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

/**
 * Retrieves list of previously uploaded exam papers.
 *
 * @returns {Array} List of exam papers
 */
const listExamPapers = async () => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .select("id, pdf_filename, parsed_data, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

/**
 * Updates parsed data for an existing exam paper.
 *
 * @param {string} id - The generated ID of the exam paper
 * @param {Object} parsedData - The updated question paper JSON
 * @param {string} pdfFilename - The PDF filename
 * @returns {Object} The updated record with its ID
 */
const updateExamPaper = async (id, parsedData, pdfFilename) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .update({
      parsed_data: parsedData,
      pdf_filename: pdfFilename,
    })
    .eq("id", id)
    .select("id, created_at")
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

module.exports = {
  storeExamPaper,
  listExamPapers,
  updateExamPaper,
};
