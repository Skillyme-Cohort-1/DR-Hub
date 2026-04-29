import { useState, useEffect } from "react";
import { getStoredAccessToken } from "../lib/auth";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setDocuments([]);
        setDocumentsError("No access token found. Please sign in again.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/documents", {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (error) {
      setDocuments([]);
      setDocumentsError("Could not load documents.");
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleUploadDocument = async (event) => {
    event.preventDefault();
    setDocumentsError("");

    if (!documentFile) {
      setDocumentsError("Please select a file to upload.");
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setDocumentsError("No access token found. Please sign in again.");
      return;
    }

    const formData = new FormData();
    formData.append("documentName", (documentName || documentFile.name).trim());
    formData.append("document", documentFile);

    setUploadingDocument(true);
    try {
      const response = await fetch("http://localhost:3000/api/documents", {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload document");
      }

      setDocumentName("");
      setDocumentFile(null);
      await fetchDocuments();
    } catch (error) {
      setDocumentsError("Upload failed. Please try again.");
      console.error("Error uploading document:", error);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const token = getStoredAccessToken();
    if (!token) {
      setDocumentsError("No access token found. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete document");
      }

      await fetchDocuments();
    } catch (error) {
      setDocumentsError("Delete failed. Please try again.");
      console.error("Error deleting document:", error);
    }
  };

  const handleDownloadDocument = async (documentItem) => {
    const token = getStoredAccessToken();
    if (!token) {
      setDocumentsError("No access token found. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(documentItem.downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to download document");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = documentItem.documentName || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setDocumentsError("Download failed. Please try again.");
      console.error("Error downloading document:", error);
    }
  };

  const handleViewDocument = async (documentItem) => {
    const token = getStoredAccessToken();
    if (!token) {
      setDocumentsError("No access token found. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(documentItem.downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to open document");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
      setDocumentsError("Could not open this document.");
      console.error("Error viewing document:", error);
    }
  };

  return {
    documents,
    documentsLoading,
    documentsError,
    documentName,
    setDocumentName,
    documentFile,
    setDocumentFile,
    uploadingDocument,
    handleUploadDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleViewDocument,
  };
}