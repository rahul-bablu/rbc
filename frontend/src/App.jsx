import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  CssBaseline, 
  IconButton, 
  Menu, 
  MenuItem, 
  AppBar, 
  Toolbar, 
  Typography,
  Box,
  ThemeProvider
} from '@mui/material';
import { Menu as MenuIcon, Image, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import theme from './components/ImageUploader/theme';
import { ACCESS_TOKEN } from './constants';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import ProtectedRoute from './components/ProtectedRoute';

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGallery = () => {
    navigate('/gallery');
    handleClose();
  };

  const handleHome = () => {
    navigate('/');
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          onClick={handleHome}
          sx={{ 
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Poppins'
          }}
        >
          Secure Image Manager
        </Typography>
        <Box>
          <IconButton
            onClick={handleClick}
            size="large"
            edge="end"
            aria-label="menu"
            aria-controls={open ? 'menu-appbar' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ color: 'primary.main' }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleGallery} sx={{ gap: 1.5 }}>
              <Image size={18} />
              Gallery
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
              <LogOut size={18} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(ACCESS_TOKEN);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login isRegister />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                <ProtectedRoute>
                  <Navigation />
                  <Home />
                </ProtectedRoute>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <PrivateRoute>
                <>
                  <Navigation />
                  <Gallery />
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;