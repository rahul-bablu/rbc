import { useState, useEffect, useCallback } from 'react';
import api from '../../api';


const useImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user-images/');
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      showNotification('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file to upload', 'warning');
      return;
    }

    if (!title.trim()) {
      showNotification('Please enter a title for the image', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('key', 'Test@123');
    formData.append('title', title);

    setLoading(true);
    try {
      await api.post('api/upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSelectedFile(null);
      setTitle('');
      fetchImages();
      showNotification('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = async (id) => {
    setLoading(true);
    try {
      console.log(id)
      const response = await api.get(`/api/decrypt-image/${id}/`, {
        responseType: 'blob',
      });

      const imageURL = URL.createObjectURL(response.data);
      setDecryptedImage(imageURL);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to decrypt image:', error);
      showNotification('Failed to decrypt image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await api.delete(`/api/images/${id}/delete/`);
      showNotification('Image deleted successfully', 'success');
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      showNotification('Failed to delete image', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (decryptedImage) {
      URL.revokeObjectURL(decryptedImage);
      setDecryptedImage(null);
    }
  };

  useEffect(() => {
    fetchImages();
    
    return () => {
      // Cleanup any object URLs on unmount
      if (decryptedImage) {
        URL.revokeObjectURL(decryptedImage);
      }
    };
  }, [fetchImages]);

  return {
    images,
    title,
    selectedFile,
    showModal,
    decryptedImage,
    notification,
    loading,
    handleTitleChange,
    handleFileChange,
    handleUpload,
    handleImageClick,
    handleDeleteImage,
    closeModal,
    closeNotification
  };
};

export default useImageUploader;