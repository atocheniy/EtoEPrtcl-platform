import { useState } from 'react';
import { 
  Box, Container, Typography, Avatar, Paper, Stack, 
  Button, Switch, Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

import AnimatedPage from '../components/AnimatedPage';
import { useEncryption } from '../components/context/EncryptionContext';
import { textFieldStyle, whiteSolidButton } from '../components/css/sx';
import { UserService } from '../services/userService';
import type { UpdateName } from '../types/auth';

type EditMode = 'name' | 'email' | 'password' | null;

function UserPage() {
  const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(false);

  const { userData } = useEncryption();
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [inputValue, setInputValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { orbColors } = useEncryption();

  const { refreshUserData } = useEncryption();

  const handleOpenEdit = (mode: EditMode, currentVal: string = '') => {
    setEditMode(mode);
    setInputValue(mode === 'password' ? '' : currentVal);
    setConfirmPassword('');
  };

  const handleClose = () => {
    setEditMode(null);
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log(`Сохранение для ${editMode}:`, inputValue);
      if(editMode == 'name'){
        UserService.changeName({ newName: inputValue });
      }
      else if(editMode == 'email'){
        UserService.changeEmail({ newEmail: inputValue });
      }
      else if(editMode == 'password'){
         await new Promise(res => setTimeout(res, 1000));
      }

      await refreshUserData();
      handleClose();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

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
            <Avatar sx={{ width: 100, height: 100, bgcolor: '#ffffff', fontSize: '2rem' }}>
              {userData.fullName.toUpperCase().substring(0, 2)}
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
                <Button onClick={() => handleOpenEdit('name', userData.fullName)} size="small" sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)'), textTransform: 'none' }}>Изменить</Button>
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
                <Button onClick={() => handleOpenEdit('email', userData.email)} size="small" sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)'), textTransform: 'none' }}>Изменить</Button>
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
                <Button onClick={() => handleOpenEdit('password')} size="small" sx={{ color: orbColors[0].replace(/[\d.]+\)$/g, '1)'), textTransform: 'none' }}>Сменить</Button>
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
                    '& .MuiSwitch-switchBase.Mui-checked': { color: orbColors[0].replace(/[\d.]+\)$/g, '1)') },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3a3a3a' }
                  }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Dialog 
            open={Boolean(editMode)} 
            onClose={handleClose}
            PaperProps={{
              sx: {
                bgcolor: 'rgb(35, 35, 35)',
                backgroundImage: 'none',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                p: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          >
            <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
              {editMode === 'name' && 'Изменить имя'}
              {editMode === 'email' && 'Изменить почту'}
              {editMode === 'password' && 'Смена пароля'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label={editMode === 'password' ? 'Новый пароль' : 'Новое значение'}
                  type={editMode === 'password' ? 'password' : 'text'}
                  variant="outlined"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  sx={textFieldStyle}
                  disabled={loading}
                />
                {editMode === 'password' && (
                  <TextField
                    fullWidth
                    label="Подтвердите пароль"
                    type="password"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={textFieldStyle}
                    disabled={loading}
                    error={inputValue !== confirmPassword && confirmPassword.length > 0}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}>
                Отмена
              </Button>
              <Button 
                onClick={handleSave} 
                variant="contained" 
                disabled={loading || !inputValue || (editMode === 'password' && inputValue !== confirmPassword)}
                sx={{ ...whiteSolidButton, minWidth: '100px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Сохранить'}
              </Button>
            </DialogActions>
          </Dialog>

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