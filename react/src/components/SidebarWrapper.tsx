import { Paper, Divider, Typography, Box, type SxProps, Dialog, IconButton, Button, Menu, MenuItem, type PaperProps } from '@mui/material';
import { UserSection } from './UserSection';

import CloseIcon from '@mui/icons-material/Close';
import GraphView from './ui/GraphView';
import { useState } from 'react';
import { ApplicationTheme, PerformanceMode, type FileItem } from '../types/auth';
import { whiteSolidButton } from './css/sx';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListIcon from '@mui/icons-material/List';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { AnimatePresence, motion } from 'framer-motion';
import { useEncryption } from './context/EncryptionContext';
import { MotionMenu } from './ui/MotionMenu';

interface SidebarWrapperProps {
    classnames?: string;
    title: string;
    highAction: React.ReactNode;
    children: React.ReactNode;
    topAction?: React.ReactNode;
    bottomAction?: React.ReactNode;
    secondBottomAction?: React.ReactNode;
    customsx?: SxProps;
    files?: FileItem[];
    projects?: { id: string, name: string }[];
    projectIdSelected?: string | null;
    setSelectedId?: React.Dispatch<React.SetStateAction<string | null>>
    onFileSelect?: (fileId: string) => void; 
    onOpenGraph?: () => Promise<void>;
    setIsProjectSettinsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    isProjectSettinsOpen?: boolean;
    closeFile: () => void;
    variant?: PaperProps['variant']; 
}

export const SidebarWrapper = ({ classnames, title, highAction, children, topAction, bottomAction, secondBottomAction, customsx, variant, files, projects = [], projectIdSelected, setSelectedId, onFileSelect, onOpenGraph, setIsProjectSettinsOpen, isProjectSettinsOpen, closeFile}: SidebarWrapperProps) => {
    const [showGraph, setShowGraph] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const MotionTypography = motion(Typography);

    const { orbColors } = useEncryption();
    const { mode, currentTheme } = useEncryption();

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSelectGraph = () => {
        if (onOpenGraph) onOpenGraph();
        setShowGraph(true);
        handleCloseMenu();
    };

    const openProjectSettings = () => {
        closeFile();
        if(setIsProjectSettinsOpen){
            console.log(isProjectSettinsOpen);
            setIsProjectSettinsOpen(!isProjectSettinsOpen);
            handleCloseMenu();
        }
    }

    const handleFileSelect = (id: string) => {
        if(setSelectedId && onFileSelect) {
            setSelectedId(id);
            onFileSelect(id);
        }
    };
    
    return (
        <>
       <Dialog fullScreen open={showGraph} onClose={() => setShowGraph(false)}
         slotProps={{
                backdrop: {
                    sx: {backgroundColor:  'rgba(0, 0, 0, 0)' }
                }
            }}
            PaperProps={{ 
                sx: { 
                    bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(12, 12, 12, 0.7) !important' : 'rgba(230, 230, 230, 0.7) !important',
                    background: currentTheme === ApplicationTheme.Dark ? 'rgba(27, 27, 27, 0.7) !important' : 'rgba(230, 230, 230, 0.7) !important',
                    backdropFilter: mode === PerformanceMode.Off ? 'blur(12px) !important' : undefined,
                    color: currentTheme === ApplicationTheme.Dark ? 'white !important' : 'black !important',
                } 
            }}>
                <IconButton onClick={() => setShowGraph(false)} sx={{ position: 'absolute', top: 20, right: 20, zIndex: 999 }}>
                  <CloseIcon />
                </IconButton>
        
                <GraphView 
                    files={files ? files : []}
                    projects={projects}
                    onNodeClick={(id) => {
                        handleFileSelect(id);
                        setShowGraph(false);
                    }} 
                />
             </Dialog>
        <Paper
        variant={variant}
        elevation={1}
        className={classnames}
        sx={[{
            width: 220, 
            m: 1,                  
            borderRadius: 3,       
            height: 'calc(100vh - 16px)', 
        
            overflow: 'hidden',     
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.08)',

            transition: 'all 0.3s ease-in-out',
        }, ...(Array.isArray(customsx) ? customsx : [customsx]),]}
        >
            <Box 
                onClick={handleOpenMenu}
                sx={{ 
                    m: 2, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 0.5,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.8 }
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                    </motion.div>
                </AnimatePresence>
                <KeyboardArrowDownIcon sx={{ opacity: 0.5 }} />
            </Box>

<MotionMenu
  anchorEl={anchorEl}
  open={openMenu}
  onClose={handleCloseMenu}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
  transformOrigin={{ vertical: 'top', horizontal: 'center' }} 
  sx={{ minWidth: '180px', mt: 0.5 }}
>
        
                <MenuItem onClick={handleSelectGraph} sx={{ gap: 1.5, py: 1, mx: 0.5, borderRadius: '10px', }}>
                    <AccountTreeIcon fontSize="small" sx={{ opacity: 0.7,  color: `${orbColors[1].replace(/[\d.]+\)$/g, '0.8)')} !important` }} />
                    <Typography variant="body2">Граф знаний</Typography>
                </MenuItem>
                {projectIdSelected ? 
                ( 
                <MenuItem onClick={openProjectSettings} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>
                    <SettingsApplicationsIcon fontSize="small" sx={{ opacity: 0.7,  color: `${orbColors[1].replace(/[\d.]+\)$/g, '0.8)')} !important` }} />
                    <Typography variant="body2">Настройки проекта</Typography>
                </MenuItem>
                ) : (null)}
               
            </MotionMenu>

            {highAction}

            <Box component="form" sx={{ '& > :not(style)': { m: 2 } }} noValidate autoComplete="off">
                {topAction}
            </Box>
            
            <Divider variant="fullWidth" />

            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#222', borderRadius: '10px' },
                '&': {
                    scrollbarWidth: 'thin', 
                    scrollbarColor: 'rgba(54, 54, 54, 0) transparent',
                    transition: "all 0.3s",
                },
                '&:hover': {
                    scrollbarColor: 'rgba(54, 54, 54, 1) transparent',
                }
            }}>
                {children}
            </Box>

            <Divider variant="fullWidth" />
            <Box sx={{ p: 2 }}>
                {bottomAction}
            </Box>

            {secondBottomAction ? (
                <Box sx={{ p: 2, pt: 0.5 }}>
                    {secondBottomAction}
                </Box>) : <></>
            }

            <UserSection />
        </Paper>
        </>
    );
};