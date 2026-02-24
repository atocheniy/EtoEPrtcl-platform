import {useMemo, useRef, useState} from'react';
import {List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, IconButton} from '@mui/material';

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
import { listVariants, type FileItem } from '../types/auth.ts';
import GraphView from './ui/GraphView.tsx';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileService } from '../services/fileService.ts';

interface LeftSidebarFilesProps {
  projectId: string | null;
  onBack: () => void;
  onFileSelect: (fileId: string) => void; 
  projectIdSelected: string | null;
  isProjectSettinsOpen: boolean;
  setIsProjectSettinsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeFile: () => void;
  onRenameSuccess: (newName: string) => void;
}

function LeftSidebarFiles({ projectId, onBack, onFileSelect, projectIdSelected, isProjectSettinsOpen, setIsProjectSettinsOpen, closeFile, onRenameSuccess }: LeftSidebarFilesProps) {

  const { masterKey, projectData, projectFiles, setProjectFiles } = useEncryption();
  // const [files, setFiles] = useState<FileItem[]>([]);
  // const [projectName, setProjectName] = useState<string>('Загрузка...'); 
  const [openDialog, setOpenDialog] = useState(false);
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);

  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
      event.stopPropagation(); 
      setFileMenuAnchorEl(event.currentTarget);
      setMenuFile(file);
  };

  const handleFileMenuClose = () => {
      setFileMenuAnchorEl(null);
  };

  const handleOpenRename = () => {
      if (menuFile) {
          setNewFileName(menuFile.name);
          setOpenRenameDialog(true);
      }
      handleFileMenuClose();
  };

  const handleCloseRename = () => {
      setOpenRenameDialog(false);
      setNewFileName("");
      setMenuFile(null);
  };

  const handleRenameSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!menuFile || !newFileName.trim() || !masterKey) return;

    try {
        const currentIvBuffer = DCrypto.base64ToBuffer(menuFile.iv);

        const encrypted = await DCrypto.encrypt(newFileName, masterKey, currentIvBuffer);

        await FileService.updateFileMetadata(
          menuFile.id, 
          encrypted.content, 
          menuFile.extension, 
          menuFile.iv
        );

        if (menuFile.id === selectedId) onRenameSuccess(newFileName);

        setProjectFiles(prev => prev.map(f => 
          f.id === menuFile.id ? { ...f, name: newFileName } : f
        ));

        handleCloseRename();
    } catch (error) {
        console.error("Ошибка при переименовании файла:", error);
    }
};

  const handleDeleteFile = async () => {
    if (!menuFile) return;
    if (window.confirm(`Удалить файл ${menuFile.name}?`)) {
        try {
            await FileService.deleteFile(menuFile.id)
            setProjectFiles(prev => prev.filter(f => f.id !== menuFile.id));
            if (menuFile.id === selectedId) closeFile();

            setMenuFile(null);
            handleFileMenuClose();
        } catch (e) {
            console.error("Ошибка при удалении", e);
        }
    }
};

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId || !masterKey) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const rawText = e.target?.result as string;
            
            const sharedIv = window.crypto.getRandomValues(new Uint8Array(12));

            const encryptedContent = await DCrypto.encrypt(rawText, masterKey, sharedIv);
            const encryptedName = await DCrypto.encrypt(file.name, masterKey, sharedIv);

            const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : (isImage ? '.png' : '.md');

            const response = await $api.post('/files', {
                name: encryptedName.content,
                content: encryptedContent.content,
                iv: encryptedName.iv, 
                extension: extension,
                projectId: projectId
            });

            const newFile = { ...response.data, name: file.name };
            setProjectFiles(prev => [...prev, newFile]);
            
            console.log("Файл успешно загружен с общим IV");
            event.target.value = ''; 
        } catch (err) {
            console.error("Ошибка при загрузке/шифровании:", err);
        }
    };
    if (isImage) {
        reader.readAsDataURL(file); 
    } else {
        reader.readAsText(file);  
    }
};
  
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
          const encryptedContent = await DCrypto.encrypt("", masterKey, DCrypto.base64ToBuffer(encrypted.iv));
          const response = await $api.post('/files', {
            name: encrypted.content,
            content: encryptedContent.content,
            iv: encrypted.iv,
            projectId: projectId
          });
        
          const newFile = { ...response.data, name: fileName };
          setProjectFiles(prev => [...prev, newFile]);
          onFileSelect(newFile.id); 
          handleCloseDialog();
        } catch (error) {
              console.error("Ошибка при создании файла:", error);
        }
  };

  const changeSearchField = (event: any) => {
      setSearchField(event.target.value);
    }
  
  const filteredFiles = useMemo(() => {
    return projectFiles.filter((file) =>
      file.name.toLowerCase().includes(searchField.toLowerCase())
    );
  }, [projectFiles, searchField]);

  /*
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
        } else {
            setFiles([]);
        }
  }, [projectId, masterKey]); 
  */

  const handleDownloadFile = async () => {
    if (!menuFile || !masterKey) return;

    try {
        const response = await $api.get(`/files/${menuFile.id}`);
        const { content, iv } = response.data;

        if (!content) {
            console.warn("Файл пуст");
            return;
        }
        const decryptedContent = await DCrypto.decrypt(content, iv, masterKey);

        const blob = new Blob([decryptedContent], { type: 'text/markdown' });
        
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', menuFile.name);
        document.body.appendChild(link);
        link.click();

        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        handleFileMenuClose();
    } catch (error) {
        console.error("Ошибка при скачивании файла:", error);
    }
  };

  return (
    <>
    <SidebarWrapper
     projectIdSelected={projectIdSelected}
     isProjectSettinsOpen={isProjectSettinsOpen} setIsProjectSettinsOpen={setIsProjectSettinsOpen} closeFile={closeFile}
      customsx={{
        bgcolor: 'rgb(10, 10, 10)',
      }}
      title={projectId === projectData.id ? projectData.name : "Загрузка..."}
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
        <TextField onChange={changeSearchField} value={searchField} sx={{ '& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '15px', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: 'white' }, },}} id="outlined-basic" label="Поиск..." variant="outlined" />
     }
     children={
        <List sx={{ px: 2, mt: 1 }}>
        <AnimatePresence mode="popLayout">
        {filteredFiles.map((file, index) => (
          <ListItem key={file.id} disablePadding sx={{ mb: 1, '&:hover .file-actions': { opacity: 1 }  }}  component={motion.li} variants={listVariants} initial="hidden" animate="visible" exit="exit" custom={index} layout
          secondaryAction={
            <IconButton
              className="file-actions" 
              edge="end"
              size="small"
              onClick={(e) => handleFileMenuOpen(e, file)}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                color: 'rgba(117, 117, 117, 0.5)',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          }>
            <ListItemButton
            disabled={!masterKey}
              selected={selectedId === file.id}
              onClick={() => {
                  setSelectedId(file.id); 
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
              <ListItemText primaryTypographyProps={{ 
                  fontWeight: 'medium',
                  noWrap: true,       
                  title: file.name 
              }}
                primary={file.name} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        {filteredFiles.length === 0 && searchField && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block', mt: 2 }}>
            Ничего не найдено
          </Typography>
        )}
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
     <>
        <Button
            fullWidth           
            startIcon={<CloudDownloadIcon />} 
            onClick={() => fileInputRef.current?.click()}
            sx={{...whiteOutlinedButton, p:1.5}}
            variant="outlined"
          >
            Загрузить файл
          </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".md,.txt,.js,.ts,image/*"
          />
        </>
      }
      files={projectFiles}
      onFileSelect={onFileSelect}
      setSelectedId={setSelectedId}
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

      <Menu
  anchorEl={fileMenuAnchorEl}
  open={Boolean(fileMenuAnchorEl)}
  onClose={handleFileMenuClose}
  slotProps={{
    paper: {
      sx: {
        bgcolor: 'rgba(15, 15, 15, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: 'white',
        minWidth: '160px',
        mt: 0.5
      }
    }
  }}
>
  <MenuItem onClick={handleOpenRename} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
    <EditIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Переименовать</Typography>
</MenuItem>

<MenuItem onClick={() => { handleDownloadFile(); handleFileMenuClose(); }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
    <ArrowDownwardIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Скачать файл</Typography>
  </MenuItem>
  
  <MenuItem onClick={() => { handleDeleteFile(); handleFileMenuClose(); }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5, color: '#f87171' }}>
    <DeleteIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Удалить</Typography>
  </MenuItem>
</Menu>

<Dialog 
        open={openRenameDialog} 
        onClose={handleCloseRename}
        slotProps={{
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
        }}
    >
        <DialogTitle sx={{ fontWeight: 600 }}>Переименовать файл</DialogTitle>
        <DialogContent>
            <form onSubmit={handleRenameSubmit} id="rename-form">
                <TextField
                    autoFocus
                    margin="dense"
                    label="Новое название"
                    fullWidth
                    variant="outlined"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    sx={{'& .MuiInputBase-input': { color: 'white' },'& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },'& .MuiInputLabel-root.Mui-focused': { color: '#fff' },'& .MuiOutlinedInput-root': {borderRadius: '15px','& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },'&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },'&.Mui-focused fieldset': { borderColor: 'white' }, },}}
                />
            </form>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={handleCloseRename} variant="outlined"
            sx={{ 
              ...whiteOutlinedButton,
              m: 1,
              px: 3
            }}>
                Отмена
            </Button>
            <Button 
                type="submit" 
                form="rename-form" 
                variant="contained" 
                sx={{
                    ...whiteSolidButton,
                    m: 1,
                    px: 3
                }}
            >
                Сохранить
            </Button>
        </DialogActions>
    </Dialog>
      </>
  );
}

export default LeftSidebarFiles;