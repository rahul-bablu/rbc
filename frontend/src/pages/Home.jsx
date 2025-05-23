import React from 'react';
import { Container, Box } from '@mui/material';
import UploadForm from '../components/ImageUploader/UploadForm';
import DecryptModal from '../components/ImageUploader/DecryptModal';
import NotificationSnackbar from '../components/ImageUploader/NotificationSnackbar';
import useImageUploader from '../components/ImageUploader/useImageUploader';

const Home = () => {
  const {
    title,
    selectedFile,
    showModal,
    decryptedImage,
    notification,
    loading,
    handleTitleChange,
    handleFileChange,
    handleUpload,
    closeModal,
    closeNotification
  } = useImageUploader();

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: 4,
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Box width="100%">
        <UploadForm
          title={title}
          selectedFile={selectedFile}
          loading={loading}
          onTitleChange={handleTitleChange}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />
      </Box>
      
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

export default Home;