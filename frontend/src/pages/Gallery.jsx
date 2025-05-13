import React from 'react';
import { Container } from '@mui/material';
import ImageGallery from '../components/ImageUploader/ImageGallery';
import DecryptModal from '../components/ImageUploader/DecryptModal';
import NotificationSnackbar from '../components/ImageUploader/NotificationSnackbar';
import useImageUploader from '../components/ImageUploader/useImageUploader';

const Gallery = () => {
  const {
    images,
    showModal,
    decryptedImage,
    notification,
    loading,
    handleImageClick,
    handleDeleteImage,
    closeModal,
    closeNotification
  } = useImageUploader();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ImageGallery 
        images={images}
        loading={loading}
        onImageClick={handleImageClick}
        onDeleteImage={handleDeleteImage}
      />
      
      <DecryptModal
        open={showModal}
        imageUrl={decryptedImage}
        onClose={closeModal}
      />
      
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Container>
  );
};

export default Gallery;