import {useState} from'react';
import {List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import { useEffect } from 'react';

import TextField from '@mui/material/TextField';
import CreateIcon from '@mui/icons-material/Create';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import { AnimatePresence } from 'framer-motion';

import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ProjectService } from '../services/projectService';
import {whiteSolidButton, whiteOutlinedButton} from './css/sx.tsx'
import { $api } from '../api/axios';
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from './context/EncryptionContext.tsx';
import { SidebarWrapper } from './SidebarWrapper.tsx';
import type { FileItem } from '../types/auth.ts';

interface LeftSidebarFilesProps {
  projectId: string | null;
  onBack: () => void;
  onFileSelect: (fileId: string) => void; 
}

const listVariants = {
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
  hidden: { opacity: 0, x: -20 },
  exit: { opacity: 0, x: -10, transition: { duration: 0.1 } }
};

function LeftSidebarFiles({ projectId, onBack, onFileSelect }: LeftSidebarFilesProps) {

  const { masterKey } = useEncryption();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [projectName, setProjectName] = useState<string>('Загрузка...'); 
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClickOpenDialog = () => { setOpenDialog(true);};
  const handleCloseDialog = () => {setOpenDialog(false);};

  const getIcon = (ext: string) => {
      if (ext === '.md') return <DescriptionIcon />;
      if (['.png', '.jpg', '.jpeg'].includes(ext)) return <ImageIcon />;
      return <InsertDriveFileIcon />;
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

  return (
    <>
    <SidebarWrapper
      customsx={{
        bgcolor: 'rgb(10, 10, 10)',
      }}
      title={projectName}
      highAction={
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
      }
     topAction={
        <TextField sx={{ '& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '15px', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: 'white' }, },}} id="outlined-basic" label="Поиск..." variant="outlined" />
     }
     children={
        <List sx={{ px: 2, mt: 1 }}>
        <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <ListItem key={file.id} disablePadding sx={{ mb: 1 }}  component={motion.li} variants={listVariants} initial="hidden" animate="visible" exit="exit" custom={index} layout>
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
        </AnimatePresence>
      </List>
     }
     bottomAction={
      <Button
          variant="contained" 
          fullWidth           
          startIcon={<CreateIcon />} 
          onClick={handleClickOpenDialog}
          sx={{...whiteSolidButton, p:1.5}}
        >
          Создать файл
        </Button>
     }
     secondBottomAction={
      <Button
          fullWidth           
          startIcon={<CloudDownloadIcon />} 
          
          sx={{...whiteOutlinedButton, p:1.5}}
          variant="outlined"
        >
          Загрузить файл
        </Button>
     }
    >
    </SidebarWrapper>

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
        sx={{'& .MuiInputBase-input': { color: 'white' },'& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },'& .MuiInputLabel-root.Mui-focused': { color: '#fff' },'& .MuiOutlinedInput-root': {borderRadius: '15px','& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },'&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },'&.Mui-focused fieldset': { borderColor: 'white' }, },}}
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
      </>
  );
}

export default LeftSidebarFiles;