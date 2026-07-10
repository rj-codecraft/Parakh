import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function UploadAnswersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { examPaperId, filename } =
    location.state || {};

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] =
    useState(false);
  const [isDragging, setIsDragging] =
    useState(false);

  const backendBase =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000";

  if (!examPaperId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "16px",
          background: "#0f172a",
          color: "white",
        }}
      >
        <h2>Invalid Access</h2>

        <p>
          Please upload and submit a question
          paper first.
        </p>

        <button
          onClick={() => navigate("/")}
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert(
        "Please select at least one answer sheet."
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      formData.append(
        "question_paper_id",
        examPaperId
      );

      const response = await fetch(
        `${backendBase}/api/evaluations/upload-answers`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          "Answer sheets uploaded successfully!"
        );
        console.log(data);
      } else {
        alert(
          data.error || "Upload failed."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    padding: "40px",
    background: "#0b1120",
    color: "white",
    display: "flex",
    justifyContent: "center",
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "700px",
    }}
  >
      <h1
  style={{
    fontSize: "36px",
    marginBottom: "8px",
    fontWeight: "700",
  }}
>
  Upload Answer Sheets
</h1>

<p
  style={{
    color: "#94a3b8",
    marginBottom: "24px",
  }}
>
  Upload student answer sheets for AI
  evaluation
</p>

      <div
  style={{
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  }}
>
  <p style={{ margin: 0 }}>
    <strong>Question Paper</strong>
  </p>

  <p
    style={{
      marginTop: "8px",
      marginBottom: "8px",
    }}
  >
    {filename}
  </p>

  <p
    style={{
      margin: 0,
      fontSize: "13px",
      color: "#94a3b8",
    }}
  >
    Exam ID: {examPaperId}
  </p>
</div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() =>
          setIsDragging(false)
        }
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);

          const droppedFiles =
            Array.from(
              e.dataTransfer.files
            );

          setFiles(droppedFiles);
        }}
        style={{
          marginTop: "30px",
          border: isDragging
            ? "2px solid #8b5cf6"
            : "2px dashed #475569",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          background: isDragging
            ? "rgba(139,92,246,0.1)"
            : "#111827",
          transition: "0.2s",
        }}
      >
        <h3>
          Drag & Drop Answer Sheets Here
        </h3>

        <p
          style={{
            color: "#94a3b8",
          }}
        >
          Upload PDFs or Images
        </p>

        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={(e) =>
            setFiles(
              Array.from(
                e.target.files
              )
            )
          }
        />
      </div>

      {/* Selected Files */}
      <div
        style={{
          marginTop: "30px",
        }}
      >
        <h3>
          Selected Files (
          {files.length})
        </h3>

        {files.length === 0 ? (
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            No files selected.
          </p>
        ) : (
          files.map(
            (file, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  border:
                    "1px solid #334155",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "10px",
                  background:
                    "#1e293b",
                }}
              >
                📄 {file.name}
              </div>
            )
          )
        )}
      </div>

      <button
  onClick={handleUpload}
  disabled={uploading}
  style={{
    marginTop: "30px",
    width: "100%",
    padding: "14px 24px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  {uploading
    ? "Uploading..."
    : "Upload Answer Sheets"}
</button>
    </div>
    </div>
  );
}

export default UploadAnswersPage;