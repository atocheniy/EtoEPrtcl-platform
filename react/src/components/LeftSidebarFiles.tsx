import type {MouseEvent } from 'react';
import {useState} from'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import { Create } from '@mui/icons-material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import {Popover } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { AuthService } from '../services/authService';
import { ProjectService } from '../services/projectService';
import { FileService } from '../services/fileService.ts';

import { useNavigate } from 'react-router';

import {whiteSolidButton, whiteOutlinedButton} from './css/sx.tsx'
import { $api } from '../api/axios';
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from './context/EncryptionContext.tsx';

const MotionPaper = motion.div;

const menuAnimation = {
    initial: {
        opacity: 0,
        scale: 0.96,
    },
    animate: {
        opacity: 1,
        scale: 1,
    },
    exit: {
        opacity: 0,
        scale: 0.96,
    },
};

const menuTransition = {
    duration: 0.18,
    ease: 'easeOut',
} as const;

interface FileItem {
    id: string;
    name: string;
    extension: string;
    iv: string;
}

interface LeftSidebarFilesProps {
  projectId: string | null;
  onBack: () => void;
  onFileSelect: (fileId: string) => void; 
}

function LeftSidebarFiles({ projectId, onBack, onFileSelect }: LeftSidebarFilesProps) {
  const { masterKey } = useEncryption();

   const [files, setFiles] = useState<FileItem[]>([]);
  const [projectName, setProjectName] = useState<string>('Загрузка...'); 
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const { userData } = useEncryption();

   const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fileName = formData.get('fileName') as string;

        if (!fileName || !projectId || !masterKey) return;

        try {
          const encrypted = await DCrypto.encrypt(fileName, masterKey);
          const response = await $api.post('/files', {
            name: encrypted.content,
            iv: encrypted.iv,
            projectId: projectId
          });
        
          const newFile = { ...response.data, name: fileName };
          setFiles(prev => [...prev, newFile]);
          onFileSelect(newFile.id); 
          handleCloseDialog();
        } catch (error) {
              console.error("Ошибка при создании файла:", error);
        }
    };

  useEffect(() => {
        if (projectId && masterKey) {               
            $api.get<FileItem[]>(`/files/project/${projectId}`)
                .then(async response => {
                    const decryptedFiles = await Promise.all(response.data.map(async f => {
                      try {
                          const name = await DCrypto.decrypt(f.name, f.iv, masterKey);
                          return { ...f, name };
                      } catch { return { ...f, name: "Ошибка расшифровки" }; }
                  }));
                    setFiles(decryptedFiles);
                })
                .catch(err => console.error("Ошибка загрузки файлов:", err));
           ProjectService.getProjectById(projectId)
                .then(async project => {
                  const name = await DCrypto.decrypt(project.name, project.iv, masterKey);
                
                  // console.log(project.name);
                  setProjectName(name);
                })
                .catch(err => console.error("Ошибка загрузки проекта:", err));
        } else {
            setFiles([]);
            setProjectName('');
        }
  }, [projectId, masterKey]); 

    
  
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

       const open = Boolean(anchorEl);

       

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleLogout = async () => {
        await DCrypto.clearAllKeys();
        AuthService.logout();
    };
    
      const getIcon = (ext: string) => {
      if (ext === '.md') return <DescriptionIcon />;
      if (['.png', '.jpg', '.jpeg'].includes(ext)) return <ImageIcon />;
      return <InsertDriveFileIcon />;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: 220, 
        m: 1,                  
        borderRadius: 2,       
        height: 'calc(100vh - 16px)', 
        
        bgcolor: 'background.paper',
        overflow: 'hidden',     
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >

      <Dialog open={openDialog} onClose={handleCloseDialog}  slotProps={{
    backdrop: {
      sx: {
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      
    },
    
  }}
  PaperProps={{
    sx: {
      borderRadius: '20px !important',
      bgcolor: 'rgba(12, 12, 12, 0.7) !important', 
      background: 'rgba(27, 27, 27, 0.7) !important', 
      backdropFilter: 'blur(12px) !important', 
      border: '1px solid rgba(255, 255, 255, 0.1) !important', 
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5) !important', 
      color: 'white !important', 
      minWidth: '400px !important', 
    }
  }}>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
    Новый Файл
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
      Введите название для вашего нового файла. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="fileName"
        label="Название файла"
        type="text"
        fullWidth
        variant="outlined" 
        sx={{
            '& .MuiInputBase-input': { color: 'white' },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '15px',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: 'white' }, 
            },
        }}
      />
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
      onClick={handleCloseDialog}
      variant="outlined"
      sx={{ 
        ...whiteOutlinedButton,
         m: 1,
        px: 3
      }}
    >Отмена
    </Button>
          <Button 
      type="submit" 
      form="subscription-form"
      variant="contained"
      sx={{
    ...whiteSolidButton,
    m: 1,
    px: 3
}}
    >
      Создать
    </Button>
        </DialogActions>
      </Dialog>

      <Typography variant='h6' sx={{m: 2, textAlign: 'center', fontWeight: 'bold', '&.Mui-selected': {bgcolor: 'primary.light'}}}>{projectName}</Typography>
      
      <Button 
          variant="contained"      
          startIcon={<ArrowBackIcon />} 
          onClick={onBack}
            sx={{ 
                ...whiteSolidButton,
                m: 1,
                ml: 2,
                mr: 2,
                p: 1,
            }}
            > Назад
      </Button>

      <Box
          component="form"
          sx={{ '& > :not(style)': { m: 2 } }}
          noValidate
          autoComplete="off"
        >
          <TextField sx={{
            '& .MuiInputBase-input': { color: 'white' },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '15px',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: 'white' }, 
            },
            
        }} id="outlined-basic" label="Поиск..." variant="outlined" />
      </Box>

      <Divider variant="fullWidth" />

      <List sx={{ flexGrow: 1, px: 2, mt: 1 }}>
        {files.map((file, index) => (
          <ListItem key={file.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
            disabled={!masterKey}
              selected={selectedIndex === index}
              onClick={() => {
                  setSelectedIndex(index); 
                  onFileSelect(file.id); 
              }}
              sx={{
                borderRadius: 3,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'white',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  }
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getIcon(file.extension)} 
              </ListItemIcon>
              <ListItemText 
                primary={file.name} 
                primaryTypographyProps={{ fontWeight: 'medium' }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider variant="fullWidth" />

      <Box sx={{ p: 2 }}>
        <Button
          variant="contained" 
          fullWidth           
          startIcon={<CreateIcon />} 
          onClick={handleClickOpenDialog}
          sx={{...whiteSolidButton, p:1.5}}
        >
          Создать файл
        </Button>
      </Box>
      <Box sx={{ p: 2, pt: 0.5 }}>
        <Button
          fullWidth           
          startIcon={<CloudDownloadIcon />} 
          
          sx={{...whiteOutlinedButton, p:1.5}}
          variant="outlined"
        >
          Загрузить файл
        </Button>
      </Box>

      <Box
                onClick={handleOpen}
                sx={{
                    m: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            >
                <Avatar
                    alt="User"
                    src="/static/images/avatar/1.jpg"
                    sx={{ width: 48, height: 48 }}
                />
                <Box>
                    <Typography fontWeight={600}>
                        {userData.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {userData.email}
                    </Typography>
                </Box>
            </Box>

            <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={handleClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    PaperProps={{
        component: Box,
        variants: menuAnimation,
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
        transition: menuTransition,
        sx: {
            borderRadius: '16px',
            minWidth: 200,
            background: 'rgba(43, 43, 43, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid rgba(75, 75, 75, 1)',
            overflow: 'hidden',
        },
    }}
>
    <List disablePadding>
        <ListItemButton sx={{
        mx: 1,
        my: 1,
        borderRadius: '12px',
        transition: 'background-color 0.15s ease',

        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
    }}>
            <ListItemText primary="Профиль" />
        </ListItemButton >
        <ListItemButton sx={{
        mx: 1,
        my: 1,
        borderRadius: '12px',
        transition: 'background-color 0.15s ease',

        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
    }}>
            <ListItemText primary="Настройки" />
        </ListItemButton>
        <ListItemButton sx={{
        mx: 1,
        my: 1,
        borderRadius: '12px',
        transition: 'background-color 0.15s ease',

        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
    }}>
            <ListItemText primary="Выйти" onClick={() => {handleClose(); handleLogout(); navigate('/login')}} />
        </ListItemButton>
    </List>
</Popover>
    </Paper>
  );
}

export default LeftSidebarFiles;