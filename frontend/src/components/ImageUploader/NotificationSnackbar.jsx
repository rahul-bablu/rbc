import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationSnackbar = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ 
        '& .MuiAlert-root': {
          width: '100%',
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            '0%': { transform: 'translateY(20px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        }
      }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        elevation={6} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;