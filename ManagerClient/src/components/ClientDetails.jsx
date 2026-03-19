import { useState } from "react";
import ExistingFileList from "./ExistingFileList";
import "./ClientDetails.css";

/**
 * ClientDetails Component
 * 
 * A reusable component for displaying and editing client information
 * 
 * @param {Object} props
 * @param {Object} props.client - Client data object
 * @param {Function} props.onChange - Callback when any field changes: (updatedClient) => void
 * @param {boolean} props.readonly - If true, form is read-only
 * @param {boolean} props.showDocuments - Whether to show document management section
 * @param {Array} props.existingDocs - Array of existing documents
 * @param {Array} props.docsToDelete - Array of document IDs marked for deletion
 * @param {Function} props.setDocsToDelete - Setter for docsToDelete
 */
export default function ClientDetails({
  client,
  onChange,
  readonly = false,
  showDocuments = true,
  existingDocs = [],
  docsToDelete = [],
  setDocsToDelete,
}) {
  const handleFieldChange = (e) => {
    if (readonly) return;
    
    const { name, value, type } = e.target;
    const updatedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
    
    onChange?.({
      ...client,
      [name]: updatedValue,
    });
  };

  if (!client) {
    return (
      <div className="client-form-placeholder">
        <p>No client data available</p>
      </div>
    );
  }

  return (
    <div className={`client-details ${readonly ? "readonly-mode" : "editable-mode"}`}>
      {/* Basic Information */}
      <div className="form-section">
        <div className="section-title">Basic Information</div>
        <div className="section-fields">
          {["name", "email", "phone"].map((key) => (
            <label key={key} className="field">
              <span className="field-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {!readonly && <sup className="required-star">*</sup>}
              </span>
              {readonly ? (
                <div className="field-value">{client[key] || "—"}</div>
              ) : (
                <input
                  name={key}
                  value={client[key] || ""}
                  onChange={handleFieldChange}
                  required
                  className="field-input"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="form-section">
        <div className="section-title">Address</div>
        <div className="section-fields">
          <label className="field full-row">
            <span className="field-label">Address</span>
            {readonly ? (
              <div className="field-value multiline">
                {client.address || "—"}
              </div>
            ) : (
              <textarea
                name="address"
                value={client.address || ""}
                onChange={handleFieldChange}
                rows={2}
                className="field-input"
              />
            )}
          </label>
        </div>
      </div>

      {/* Education & Work */}
      <div className="form-section">
        <div className="section-title">Education & Work</div>
        <div className="section-fields">
          {["education", "college", "company", "role"].map((key) => (
            <label key={key} className="field">
              <span className="field-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              {readonly ? (
                <div className="field-value">{client[key] || "—"}</div>
              ) : (
                <input
                  name={key}
                  value={client[key] || ""}
                  onChange={handleFieldChange}
                  className="field-input"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Wishlists & Budget */}
      <div className="form-section">
        <div className="section-title">Wishlists & Budget</div>
        <div className="section-fields">
          {[
            { key: "countryWishlist", label: "Country Wishlist" },
            { key: "collegeWishlist", label: "College Wishlist" },
            { key: "courseWishlist", label: "Course Wishlist" },
            { key: "other", label: "Other" },
          ].map(({ key, label }) => (
            <label key={key} className="field full-row">
              <span className="field-label">{label}</span>
              {readonly ? (
                <div className="field-value multiline">
                  {client[key] || "—"}
                </div>
              ) : (
                <textarea
                  name={key}
                  value={client[key] || ""}
                  onChange={handleFieldChange}
                  rows={2}
                  className="field-input"
                />
              )}
            </label>
          ))}
          <label className="field">
            <span className="field-label">Budget</span>
            {readonly ? (
              <div className="field-value">
                {client.budget ? `$${client.budget.toLocaleString()}` : "—"}
              </div>
            ) : (
              <input
                name="budget"
                type="number"
                value={client.budget || ""}
                onChange={handleFieldChange}
                className="field-input"
                min="0"
                step="1"
              />
            )}
          </label>
        </div>
      </div>

      {/* Documents Section */}
      {showDocuments && (
        <div className="form-section">
          <div className="section-title">Documents</div>
          <div className="section-fields">
            {/* Use ExistingFileList with its readOnly prop */}
            <ExistingFileList
              files={existingDocs}
              docsToDelete={docsToDelete}
              setDocsToDelete={setDocsToDelete}
              readOnly={readonly}
            />
          </div>
        </div>
      )}
    </div>
  );
}