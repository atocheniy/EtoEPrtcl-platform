import {
  Paper,
  Typography,
} from '@mui/material';

import * as React from 'react';

import Box from '@mui/material/Box';
import { IconButton, Tooltip } from '@mui/material';

import CreateIcon from '@mui/icons-material/Create';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';

import ToggleButton from '@mui/material/ToggleButton';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

interface TopPanelProps {
    selected: boolean;
    onToggle: () => void;
    fileName: string;
    onSave: () => Promise<boolean>; 
    isLeftOpen: boolean;
    onLeftToggle: () => void;
    isRightOpen: boolean;   
    onRightToggle: () => void;
    activeFileId: string | null;
    closeFile: () => void;
}


function TopPanel({ selected, onToggle, fileName, onSave, isLeftOpen, onLeftToggle, isRightOpen, onRightToggle, activeFileId, closeFile}: TopPanelProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { showSuccess } = useNotification();

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave();
    if (success) {
        showSuccess("Файл успешно сохранен!");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
    <Paper
      elevation={1}
      variant='blur'
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
  
      
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50px',
        boxSizing: 'border-box',
        boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
    >
      <Box sx={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center' }}>
          <Tooltip title={isLeftOpen ? "Скрыть меню" : "Показать меню"}>
            <IconButton onClick={onLeftToggle} sx={{ color: 'text.secondary' }}>
               <MenuIcon />
            </IconButton>
          </Tooltip>
       </Box>
       <Box sx={{ 
    display: 'flex', 
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 1, 
    px: 1.5, 
    py: 0.5,
    borderRadius: '10px',
    transition: '0.2s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
    '& .close-button': { opacity: 0, transition: '0.2s' },
    '&:hover .close-button': { opacity: 1 } ,
    maxWidth: '70%'
}}>
      <AnimatePresence mode="wait">
                    <motion.div
                        key={fileName}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Typography variant="h6" sx={{textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 'bold'}}>
                            {fileName}
                        </Typography>
                    </motion.div>
                </AnimatePresence>
      {activeFileId ? 
       (<Tooltip title={"Закрыть файл"}>
            <IconButton className="close-button" onClick={closeFile} size="small"
            sx={{ 
                mt: 0.1,
                color: '#ffffff',
                bgcolor: 'rgba(0, 0, 0, 0.1)' ,
                transition: 'color 0.3s',
            }}>
               <CloseIcon sx={{ fontSize: 16 }}></CloseIcon>
            </IconButton>
          </Tooltip>) : (<div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}></div>)
      }
          </Box>
     <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
      
      {activeFileId ? (
      <Tooltip title="Сохранить">
      <IconButton
          onClick={handleSave}
          disabled={isSaving}
          sx={{ color: 'text.secondary' }}
      >
          <SaveIcon /> 
      </IconButton>
    </Tooltip>
    ) : (<div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}></div>)}
    {activeFileId ? (
     <Tooltip title={`Сменить режим на ${selected ? 'редактирование' : 'чтение'}`}>
        <ToggleButton
        value="check"
        selected={selected}
        onChange={onToggle}
        sx={{
          borderRadius: '50%',
          width: 38,
          height: 38,
          border: 'none',
          color: 'text.secondary',
          '&.Mui-selected': { color: 'white' }
        }}
    >
        {selected ? <VisibilityIcon /> : <CreateIcon />} 
    </ToggleButton>
    </Tooltip>
      ) : (<div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}></div>)}

    <Tooltip title={isRightOpen ? "Скрыть панель" : "Показать панель"}>
            <IconButton 
              onClick={onRightToggle}
              sx={{
                color: 'text.secondary',
                transform: isRightOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: '0.3s'
              }}
            >
              <MenuOpenIcon />
            </IconButton>
         </Tooltip>
         </Box>
    </Paper>
    </div>
  )
}

export default TopPanel
