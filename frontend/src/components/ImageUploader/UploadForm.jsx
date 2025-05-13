import React from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  InputAdornment,
  IconButton,
  styled,
  CircularProgress
} from '@mui/material';
import { ImagePlus, Upload, X } from 'lucide-react';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadForm = ({
  title,
  selectedFile,
  loading,
  onTitleChange,
  onFileChange,
  onUpload,
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Upload Encrypted Image
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload your image to encrypt and store it securely.
        </Typography>
      </Box>

      <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Image Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={onTitleChange}
          placeholder="Enter a descriptive title"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ImagePlus size={20} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImagePlus />}
            sx={{ flexGrow: 1 }}
          >
            {selectedFile ? 'Change Image' : 'Select Image'}
            <VisuallyHiddenInput type="file" onChange={onFileChange} accept="image/*" />
          </Button>

          <Button
            variant="contained"
            disabled={!selectedFile || loading || !title.trim()}
            onClick={onUpload}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
            sx={{ 
              minWidth: '120px',
              transition: 'all 0.3s ease',
              '&:not(:disabled):hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>

        {selectedFile && (
          <Box 
            sx={{ 
              mt: 1, 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}
          >
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedFile.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onFileChange({ target: { files: null } })}
            >
              <X size={16} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UploadForm;