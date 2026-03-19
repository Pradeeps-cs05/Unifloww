import { useState, useEffect, memo } from "react";
import { FiTrash2, FiDownload, FiUpload } from "react-icons/fi";
import { FiFile, FiFileText } from "react-icons/fi";
import { AiFillFilePdf, AiFillFileWord, AiFillFileExcel } from "react-icons/ai";
import "./FileUploader.css";

// Memoized PDF preview component
const PdfPreview = memo(({ file, previewURL }) => (
  <div className="doc-preview-pdf">
    <span className="pdf-name">{file.name}</span>
    <iframe
      src={previewURL}
      title={file.name}
      width="100%"
      height="200"
      style={{ border: "1px solid #ccc", borderRadius: 4 }}
    />
  </div>
));

export default function FileUploader({ files, setFiles }) {
  // Add unique ID to each file
  function createFileObject(file) {
    return {
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewURL: URL.createObjectURL(file),
    };
  }

  function getFileIcon(file) {
    const ext = file.name.split(".").pop().toLowerCase();
  
    switch (ext) {
      case "pdf":
        return <AiFillFilePdf style={{ fontSize: 24, color: "#E74C3C" }} />;
      case "doc":
      case "docx":
        return <AiFillFileWord style={{ fontSize: 24, color: "#2E86C1" }} />;
      case "xls":
      case "xlsx":
        return <AiFillFileExcel style={{ fontSize: 24, color: "#28B463" }} />;
      case "txt":
        return <FiFileText style={{ fontSize: 24, color: "#34495E" }} />;
      default:
        return <FiFile style={{ fontSize: 24, color: "#7F8C8D" }} />;
    }
  }

  // Handle file input selection
  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files).map(createFileObject);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  // Handle drag-and-drop
  function handleDrop(e) {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map(createFileObject);
    setFiles((prev) => [...prev, ...newFiles]);
  }

  // Remove file by ID and revoke URL
  function handleRemoveById(id) {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewURL);
      return prev.filter((f) => f.id !== id);
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewURL));
    };
  }, [files]);

  // Render file preview based on type
  function renderPreview(doc) {
    const { file, previewURL } = doc;
    if (file.type.startsWith("image/")) {
      return <img src={previewURL} alt={file.name} className="doc-preview-img" />;
    } else if (file.type === "application/pdf") {
      return <PdfPreview file={file} previewURL={previewURL} />;
    } else {
      return (
        <div className="doc-preview-file">
          {getFileIcon(file)} <span style={{ marginLeft: 6 }}>{file.name}</span>
        </div>
      );
    }
  }

  return (
    <div className="file-uploader">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-input"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
      />

      <div
        className="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("drag-over");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("drag-over");
        }}
        onDrop={(e) => {
          e.currentTarget.classList.remove("drag-over");
          handleDrop(e);
        }}
      >
        <p>Drag & drop files here, or</p>
        <button
          type="button"
          className="choose-files-btn"
          onClick={() => document.getElementById("file-input").click()}
        >
          Choose Files
        </button>
      </div>

      {files.length > 0 && (
        <ul className="doc-list">
          {files.map((doc) => (
            <li key={doc.id} className="doc-item">
              {renderPreview(doc)}
              <div className="doc-actions">
                <button
                  type="button"
                  className="doc-download"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = doc.previewURL;
                    link.download = doc.file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  title={`Download ${doc.file.name}`}
                >
                  <FiDownload />
                </button>
                <button
                  type="button"
                  className="doc-remove"
                  onClick={() => handleRemoveById(doc.id)}
                  title={`Remove ${doc.file.name}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
