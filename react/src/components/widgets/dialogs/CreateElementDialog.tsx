import { MotionTextField } from '../../motion/MotionTextField.tsx';
import { MotionDialog } from '../../motion/MotionDialog.tsx';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import { useApplication } from '../../context/ApplicationContext.tsx';
import type { FileItem } from '../../../types/auth.ts';
import { DCrypto } from '../../../services/cryptoService.ts';
import DescriptionIcon from '@mui/icons-material/Description';

import {whiteSolidButton, whiteOutlinedButton} from '../../css/sx.tsx'
import $api from '../../../api/axios.ts';
import { useMemo } from 'react';

interface CreateElementDialogProps {
    openDialog: boolean;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    isCreatingFolder: boolean;
    createParentId: string | null;
    onFileSelect: (fileId: string) => void; 
    setExpanded: React.Dispatch<React.SetStateAction<string[]>>;
    setCreateParentId: React.Dispatch<React.SetStateAction<string | null>>;
}

function CreateElementDialog({ openDialog, setOpenDialog, isCreatingFolder, createParentId, onFileSelect, setExpanded, setCreateParentId }: CreateElementDialogProps) {
     const handleCloseDialog = () => {setOpenDialog(false);};
     const { currentProjectId, masterKey, currentProjectKey, orbColors, projectFiles, setProjectFiles } = useApplication();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const fileName = formData.get('fileName') as string;
    
            if (!fileName || !currentProjectId || !masterKey || !currentProjectKey) return;
    
            try {
              const encrypted = await DCrypto.encrypt(fileName, currentProjectKey);
              const encryptedContent = await DCrypto.encrypt("", currentProjectKey, DCrypto.base64ToBuffer(encrypted.iv));
              const response = await $api.post('/files', {
                name: encrypted.content,
                content: encryptedContent.content,
                iv: encrypted.iv,
                projectId: currentProjectId,
                parentId: createParentId,
                isFolder: isCreatingFolder,
              });
            
              const serverData = response.data;
    
              const newItem: FileItem = { 
                id: serverData.id || serverData.Id, 
                name: fileName, 
                iv: serverData.iv || serverData.Iv,
                extension: serverData.extension || serverData.Extension || (isCreatingFolder ? "" : ".md"),
                parentId: createParentId,
                isFolder: isCreatingFolder,
              };
    
              setProjectFiles(prev => [...prev, newItem]);
    
              if (createParentId) {
                setExpanded(prev => prev.includes(createParentId) ? prev : [...prev, createParentId]);
              }
    
              if (!isCreatingFolder) onFileSelect(newItem.id); 
              handleCloseDialog();
            } catch (error) {
                  console.error("Ошибка при создании файла:", error);
            }
      };

      const availableFolders = useMemo(() => {
        return projectFiles.filter(f => f.isFolder);
    }, [projectFiles]);

    return(
        <MotionDialog 
                      open={openDialog} 
                      onClose={handleCloseDialog}
                      maxWidth="sm"
                      fullWidth
                  >  
   
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
    {isCreatingFolder ? <FolderIcon sx={{mb: 0.1, color: orbColors[1].replace(/[\d.]+\)$/g, '1)')}}/> : <DescriptionIcon sx={{mb: 0.1}}/>}
    {isCreatingFolder ? "Новая Папка" : "Новый Файл"}
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>
    Введите название для {isCreatingFolder ? "папки" : "файла"}. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <Stack spacing={3}>
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="fileName"
        label="Название файла"
        type="text"
        fullWidth
       color='secondary'  />
       
       <MotionTextField
          fullWidth
          label="Разместить в..."
          value={createParentId || ""}
          onChange={(val) => setCreateParentId(val || null)}
          color='secondary'
          sx={{'& .MuiOutlinedInput-root': {
            borderRadius: '15px',
            
          }
          }}
       >
          <MenuItem {...({ value: "", label: "Корень проекта" } as any)}  sx={{ gap: 1.5, py: 1, mb: 0.5, mx: 0.5, borderRadius: '10px',  }}>
            <InsertDriveFileIcon fontSize="small" sx={{ opacity: 0.5 }} />
            <Typography variant="body2">Корень проекта (общее пространство)</Typography>
          </MenuItem>
          
          {availableFolders.map((folder) => (
            <MenuItem key={folder.id} {...({ value: folder.id, label: folder.name } as any)} sx={{ gap: 1.5, py: 1, mb: 0.5, mx: 0.5, borderRadius: '10px',  }}>
              <FolderIcon fontSize="small" sx={{ opacity: 0.7, color: orbColors[1] }} />
              <Typography variant="body2">{folder.name}</Typography>
            </MenuItem>
          ))}
        </MotionTextField>
      </Stack>
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
      </MotionDialog>
    );
}

export default CreateElementDialog;