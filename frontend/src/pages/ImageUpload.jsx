import { useState, useEffect } from "react";
import api from "../api"; 

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);

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
    formData.append("key", "Test@123")

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

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
        Upload Image
      </h2>
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
        Uploaded Images:
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
          <div key={img.id}>
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
    </div>
  );
};

export default ImageUploader;
