import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function UploadAnswersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { examPaperId, filename } = location.state || {};

  const [studentName, setStudentName] = useState("");
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const fileInputRef = useRef(null);

  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Validate accessibility
  if (!examPaperId) {
    return (
      <div style={styles.invalidContainer}>
        <h2>Invalid Access</h2>
        <p style={{ color: "var(--text)", margin: "12px 0 24px" }}>
          Please upload and submit a question paper first.
        </p>
        <button onClick={() => navigate("/")} style={styles.submitButton}>
          Return Home
        </button>
      </div>
    );
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop events
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      validateAndSetFile(e.dataTransfer.files);
    }
  };

  // Handle file input selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      validateAndSetFile(e.target.files);
    }
  };

  // Validate single PDF selection
  const validateAndSetFile = (fileList) => {
    const selectedFiles = Array.from(fileList);
    if (selectedFiles.length === 0) return;

    const firstFile = selectedFiles[0];

    if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf")) {
      if (selectedFiles.length > 1) {
        setErrorMessage("Please select only one PDF answer sheet.");
        setUploadStatus("error");
        setFiles([]);
        return;
      }
      setFiles([firstFile]);
      setUploadStatus("idle");
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid file type. The student answer sheet must be a PDF file.");
      setUploadStatus("error");
      setFiles([]);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStudentName("");
    setUploadStatus("idle");
    setErrorMessage("");
    setResponseData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploadStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("files", files[0]);
    formData.append("question_paper_id", examPaperId);
    
    if (studentName.trim()) {
      formData.append("student_name", studentName.trim());
    }

    try {
      const response = await fetch(`${backendBase}/api/evaluations/upload-answers`, {
        method: "POST",
        body: formData,
      });

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.error("Failed to parse JSON response:", jsonErr);
        }
      }

      if (response.ok && data && data.success) {
        setUploadStatus("success");
        setResponseData(data);
      } else {
        setUploadStatus("error");
        const errMsg = (data && data.error) || (data && data.message) || `Server responded with status ${response.status}`;
        setErrorMessage(errMsg);
      }
    } catch (error) {
      console.error("Network error during answer evaluation:", error);
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to connect to the backend server.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div>
          <h2 style={styles.title}>Step 3: Upload Student Answer Sheet</h2>
          <p style={styles.subtitle}>Upload a student's answer sheet for AI grading against the active question paper</p>
        </div>

        {/* Associated Question Paper Details */}
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Associated Question Paper</h4>
          <p style={styles.infoText}>📄 {filename}</p>
          <p style={styles.infoSubtext}>Exam Paper ID: {examPaperId}</p>
        </div>

        <form onSubmit={handleUpload} style={styles.form}>
          {/* Student Name Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="student-name-input" style={styles.label}>Student Name</label>
            <input
              id="student-name-input"
              type="text"
              placeholder="Enter student name (e.g. John Doe)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={styles.textInput}
              disabled={uploadStatus === "uploading"}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={styles.hiddenInput}
          />

          {/* Drag & Drop Area */}
          {files.length === 0 && (
            <div
              style={{
                ...styles.dropZone,
                borderColor: dragActive ? "var(--accent)" : "var(--border)",
                backgroundColor: dragActive ? "var(--accent-bg)" : "transparent",
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
            >
              <div style={styles.iconContainer}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v4Z" />
                  <path d="M12 12v4" />
                  <path d="M12 12h2" />
                </svg>
              </div>
              <p style={styles.dropText}>
                Drag & drop student's answer sheet here, or <span style={styles.browseText}>browse</span>
              </p>
              <p style={styles.limitText}>Only PDF files accepted (Max 20 MB)</p>
            </div>
          )}

          {/* Selected File Details */}
          {files.length > 0 && (
            <div style={styles.fileDetailsCard}>
              <div style={styles.fileDetailsRow}>
                <div style={styles.pdfBadge}>
                  <span style={styles.pdfBadgeText}>PDF</span>
                </div>
                <div style={styles.fileMeta}>
                  <p style={styles.fileName}>{files[0].name}</p>
                  <p style={styles.fileSize}>{formatFileSize(files[0].size)}</p>
                </div>
                {uploadStatus !== "uploading" && (
                  <button
                    type="button"
                    onClick={handleReset}
                    style={styles.removeButton}
                    title="Remove selected file"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>

              {/* Uploading progress bar */}
              {uploadStatus === "uploading" && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressBarContainer}>
                    <div style={styles.progressBar}></div>
                  </div>
                  <p style={styles.progressText}>Evaluating answer sheet with AI, please wait...</p>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {uploadStatus === "error" && errorMessage && (
            <div style={styles.errorAlert}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 8, flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {uploadStatus === "success" && (
            <div style={styles.successAlert}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 8, flexShrink: 0 }}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <div>
                <strong style={{ display: "block" }}>Evaluation Completed Successfully!</strong>
                <span style={{ fontSize: "13px" }}>
                  Record ID: {responseData?.evaluationId}. Evaluated student: {responseData?.evaluationData?.studentMetadata?.name || studentName || "Unknown"}.
                </span>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.backButton}
              disabled={uploadStatus === "uploading"}
            >
              Back to Home
            </button>

            {files.length > 0 && uploadStatus !== "success" && (
              <button
                type="submit"
                disabled={uploadStatus === "uploading"}
                style={{
                  ...styles.submitButton,
                  backgroundColor: uploadStatus === "uploading" ? "var(--border)" : "var(--accent)",
                  cursor: uploadStatus === "uploading" ? "not-allowed" : "pointer",
                }}
              >
                {uploadStatus === "uploading" ? "Evaluating..." : "Upload & Evaluate Answers"}
              </button>
            )}

            {uploadStatus === "success" && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  ...styles.submitButton,
                  backgroundColor: "var(--accent)",
                }}
              >
                Evaluate Another Sheet
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    width: "100%",
    minHeight: "100vh",
    boxSizing: "border-box",
    backgroundColor: "var(--bg)",
  },
  invalidContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "var(--bg)",
    color: "var(--text-h)",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "36px",
    borderRadius: "16px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    boxShadow: "var(--shadow)",
    textAlign: "left",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text-h)",
  },
  subtitle: {
    color: "var(--text)",
    margin: "8px 0 0 0",
    fontSize: "15px",
    lineHeight: "140%",
  },
  infoCard: {
    background: "var(--accent-bg)",
    border: "1px solid var(--accent-border, rgba(192, 132, 252, 0.3))",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  infoTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoText: {
    margin: 0,
    fontSize: "15px",
    color: "var(--text-h)",
  },
  infoSubtext: {
    margin: 0,
    fontSize: "12px",
    color: "var(--text)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-h)",
  },
  textInput: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--code-bg)",
    color: "var(--text-h)",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  hiddenInput: {
    display: "none",
  },
  dropZone: {
    borderWidth: "2px",
    borderStyle: "dashed",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  iconContainer: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-bg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dropText: {
    fontSize: "15px",
    color: "var(--text-h)",
    margin: 0,
  },
  browseText: {
    color: "var(--accent)",
    fontWeight: "600",
    textDecoration: "underline",
  },
  limitText: {
    fontSize: "12px",
    color: "var(--text)",
    margin: 0,
  },
  fileDetailsCard: {
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--code-bg)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fileDetailsRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  pdfBadge: {
    padding: "6px 10px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  pdfBadgeText: {
    fontWeight: "bold",
    fontSize: "12px",
    letterSpacing: "0.5px",
    color: "#ef4444",
  },
  fileMeta: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-h)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "var(--text)",
  },
  removeButton: {
    background: "transparent",
    border: "none",
    color: "var(--text)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s, background-color 0.2s",
  },
  progressContainer: {
    width: "100%",
  },
  progressBarContainer: {
    height: "6px",
    width: "100%",
    backgroundColor: "var(--border)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "100%",
    background: "linear-gradient(90deg, var(--border) 0%, var(--accent) 50%, var(--border) 100%)",
    backgroundSize: "200% 100%",
    borderRadius: "3px",
    animation: "shimmer 1.5s infinite linear",
  },
  progressText: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    color: "var(--text)",
    textAlign: "center",
    fontStyle: "italic",
  },
  errorAlert: {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    lineHeight: "140%",
  },
  successAlert: {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    fontSize: "14px",
    display: "flex",
    alignItems: "flex-start",
    lineHeight: "140%",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  submitButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  backButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-h)",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

// Add shimmer keyframe animation to document head if we are in client browser environment
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UploadAnswersPage;