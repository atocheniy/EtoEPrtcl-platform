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
import { useEncryption } from './context/EncryptionContext';
import { ApplicationTheme, PerformanceMode } from '../types/auth';

function RegisterForm() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

     const { currentTheme } = useEncryption();

    const { initKeysForRegister } = useEncryption();
    
    const handleRegister = async () => {
        setError('');

        if (!email || !password || !fullName) {
            setError('Заполните все поля');
            return;
        }
        if (password !== confirmPass) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const keys = await initKeysForRegister(password);

            await AuthService.register({
                email, password, fullName,
                
                signingPublicKey: keys.publicKey,
                encryptedSigningPrivateKey: keys.encryptedPrivateKey,
                signingKeyIv: keys.iv,

                signSalt: keys.salt,

                exchangePublicKey: keys.exchangePublicKey,
                encryptedExchangePrivateKey: keys.encryptedExchangePrivateKey,
                exchangeKeyIv: keys.exchangeKeyIv,
              
                theme: ApplicationTheme.Auto,
                mode: PerformanceMode.On,
            });

            navigate('/editor');  
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Ошибка регистрации");
        }
    };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
        bgcolor: currentTheme === ApplicationTheme.Dark ? '#222222b5' : '#f5f5f5',
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
        Регистрация аккаунта
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
            color="secondary"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <TextField 
            label="Имя пользователя" 
            color="secondary"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
        />
        
        <TextField 
            label="Пароль" 
            type="password" 
            color="secondary"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <TextField 
            label="Повторить пароль" 
            type="password" 
            color="secondary"
            fullWidth
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            error={password !== confirmPass && confirmPass.length > 0}
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
        onClick={handleRegister} 
        sx={{
            mt: 1,
            borderRadius: '12px',
            textTransform: 'none',
            border: '1px solid rgba(112, 112, 112, 0.3)',
            transition: '0.3s',
        }}
      >
        Зарегистрироваться
      </Button>

    </Paper>
  )
}

export default RegisterForm