import { useState} from 'react';
import type {MouseEvent } from 'react';
import { Box, Avatar, Typography, Popover, List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router';
import { AuthService } from '../services/authService';
import { DCrypto } from '../services/cryptoService';
import { useEncryption } from './context/EncryptionContext';
import { ColorSettingsDialog } from './ui/ColorSettingsDialog';
import { AnimatePresence, motion } from 'framer-motion';
import {Paper } from '@mui/material';
import { MotionPopover } from './ui/MotionPopover';

const menuAnimation = {
  initial: { 
    opacity: 0, 
    scale: 0.52, 
    filter: 'blur(20px)',
    y: 10 
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.52, 
    filter: 'blur(20px)', 
    transition: { duration: 0.2 } 
  }
};



const menuTransition = {
    duration: 0.18,
    ease: 'easeOut',
} as const;

export const UserSection = () => {

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const { userData, logout } = useEncryption(); 
    const navigate = useNavigate();

    const [openColorDialog, setOpenColorDialog] = useState(false);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        logout(); 
        // AuthService.logout();
    };

    const MotionPaper = motion(Paper);
    

    return (
        <>
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
                    maxWidth: '100%', 
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            >
                <Avatar
                    alt={userData.fullName.toUpperCase()}
                    src="/static/images/avatar/1.jpg"
                    sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: '#ffffff', }}
                >{userData.fullName.toUpperCase().substring(0, 2)}</Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={600} noWrap>
                        {userData.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }} title={userData.email}>
                        {userData.email}
                    </Typography>
                </Box>
            </Box>

         <MotionPopover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
            
            <List disablePadding>
                <ListItemButton onClick={() => {handleClose(); navigate('/user_profile')}} sx={{
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
                <ListItemButton onClick={() => {handleClose(); setOpenColorDialog(true)}} sx={{
                mx: 1,
                my: 1,
                borderRadius: '12px',
                transition: 'background-color 0.15s ease',

                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                },
            }}>
                    <ListItemText primary="Настройки цвета" />
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
       </MotionPopover>
        <ColorSettingsDialog open={openColorDialog} onClose={() => setOpenColorDialog(false)} />
        </>
    );
};