import { Paper, Divider, Typography, Box, type SxProps, Dialog, IconButton, Button, Menu, MenuItem } from '@mui/material';
import { UserSection } from './UserSection';

import CloseIcon from '@mui/icons-material/Close';
import GraphView from './ui/GraphView';
import { useState } from 'react';
import type { FileItem } from '../types/auth';
import { whiteSolidButton } from './css/sx';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListIcon from '@mui/icons-material/List';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { AnimatePresence, motion } from 'framer-motion';

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
}

export const SidebarWrapper = ({ classnames, title, highAction, children, topAction, bottomAction, secondBottomAction, customsx, files, projects = [], projectIdSelected, setSelectedId, onFileSelect, onOpenGraph, setIsProjectSettinsOpen, isProjectSettinsOpen, closeFile}: SidebarWrapperProps) => {
    const [showGraph, setShowGraph] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const MotionTypography = motion(Typography);

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
                    sx: {backgroundColor: 'rgba(0, 0, 0, 0)' }
                }
            }}
            PaperProps={{ 
                sx: { 
                    bgcolor: 'rgba(12, 12, 12, 0.7) !important', 
                    background: 'rgba(27, 27, 27, 0.7) !important',
                    backdropFilter: 'blur(12px) !important', 
                    color: 'white !important',
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
                    color: 'white',
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

            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        mt: 1,
                        bgcolor: 'rgba(30, 30, 30, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        minWidth: '180px',
                        borderRadius: '12px'
                    }
                }}
            >
                <MenuItem onClick={handleSelectGraph} sx={{ gap: 1.5, py: 1, mx: 0.5, borderRadius: '10px', }}>
                    <AccountTreeIcon fontSize="small" sx={{ opacity: 0.7, color: '#818cf8' }} />
                    <Typography variant="body2">Граф знаний</Typography>
                </MenuItem>
                {projectIdSelected ? 
                ( 
                <MenuItem onClick={openProjectSettings} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>
                    <SettingsApplicationsIcon fontSize="small" sx={{ opacity: 0.7, color: '#818cf8' }} />
                    <Typography variant="body2">Настройки проекта</Typography>
                </MenuItem>
                ) : (null)}
               
            </Menu>

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