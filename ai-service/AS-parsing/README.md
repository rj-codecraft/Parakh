# Answer Sheet Parsing API

A FastAPI service that parses and evaluates student answer sheets using the Gemini API.

---

# Prerequisites

Before running the API, ensure the following are installed:

* Python 3.12 or later
* Git
* A valid Gemini API key

---

# Clone the Repository

From the project root, navigate to the API directory:

```bash
cd ai-service/AS-parsing
```

---

# Create a Virtual Environment

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

### Windows (PowerShell)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Configure the Gemini API Key

The application expects the Gemini API key to be available as the following environment variable:

```text
GEMINI_API_KEY
```

Verify that the variable is available before starting the server.

### Linux / macOS

```bash
echo $GEMINI_API_KEY
```

### Windows (PowerShell)

```powershell
echo $env:GEMINI_API_KEY
```

If the command prints your API key, the environment variable has been configured correctly.

---

# Run the Development Server

Using FastAPI CLI:

```bash
fastapi dev app.py
```

or using Uvicorn:

```bash
uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# API Endpoint

## Evaluate Answer Sheet

**POST**

```text
/ai/evaluate-answers
```

### Request

Send a `multipart/form-data` request containing:

| Field           | Type      | Description                |
| --------------- | --------- | -------------------------- |
| `answer_sheet`  | PDF File  | Student answer sheet PDF   |
| `question_json` | JSON File | Parsed question paper JSON |

### Response

Returns a JSON object containing the AI-generated evaluation of the submitted answer sheet.
 
More detailed documentations [here](#answer-sheet-json-response-schema)

---

# Testing the API

You can use your own question json and answer sheet pdf **OR** you can also use sample test files are available in:

```text
doc/test PDFs/
```
```text
doc/Architectural docs/
```

You can use these files through the Swagger UI available at:

```text
http://127.0.0.1:8000/docs
```


---

# API Response format

The API returns a JSON object containing the AI-generated evaluation of the submitted answer sheet

The following text describes the structured JSON schema and the rules used to represent, validate, and evaluate parsed student answer sheets. It serves as the official spec for both the **AI Service** and the **Frontend/Client Application** content display.

---

## General JSON Structure

The parsed and evaluated student answer sheet is represented as a single JSON object structured as follows:

```json
{
  "studentMetadata": {
    "name": "String - Student name (empty if undetected/redacted)",
    "rollNumber": "String - Roll number (empty if undetected/redacted)",
    "examCode": "String - Subject/Exam code (e.g., '086')",
    "subject": "String - Subject name (e.g., 'SCIENCE')"
  },
  "parsingStatus": {
    "success": "Boolean - true if extraction is mostly reliable",
    "paperClarity": "String - 'clear' | 'partially_clear' | 'unclear'",
    "overallConfidence": "Number - Score from 0.0 to 1.0",
    "errors": ["Array of Strings - Critical parsing error messages"],
    "warnings": ["Array of Strings - Non-critical parsing warning messages"]
  },
  "answerBlocks": [
    {
      "id": "String - Unique hierarchical identifier matching question structure (e.g., 'Q1', 'Q7.i')",
      "sourcePages": ["Array of Numbers - 1-based page indices where the answer is found"],
      "attemptStatus": "String - 'attempted' | 'partial' | 'crossed_out' | 'uncertain'",
      "confidence": "Number - Extraction confidence for this block from 0.0 to 1.0",
      "errors": ["Array of Strings - Specific errors in parsing this answer block"],
      "warnings": ["Array of Strings - Specific warnings in parsing this answer block"],
      "issues": ["Array of Strings - Discrepancies or notes (e.g., skipped parts, misplaced answers)"],
      "answerSummary": "String - Concise semantic summary of what the student wrote",
      "satisfies": ["Array of Strings - Rubric criteria/points met by the student's answer"],
      "missing": ["Array of Strings - Rubric criteria/points missing or weak in the student's answer"],
      "earnedMarks": {
        "value": "Number - Marks awarded (must not exceed max marks in questionStructure)",
        "reason": "String - Short explanation for the awarded or docked marks"
      },
      "children": ["Recursive Array - Sub-questions answers following the same block structure"]
    }
  ],
  "invalidAnswers": ["Array of Strings - IDs of redundant attempts from optional question conflicts"],
  "attemptSummary": {
    "totalAnswerBlocks": "Number - Total count of valid answer nodes extracted (excluding invalidAnswers)",
    "attemptedQuestionIds": ["Array of Strings - Flat list of valid identified question IDs (excluding invalidAnswers)"]
  }
}
```

---

## Field Definitions

### 1. `studentMetadata`
General information about the student if present on the answer sheet.
* **`name`**: Student name (extract only explicitly visible information; do not infer missing values).
* **`rollNumber`**: Student roll number (extract only explicitly visible information; do not infer missing values).
* **`examCode`**: Subject/exam code (e.g., `"086"`).
* **`subject`**: Subject name (e.g., `"SCIENCE"`).

### 2. `parsingStatus`
Global quality status of the scanned paper and OCR transcription:
* **`success`**: `true` if extraction is mostly reliable; `false` if major extraction failures exist.
* **`paperClarity`**: Overall answer sheet readability rating. Allowed values: `"clear"`, `"partially_clear"`, `"unclear"`.
* **`overallConfidence`**: Score from `0.0` (impossible) to `1.0` (highly reliable) representing overall extraction certainty, factoring in handwriting readability, page quality, hierarchy certainty, and semantic interpretation certainty.
* **`errors`**: Critical failures in pdf affecting extraction (e.g., `["Page 3 unreadable", "Question numbering missing"]`). Must always exist; use `[]` if none.
* **`warnings`**: Non-critical issues (e.g., `["handwriting_unclear", "page tilted", "partial text overlap"]`). Must always exist; use `[]` if none.

### 3. `answerBlocks`
A recursive structure mirroring the question paper hierarchy, housing the student's responses, criteria mapping, and awarded marks:
* **`id`**: Use question hierarchy matching `questionStructure` exactly (e.g., `Q1`, `Q1.a`, `Q1.a.i`, `Q1.a.i.A`). If question identifier is unavailable, assign `UNMAPPED_1`, `UNMAPPED_2`, etc.
* **`sourcePages`**: Page numbers (1-indexed) where the answer appears (e.g., `[2]` or `[2,3]`). Must always exist.
* **`attemptStatus`**: Observed state of the answer attempt. Allowed values:
  * `"attempted"`: Answer clearly written.
  * `"partial"`: Answer started but incomplete.
  * `"crossed_out"`: Answer intentionally cancelled.
  * `"uncertain"`: Attempt presence unclear.
* **`confidence`**: Score from `0.0` to `1.0` representing extraction confidence for this answer block, including handwriting, hierarchy, semantic, and answer boundary certainty.
* **`errors`**: Localized block parsing errors. Must always exist; use `[]` if none.
* **`warnings`**: Localized block parsing warnings (e.g., `"handwriting_unclear"`). Always exists as `[]` if none.
* **`issues`**: Short descriptions of answer extraction or interpretation problems (e.g., `["Answer partially cut near page edge", "Question number uncertain"]`). Always exist as `[]` if none.
* **`answerSummary`**: Concise semantic understanding of what the student wrote.
  
* **`satisfies`**: List of answer components/grading criteria successfully covered. Deserving of marks.
  * *Example:* `["Correct definition provided", "Relevant example included", "Diagram labeled correctly"]`
* **`missing`**: List of likely missing, incomplete, or weak components.
  * *Example:* `["Explanation incomplete", "No example provided"]`
* **`earnedMarks`**:
  * **`value`**: Numerical score awarded.  Never exceeds maximum marks defined in `questionStructure`. If parent marks are `"infer from children and choice description"`, value must be derived from child nodes.
  * **`reason`**: Short explanation explaining why marks were awarded or docked.
    * *Example:* `"Definition correct but explanation incomplete"`
* **`children`**: Recursive list of sub-answers. Always exists as `[]` if none (never `null`).

### 4. `invalidAnswers`
Contains IDs of redundant/excess answers resulting from optional/choice question conflicts. Do not include valid answers here.
* *Example:* `["Q5.b", "Q8.c"]`

### 5. `attemptSummary`
Summary of student's attempts:
* **`totalAnswerBlocks`**: Total number of valid answer nodes extracted (do not count `invalidAnswers`).
* **`attemptedQuestionIds`**: Contains IDs of valid identified answers only (do not include `invalidAnswers`).

---
