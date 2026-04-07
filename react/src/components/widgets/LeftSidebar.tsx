import {useState, useMemo} from'react';
import {List,ListItem,ListItemButton,ListItemIcon,ListItemText, TextField, Button, Typography} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import { AnimatePresence, motion } from 'framer-motion';
import {whiteSolidButton} from '../css/sx.tsx'
import { useApplication } from '../context/ApplicationContext.tsx';
import { SidebarWrapper } from '../layout/SidebarWrapper.tsx';
import { ApplicationTheme, listVariants, type FileItem } from '../../types/auth.ts';
import { useLoadGraph } from '../../hooks/useLoadGraph.ts';
import CreateProjectDialog from './dialogs/CreateProjectDialog.tsx';

const MotionPaper = motion.div;

interface LeftSidebarProps {
    isOpen: boolean;
    onProjectSelect: (id: string) => void;
    onFileSelect: (fileId: string) => void; 
    closeFile: () => void;
}

function LeftSidebar({ isOpen, onProjectSelect, onFileSelect, closeFile}: LeftSidebarProps) {
  const { LoadGlobalGraph } = useLoadGraph(); 
  const [openDialog, setOpenDialog] = useState(false);
  const handleClickOpenDialog = () => {setOpenDialog(true);};
  const handleCloseDialog = () => {setOpenDialog(false);};
  const [searchField, setSearchField] = useState("");
  const { projects, currentTheme } = useApplication();
  const [allFilesForGraph, setAllFilesForGraph] = useState<FileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
          <SidebarWrapper classnames="leftSidebarOverlay" title={"Проекты"} files={allFilesForGraph} onFileSelect={onFileSelect} projects={projects} onOpenGraph={() => LoadGlobalGraph({ setAllFilesForGraph })} closeFile={closeFile}
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
          <CreateProjectDialog handleCloseDialog={handleCloseDialog} onProjectSelect={onProjectSelect} openDialog={openDialog} />
    </MotionPaper>
  );
}

export default LeftSidebar;