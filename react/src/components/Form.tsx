import { useState } from 'react';
import {
  Paper,
  Typography,
  Button
} from '@mui/material';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import {textFieldStyle} from './css/sx.tsx';

import { AuthService } from '../services/authService';

import { useNavigate } from 'react-router';
import { useEncryption } from './context/EncryptionContext.tsx';

function Form() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { initKeysForLogin } = useEncryption();

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
        bgcolor: '#222222b5',
        backdropFilter: "blur(10px)", 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '500px',
        p: 4,
        gap: 3,
        boxSizing: 'border-box'
      }}>

      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
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
            variant="outlined" 
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={textFieldStyle}
        />
        
        <TextField 
            label="Пароль" 
            type="password" 
            variant="outlined" 
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={textFieldStyle}
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
            color: 'black',
            border: '1px solid rgba(112, 112, 112, 0.3)',
            background: 'white',
            transition: '0.3s',
            '&:hover': {
                 border: '1px solid rgba(255, 255, 255, 1)',
                 background: 'rgba(82, 82, 82, 0.05)',
                 color: "white"
            }
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
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.61)',
                background: 'transparent',
                transition: '0.3s',
                '&:hover': {
                    border: '1px solid rgba(255, 255, 255, 1)',
                    background: 'rgba(82, 82, 82, 0.05)',
                    color: "white"
                }
            }}
        >
            Сбросить пароль
        </Button>
      </Box>

    </Paper>
  )
}

export default Form