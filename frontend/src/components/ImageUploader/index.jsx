import React from 'react';
import { Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import UploadForm from './UploadForm';
import ImageGallery from './ImageGallery';
import DecryptModal from './DecryptModal';
import useImageUploader from './useImageUploader';
import theme from './theme';
import NotificationSnackbar from './NotificationSnackbar';

const ImageUploader = () => {
  const {
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
    closeModal,
    closeNotification
  } = useImageUploader();

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box mb={6}>
          <UploadForm
            title={title}
            selectedFile={selectedFile}
            loading={loading}
            onTitleChange={handleTitleChange}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
          />
        </Box>
        
        <ImageGallery 
          images={images}
          loading={loading}
          onImageClick={handleImageClick}
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
    </ThemeProvider>
  );
};

export default ImageUploader;