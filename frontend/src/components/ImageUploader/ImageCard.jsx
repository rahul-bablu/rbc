import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box,
  Tooltip,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Lock, Clock, MoreVertical, Trash2 } from 'lucide-react';

const ImageCard = ({ image, onClick, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleClose();
    onDelete(image.id);
  };

  const formattedDate = new Date(image.uploaded_at).toLocaleString();

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .card-overlay': {
            opacity: 1
          }
        }
      }}
    >
      <ButtonBase 
        onClick={onClick} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          textAlign: 'left'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={`http://127.0.0.1:8000${image.image}`}
            alt={image.title || `Encrypted image ${image.id}`}
            sx={{ objectFit: 'cover' }}
          />
          <Box 
            className="card-overlay"
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <Typography 
              variant="body2" 
              color="white"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backdropFilter: 'blur(2px)',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                px: 2,
                py: 1,
                borderRadius: 4
              }}
            >
              <Lock size={16} style={{ marginRight: 4 }} /> Click to Decrypt
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              backdropFilter: 'blur(4px)'
            }}
          >
            <Lock size={14} style={{ marginRight: 4 }} />
            <Typography variant="caption">Encrypted</Typography>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Tooltip title={image.title || 'Untitled'}>
              <Typography 
                variant="subtitle1" 
                component="div" 
                sx={{ 
                  fontWeight: 500, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  flex: 1
                }}
              >
                {image.title || 'Untitled'}
              </Typography>
            </Tooltip>
            <IconButton 
              size="small" 
              onClick={handleMenuClick}
              sx={{ 
                ml: 1,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              <MoreVertical size={16} />
            </IconButton>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 'auto',
              pt: 1
            }}
          >
            <Clock size={14} style={{ color: '#666' }} />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ ml: 0.5 }}
            >
              {formattedDate}
            </Typography>
          </Box>
        </CardContent>
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem 
          onClick={handleDelete}
          sx={{ 
            color: 'error.main',
            gap: 1
          }}
        >
          <Trash2 size={16} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ImageCard;