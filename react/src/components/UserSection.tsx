import { useState} from 'react';
import type {MouseEvent } from 'react';
import { Box, Avatar, Typography, List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEncryption } from './context/EncryptionContext';
import { ColorSettingsDialog } from './ui/ColorSettingsDialog';
import { ApplicationTheme } from '../types/auth';
import { MotionMenu } from './ui/MotionMenu';

export const UserSection = () => {

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const { userData, logout, currentTheme } = useEncryption(); 
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

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: currentTheme === ApplicationTheme.Dark ? '#ffffff' : '#383838', }}
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

         <MotionMenu
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
            
            <List disablePadding>
                <ListItemButton onClick={() => {handleClose(); navigate('/user_profile')}} sx={{
                mx: 1,
                my: 0.5,
                borderRadius: '12px',
                transition: 'background-color 0.15s ease',

                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                },
            }}>
                    <ListItemText primary="Профиль" />
                </ListItemButton >
                <ListItemButton onClick={() => {handleClose(); setOpenColorDialog(true)}} sx={{
                mx: 1,
                my: 0.5,
                borderRadius: '12px',
                transition: 'background-color 0.15s ease',

                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                },
            }}>
                    <ListItemText primary="Настройки сайта" />
                </ListItemButton>
                <ListItemButton sx={{
                mx: 1,
                my: 0.5,
                borderRadius: '12px',
                transition: 'background-color 0.15s ease',

                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                },
            }}>
                
                    <ListItemText primary="Выйти" onClick={() => {handleClose(); handleLogout(); navigate('/login')}} />
                </ListItemButton>
            </List>
       </MotionMenu>
        <ColorSettingsDialog open={openColorDialog} onClose={() => setOpenColorDialog(false)} />
        </div>
    );
};