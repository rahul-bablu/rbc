import React from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Skeleton,
  CircularProgress
} from '@mui/material';
import ImageCard from './ImageCard';



const ImageGallery = ({ 
  images, 
  loading,
  onImageClick,
  onDeleteImage
}) => {
  // Show skeletons when initially loading
  if (loading && images.length === 0) {
    return (
      <Box>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Loading Images
          <CircularProgress size={20} sx={{ ml: 1 }} />
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
              <Skeleton width="40%" height={15} sx={{ mt: 0.5 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          mb: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: 40,
            height: 3,
            backgroundColor: 'primary.light',
            borderRadius: 2
          }
        }}
      >
        Gallery {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>

      {images.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            bgcolor: 'action.hover', 
            borderRadius: 2, 
            opacity: 0.8 
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No images have been uploaded yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Upload your first image to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <ImageCard 
                image={image} 
                onClick={() => onImageClick(image.id)}
                onDelete={(id) => onDeleteImage(id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageGallery;