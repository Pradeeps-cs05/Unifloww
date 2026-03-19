import { memo } from "react";
import { FiTrash2, FiDownload, FiUpload, FiFile, FiFileText } from "react-icons/fi";
import { AiFillFilePdf, AiFillFileWord, AiFillFileExcel } from "react-icons/ai";
import { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";
import "./ExistingFileList.css";

const getFileKeyFromUrl = (url) => {
  return url.split("/").pop();
};

// Memoized PDF preview component
const PdfPreview = memo(({ src, name }) => (
  <div className="doc-preview-pdf">
    <span className="pdf-name">{name}</span>
    <iframe
      src={src}
      title={name}
      width="100%"
      height="200"
      style={{ border: "1px solid #ccc", borderRadius: 4 }}
    />
  </div>
));

export default function ExistingFileList({
  files,
  docsToDelete = [],
  setDocsToDelete,
  readOnly = false, // toggles editable/read-only
}) {
  const getFileKey = (doc) => doc.filename || doc.originalname || doc._id || "";

  const handleMarkDelete = (doc) => {
    if (readOnly || !setDocsToDelete) return;
    const key = getFileKey(doc);
    setDocsToDelete((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleDownload = async (doc) => {
  const fileKey = getFileKeyFromUrl(doc.url);
  const url = await getSignedUrl(fileKey);

  const link = document.createElement("a");
  link.href = url;
  link.download = doc.originalname || "file";
  link.target = "_blank"; // important

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  };

  const getFileIcon = (name, mimetype) => {
    const ext = name.split(".").pop().toLowerCase();
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
  };

  const getSignedUrl = async (filename) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/file/signed-url/${filename}`);
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error("Signed URL error", err);
    return "";
  }
};

const renderPreview = (doc) => {
  const name = doc.originalname || doc.filename || "file";
  const mimetype = doc.mimetype || "";

  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    const fetchUrl = async () => {
      const fileKey = getFileKeyFromUrl(doc.url);
      const url = await getSignedUrl(fileKey);
      setSignedUrl(url);
    };
    fetchUrl();
  }, [doc]);

  if (!signedUrl) return <p>Loading...</p>;

  if (mimetype.startsWith("image/") || /\.(jpg|jpeg|png|gif)$/i.test(name)) {
    return <img src={signedUrl} alt={name} className="doc-preview-img" />;
  }

  if (mimetype === "application/pdf" || /\.pdf$/i.test(name)) {
    return <PdfPreview src={signedUrl} name={name} />;
  }

  return (
    <div className="doc-preview-file">
      {getFileIcon(name, mimetype)}
      <span style={{ marginLeft: 6 }}>{name}</span>
    </div>
  );
};
  if (!files || files.length === 0) return <p>No documents uploaded.</p>;


  return (
    <div className="existing-file-list">
      <ul className="doc-list">
        {files.map((doc, idx) => {
          const key = getFileKey(doc);
          const isMarked = docsToDelete.includes(key);
          const name = doc.originalname || doc.filename || `doc-${idx}`;

          return (
            <li key={key || idx} className={`doc-item ${isMarked ? "marked" : ""}`}>
              {renderPreview(doc)}

              {/* Editable actions */}
              {!readOnly && (
                <>
                  {isMarked && (
                    <div
                      className="doc-marked-delete"
                      onClick={() => handleMarkDelete(doc)}
                      title="Undo delete"
                      style={{ userSelect: "none", cursor: "pointer" }}
                    >
                      <FiUpload />
                    </div>
                  )}
                  <div className="doc-actions">
                    <button
                      type="button"
                      className="doc-download"
                      onClick={() => handleDownload(doc)}
                      title={`Download ${name}`}
                    >
                      <FiDownload />
                    </button>
                    <button
                      type="button"
                      className="doc-remove"
                      onClick={() =>
                        handleMarkDelete(doc)
                      }
                      title={isMarked ? `Undo delete ${name}` : `Remove ${name}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </>
              )}

              {/* Read-only actions */}
              {readOnly && (
                <div className="doc-actions">
                  <button
                    type="button"
                    className="doc-download"
                    onClick={() => handleDownload(doc)}
                    title={`Download ${name}`}
                  >
                    <FiDownload />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}