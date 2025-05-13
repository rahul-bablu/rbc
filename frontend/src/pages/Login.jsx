import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

const Login = ({ isRegister = false }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const route = isRegister ? '/api/user/register/' : '/api/token/';
      const res = await api.post(route, { username, password });
      
      if (!isRegister) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Paper 
        elevation={3}
        sx={{
          width: '100%',
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Box sx={{ 
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: 1
        }}>
          <Lock size={24} />
        </Box>

        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            fontFamily: 'Poppins',
            textAlign: 'center'
          }}
        >
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !username || !password}
            sx={{ 
              mt: 2,
              height: 48,
              fontFamily: 'Poppins'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isRegister ? 'Sign Up' : 'Sign In'
            )}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate(isRegister ? '/login' : '/register')}
                sx={{ fontWeight: 500 }}
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;