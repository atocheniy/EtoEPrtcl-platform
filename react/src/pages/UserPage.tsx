import { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Avatar, Paper, Stack, 
  Button, Switch, FormControlLabel, Divider, TextField,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';

import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

import AnimatedPage from '../components/AnimatedPage';
import { useEncryption } from '../components/context/EncryptionContext';

function UserPage() {
 const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(false);

  const { userData } = useEncryption();

  const updateName = () => {

  }

  const updateEmail = () => {
    
  }

  const sectionStyle = {
    p: 3,
    borderRadius: 4,
    bgcolor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    mb: 3
  };

  return (
    <AnimatedPage>
      <Box className='mainContainer' sx={{ overflowY: 'auto', py: 5 }}>
        <Container maxWidth="sm" sx={{background: "rgb(27, 27, 27)", padding: "20px", borderRadius: "20px"}}>
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/editor')}
            sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, textTransform: 'none' }}
          >
            Вернуться в редактор
          </Button>

          <Stack alignItems="center" spacing={2} sx={{ mb: 6 }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: '#818cf8', fontSize: '2rem' }}>
              U
            </Avatar>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>{userData.fullName}</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.5)">{userData.email}</Typography>
            </Box>
          </Stack>

          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', ml: 1 }}>Личные данные</Typography>
          <Paper elevation={0} sx={sectionStyle}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)">Имя</Typography>
                    <Typography variant="body1">{userData.fullName}</Typography>
                  </Box>
                </Stack>
                <Button size="small" sx={{ color: '#818cf8', textTransform: 'none' }}>Изменить</Button>
              </Stack>
              
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)">Почта</Typography>
                    <Typography variant="body1">{userData.email}</Typography>
                  </Box>
                </Stack>
                <Button size="small" sx={{ color: '#818cf8', textTransform: 'none' }}>Изменить</Button>
              </Stack>
            </Stack>
          </Paper>

          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', ml: 1 }}>Безопасность</Typography>
          <Paper elevation={0} sx={sectionStyle}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <ShieldIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="body1">Пароль</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.4)"></Typography>
                  </Box>
                </Stack>
                <Button size="small" sx={{ color: '#818cf8', textTransform: 'none' }}>Сменить</Button>
              </Stack>

              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">Двухфакторная аутентификация</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.4)">
                    Дополнительный код подтверждения на почту
                  </Typography>
                </Box>
                <Switch 
                  checked={twoFactor} 
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#818cf8' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#818cf8' }
                  }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button color="error" sx={{ textTransform: 'none', opacity: 0.6, '&:hover': { opacity: 1 } }}>
              Удалить аккаунт
            </Button>
          </Box>

        </Container>
      </Box>
    </AnimatedPage>
  );
}

export default UserPage