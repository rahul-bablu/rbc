import { useState, useEffect } from "react";
import api from "../api";

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [title, setTitle] = useState("");

  const fetchImages = async () => {
    try {
      const response = await api.get("/api/user-images/");
      setImages(response.data);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("key", "Test@123");
    formData.append("title", title);

    try {
      await api.post("api/upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFile(null);
      fetchImages();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleImageClick = async (id) => {
    try {
      const response = await api.get(`/api/decrypt-image/${id}/`, {
        responseType: "blob",
      });

      const imageURL = URL.createObjectURL(response.data);
      setDecryptedImage(imageURL);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to decrypt image:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDecryptedImage(null);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
        Upload Image
      </h2>
      <input
  type="text"
  placeholder="Enter title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  style={{ marginBottom: "10px", padding: "6px" }}
/>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        style={{
          marginLeft: "10px",
          padding: "6px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>

      <h3 style={{ marginTop: "30px", fontSize: "18px", fontWeight: "600" }}>
        Uploaded Images (Click to Decrypt):
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={{ cursor: "pointer" }} onClick={() => handleImageClick(img.id)}>
            <img
              src={`http://127.0.0.1:8000${img.image}`}
              alt={`Uploaded ${img.id}`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
            <p style={{ fontSize: "12px", color: "#555" }}>
              {new Date(img.uploaded_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Decrypted Image</h3>
            <img
              src={decryptedImage}
              alt="Decrypted"
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
              }}
            />
            <button
              onClick={closeModal}
              style={{
                display: "block",
                margin: "20px auto 0",
                padding: "6px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
