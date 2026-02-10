import { useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Button
} from '@mui/material';

import * as React from 'react';

import Box from '@mui/material/Box';
import { IconButton, Tooltip } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Create } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import { Snackbar, Alert } from '@mui/material';
import Slide from '@mui/material/Slide';
import type {SlideProps} from '@mui/material/Slide';

import ToggleButton from '@mui/material/ToggleButton';

interface TopPanelProps {
    selected: boolean;
    onToggle: () => void;
    fileName: string;
    onSave: () => Promise<boolean>; 
}


function TopPanel({ selected, onToggle, fileName, onSave}: TopPanelProps) {

  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave();
    if (success) {
        setOpenSnackbar(true);
    }
    setIsSaving(false);
  };

  function SlideTransition(props: SlideProps) {
    return <Slide {...props} 
      timeout={{ 
        enter: 500,
        exit: 400   
      }} 
      easing={{
        enter: 'cubic-bezier(0, 0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      }} 
      direction="left" />;
  }

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <>
    <Paper
      elevation={1}
      sx={{
        position: 'absolute', 
        top: 0,
        left: 0,
        right: 0,
        width: 'calc(100% - 32px)', 
        m: 1,
        ml: 1.5,             
        p: 2,     
        zIndex: '100',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 6, 
        bgcolor: '#141414b5',    
        backdropFilter: "blur(5px) !important",  
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60px',
        boxSizing: 'border-box'
        
      }}
    ><Typography variant='h6' sx={{textAlign: 'center', fontWeight: 'bold'}}>{fileName}</Typography>
     <Tooltip title={`Сменить режим на ${selected ? 'редактирование' : 'чтение'}`}>
        <ToggleButton
        value="check"
        selected={selected}
        onChange={onToggle}
        sx={{
            position: 'absolute',
            right: 16,         
            
            borderRadius: '50%', 
            
            width: 40,        
            height: 40,
            border: 'none',      
            
            '&.Mui-selected': {

                color: 'white',
                '&:hover': {
                   
                }
            },
            color: 'text.secondary' 
        }}
    >
        {selected ? <VisibilityIcon /> : <CreateIcon />} 
    </ToggleButton>
    </Tooltip>
    <Tooltip title="Сохранить">
      <IconButton
          onClick={handleSave}
          disabled={isSaving}
          sx={{
              position: 'absolute',
              right: 64,
              
              borderRadius: '50%', 
              
              width: 40,        
              height: 40,
              p: 0,
              m: 0,
              border: 'none',      
              
              color: 'text.secondary' 
          }}
      >
          <SaveIcon /> 
      </IconButton>
    </Tooltip>
    </Paper>
    <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000}
        slots={{ transition: SlideTransition }}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        key={SlideTransition.name}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', color: "white", borderRadius: '12px' }}
        >
          Файл сохранен!
        </Alert>
      </Snackbar>

    </>
  )
}

export default TopPanel
