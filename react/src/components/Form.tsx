import { useState } from 'react';
import {
  Paper,
  Typography,
  Button
} from '@mui/material';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { AuthService } from '../services/authService';

import { useNavigate } from 'react-router';
import { useEncryption } from './context/EncryptionContext.tsx';
import { ApplicationTheme, PerformanceMode } from '../types/auth.ts';

function Form() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { initKeysForLogin } = useEncryption();
    const { mode, currentTheme } = useEncryption();

    const handleLogin = async () => {
        try {
            const response = await AuthService.login({ email, password });
            const { encryptedSigningPrivateKey, signingKeyIv, salt, encryptedExchangePrivateKey, exchangeKeyIv } = response.data;

            await initKeysForLogin(
                password, 
                salt,
                
                encryptedSigningPrivateKey, 
                signingKeyIv,

                encryptedExchangePrivateKey,
                exchangeKeyIv
            );
            navigate('/editor');
            
        } catch (err: any) {
            console.error(err);
            setError("Неверный логин или пароль");
        }
    };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
        bgcolor: currentTheme === ApplicationTheme.Dark ? '#222222b5' : '#f5f5f5',
        backdropFilter: mode === PerformanceMode.Off ? "blur(10px)" : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '500px',
        p: 4,
        gap: 3,
        boxSizing: 'border-box'
      }}>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Вход в аккаунт
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%'
        }}
        noValidate
        autoComplete="off"
      >
        <TextField 
            label="Почта" 
            color='secondary'
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        
        <TextField 
            label="Пароль" 
            type="password" 
            color='secondary'
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
      </Box>

       {error && (
        <Typography color="error" variant="body2">
            {error}
        </Typography>
      )}

      <Button
        fullWidth
        variant='contained'
        onClick={handleLogin} 
        sx={{
            mt: 1,
            borderRadius: '12px',
            textTransform: 'none',
            border: '1px solid rgba(112, 112, 112, 0.3)',
            transition: '0.3s',
        }}
      >
        Войти
      </Button>

       <Box sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "20px",
        justifyContent: "center",
        alignItems: 'center'
      }}>
        <Typography>Забыли пароль?</Typography>
        <Button
            fullWidth
            variant='outlined'
            sx={{
                mt: 1,
                width: "200px",
                borderRadius: '12px',
                textTransform: 'none',
                border: '1px solid rgba(255, 255, 255, 0.61)',
                transition: '0.3s',
            }}
        >
            Сбросить пароль
        </Button>
      </Box>

    </Paper>
  )
}

export default Form