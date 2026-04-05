import {useState, useMemo} from'react';
import {List,ListItem,ListItemButton,ListItemIcon,ListItemText, TextField, Button,DialogActions,DialogContent,DialogContentText,DialogTitle, Typography} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectService } from '../services/projectService';
import {whiteSolidButton, whiteOutlinedButton} from './css/sx.tsx'
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from './context/EncryptionContext.tsx';
import { SidebarWrapper } from './SidebarWrapper.tsx';
import { ApplicationTheme, listVariants, type FileItem } from '../types/auth.ts';
import $api from '../api/axios.ts';
import { MotionDialog } from './ui/MotionDialog.tsx';

const MotionPaper = motion.div;

interface LeftSidebarProps {
    isOpen: boolean;
    onProjectSelect: (id: string) => void;
    onFileSelect: (fileId: string) => void; 
    closeFile: () => void;
}

function LeftSidebar({ isOpen, onProjectSelect, onFileSelect, closeFile}: LeftSidebarProps) {

  const [openDialog, setOpenDialog] = useState(false);
  const handleClickOpenDialog = () => {setOpenDialog(true);};
  const handleCloseDialog = () => {setOpenDialog(false);};
  const [searchField, setSearchField] = useState("");

  const { masterKey, projects, refreshProjects, currentTheme } = useEncryption();
  // const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  // const [projectIdSelected, setProjectIdSelected] = 
  const [allFilesForGraph, setAllFilesForGraph] = useState<FileItem[]>([]);
  // const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /*
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
  */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const projectName = formData.get('projectName') as string;

        if (!projectName || !masterKey) return;

        try {
            const projectKey = await DCrypto.generateProjectKey();
            const rawProjectKey = await DCrypto.exportProjectKey(projectKey);

            const encryptedName = await DCrypto.encrypt(projectName, projectKey);

            // const encrypted = await DCrypto.encrypt(projectName, masterKey);

            const wrappedKey = await DCrypto.encrypt(rawProjectKey, masterKey);

            const newProject = await ProjectService.createProject({
                name: encryptedName.content,  
                iv: encryptedName.iv, 
                encryptedProjectKey: wrappedKey.content,
                projectKeyIv: wrappedKey.iv
            });
            
            //setProjects(prev => [...prev, { ...newProject, name: projectName }]);
            await refreshProjects(); 
            onProjectSelect(newProject.id); 
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
  };

  const loadGlobalGraph = async () => {
    if (!masterKey || projects.length === 0) return;
    
    try {
      const projectKeyring = new Map<string, CryptoKey>();
      await Promise.all(projects.map(async (p: any) => {
            try {
                const rawKeyBase64 = await DCrypto.decrypt(p.encryptedProjectKey, p.keyIv, masterKey);
                const pKey = await DCrypto.importProjectKey(rawKeyBase64);
                projectKeyring.set(p.id, pKey);
            } catch (e) {
                console.warn(`Не удалось подготовить ключ для проекта ${p.name}`);
            }
        }));

      const response = await $api.get<any[]>('/files/all');
      
      const decryptedFiles = await Promise.all(response.data.map(async f => {
        try {
           const pKey = projectKeyring.get(f.projectId);
           if (!pKey) {
              const legacyName = await DCrypto.decrypt(f.name, f.iv, masterKey);
              return { ...f, name: legacyName + " (Legacy)" };
           }
           const name = await DCrypto.decrypt(f.name, f.iv, pKey);
             const rawTags = f.tags || f.Tags || [];
                const decryptedTags = await Promise.all(rawTags.map(async (t: any) => {
                    try {
                        const dName = await DCrypto.decrypt(t.encryptedName || t.EncryptedName, t.iv || t.Iv, pKey);
                        return { ...t, decryptedName: dName };
                    } catch { return null; }
                }));

           return { 
                    ...f, 
                    name, 
                    links: f.links || [], 
                    tags: decryptedTags.filter(t => t !== null) 
                };
        } catch {
          return { ...f, name: "Ошибка" };
        }
      }));
      
      setAllFilesForGraph(decryptedFiles);
    } catch (e) {
      console.error("Ошибка загрузки глобального графа", e);
    }
  };

  const changeSearchField = (event: any) => {
    setSearchField(event.target.value);
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchField.toLowerCase())
    );
  }, [projects, searchField]);

  return (
    <MotionPaper
            initial={false}
            animate={{
                x: isOpen ? 0 : -320,
                scaleX: isOpen ? 1 : 0.95
            }}
            transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1] 
            }}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
            }}
        >
          <SidebarWrapper classnames="leftSidebarOverlay" title={"Проекты"} files={allFilesForGraph} onFileSelect={onFileSelect} projects={projects} onOpenGraph={loadGlobalGraph} closeFile={closeFile}
          highAction
            children={
              <List sx={{px: 2, mt: 1 }}>
                <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ListItem key={project.id} disablePadding sx={{ mb: 1 }} component={motion.li} variants={listVariants} initial="hidden" animate="visible" exit="exit" custom={index} layout>
                    <ListItemButton
                      selected={selectedId === project.id}
                      onClick={() => {
                          onProjectSelect(project.id);
                          setSelectedId(project.id);
                      }}
                      sx={{ borderRadius: 3, pl: 1,'&.Mui-selected': {bgcolor: 'primary.light', color: 'primary.contrastText','&:hover': { bgcolor: currentTheme === ApplicationTheme.Dark ? 'white' : 'gray',}, '& .MuiListItemIcon-root': { color: 'inherit',}},
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <DashboardIcon />
                      </ListItemIcon>
                      <ListItemText primary={project.name} primaryTypographyProps={{ 
                  fontWeight: 'medium',
                  noWrap: true,       
                  title: project.name,
                  fontSize: '0.9rem',
              }} />
                    </ListItemButton>
                  </ListItem>
                ))}
                {filteredProjects.length === 0 && searchField && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block', mt: 2 }}>
                    Ничего не найдено
                  </Typography>
                )}
                </AnimatePresence>
              </List> 
            } 
            topAction={
               <TextField 
               onChange={changeSearchField} 
               value={searchField} 
               id="outlined-basic" 
               label="Поиск..." 
               variant="outlined" />
            } 
            bottomAction={
              <Button variant="contained" fullWidth startIcon={<CreateIcon />} onClick={handleClickOpenDialog} sx={{...whiteSolidButton, p:1.5}}>
                Создать проект
              </Button>
            }
            customsx={{

            }}
            variant="SidebarBlur"
            >
          </SidebarWrapper>
          <MotionDialog 
                      open={openDialog} 
                      onClose={handleCloseDialog}
                      maxWidth="sm"
                      fullWidth
                  >  
          
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
    Новый проект
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>
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
       color='secondary'     />
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
    </MotionPaper>
  );
}

export default LeftSidebar;