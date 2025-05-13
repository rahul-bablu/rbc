import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box,
  IconButton, 
  Typography,
  Slide
} from '@mui/material';
import { Download, X } from 'lucide-react';



const Transition = React.forwardRef(function Transition(
  props,
  ref,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DecryptModal = ({ open, imageUrl, onClose }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'decrypted-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="div" >Decrypted Image</Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <X />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 2, textAlign: 'center' }}>
        {imageUrl ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              animation: 'fadeIn 0.5s ease',
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
              },
            }}
          >
            <img
              src={imageUrl}
              alt="Decrypted content"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                borderRadius: 8,
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No image to display
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<X size={18} />}>
          Close
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          disabled={!imageUrl}
          startIcon={<Download size={18} />}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecryptModal;