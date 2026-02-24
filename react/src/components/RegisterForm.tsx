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

function RegisterForm() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

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
            const keys = await initKeysForRegister(password, email);

            await AuthService.register({
                email, password, fullName,
                signingPublicKey: keys.publicKey,
                encryptedSigningPrivateKey: keys.encryptedPrivateKey,
                signingKeyIv: keys.iv,
                signSalt: keys.salt
            });
            navigate('/editor'); 
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Ошибка регистрации");
        }
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#ffffffff' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#ffffffff' }
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
            variant="outlined" 
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={textFieldStyle}
        />

        <TextField 
            label="Имя пользователя" 
            variant="outlined" 
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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

        <TextField 
            label="Повторить пароль" 
            type="password" 
            variant="outlined" 
            fullWidth
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            error={password !== confirmPass && confirmPass.length > 0}
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
        onClick={handleRegister} 
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
        Зарегистрироваться
      </Button>

    </Paper>
  )
}

export default RegisterForm