import {useState, useEffect} from'react';
import {List,ListItem,ListItemButton,ListItemIcon,ListItemText, TextField, Button,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import { motion } from 'framer-motion';
import { ProjectService } from '../services/projectService';
import {whiteSolidButton, whiteOutlinedButton} from './css/sx.tsx'
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from './context/EncryptionContext.tsx';
import { SidebarWrapper } from './SidebarWrapper.tsx';

const MotionPaper = motion.div;

interface LeftSidebarProps {
    isOpen: boolean;
    onProjectSelect: (id: string) => void;
}

function LeftSidebar({ isOpen, onProjectSelect }: LeftSidebarProps) {

  const [openDialog, setOpenDialog] = useState(false);
  const handleClickOpenDialog = () => {setOpenDialog(true);};
  const handleCloseDialog = () => {setOpenDialog(false);};

  const { masterKey } = useEncryption();
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (masterKey) {
        ProjectService.getProjects().then( async data => {
                        const decryptedProjects = await Promise.all(data.map(async (p: any) => {
                try {
                    const clearName = await DCrypto.decrypt(p.name, p.iv, masterKey);
                    return { ...p, name: clearName };
                } catch (e) {
                    return { ...p, name: "Ошибка расшифровки" };
                }
            }));
            setProjects(decryptedProjects); 
        }).catch(err => console.error(err));
    }
  }, [masterKey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const projectName = formData.get('projectName') as string;

        if (!projectName || !masterKey) return;

        try {
            const encrypted = await DCrypto.encrypt(projectName, masterKey);

            const newProject = await ProjectService.createProject({
                name: encrypted.content,
                iv: encrypted.iv
            });
            
            setProjects(prev => [...prev, { ...newProject, name: projectName }]);
            
            onProjectSelect(newProject.id); 
            
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
  };

  return (
    <MotionPaper
            initial={false}
            animate={{
                x: isOpen ? 0 : -320,
                scaleX: isOpen ? 1 : 0.95
            }}
            transition={{
                duration: 1,
                ease: [0.4, 0, 0.2, 1] 
            }}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
            }}
        >
          <SidebarWrapper classnames="leftSidebarOverlay" title={"Проекты"} 
          highAction
            children={
              <List sx={{px: 2, mt: 1 }}>
                {projects.map((project, index) => (
                  <ListItem key={project.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={selectedIndex === index}
                      onClick={() => {
                          onProjectSelect(project.id);
                          setSelectedIndex(index);
                      }}
                      sx={{ borderRadius: 3,'&.Mui-selected': {bgcolor: 'primary.light', color: 'primary.contrastText','&:hover': { bgcolor: 'white',}, '& .MuiListItemIcon-root': { color: 'inherit',}},
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DashboardIcon />
                      </ListItemIcon>
                      <ListItemText primary={project.name} primaryTypographyProps={{ fontWeight: 'medium' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List> 
            } 
            topAction={
               <TextField sx={{'& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '15px', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' }, '&.Mui-focused fieldset': { borderColor: 'white' }, }, }} id="outlined-basic" label="Поиск..." variant="outlined" />
            } 
            bottomAction={
              <Button variant="contained" fullWidth startIcon={<CreateIcon />} onClick={handleClickOpenDialog} sx={{...whiteSolidButton, p:1.5}}>
                Создать проект
              </Button>
            }
            customsx={{
                bgcolor: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: "blur(20px) saturate(150%)",
                boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
            }}
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
    Новый проект
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
      Введите название для вашего нового проекта. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="projectName"
        label="Название проекта"
        type="text"
        fullWidth
        variant="outlined" 
        sx={{'& .MuiInputBase-input': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '15px','& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },'&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },'&.Mui-focused fieldset': { borderColor: 'white' }, },}}
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
    </MotionPaper>
  );
}

export default LeftSidebar;