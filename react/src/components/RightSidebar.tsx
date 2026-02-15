import {
  Paper,
  List,
  Typography,
  Divider,
} from '@mui/material';

import * as React from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


// import DashboardIcon from '@mui/icons-material/Dashboard';
// import AnalyticsIcon from '@mui/icons-material/Analytics';
// import SettingsIcon from '@mui/icons-material/Settings';

function RightSidebar() {
  // const [selectedIndex, setSelectedIndex] = useState(0);

const [alignment, setAlignment] = React.useState<string | null>('left');

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  // const menuItems = [
    // { text: 'Проект 1', icon: <DashboardIcon /> },
    // { text: 'Проект 2', icon: <AnalyticsIcon /> },
    // { text: 'Проект 3', icon: <SettingsIcon /> },
  // ];

  return (
    <Paper
      elevation={1}
      sx={{
        width: 220, 
        minWidth: 210,
        m: 1,        
        ml: 0,       
        borderRadius: 3,       
        height: 'calc(100vh - 16px)', 
        
        bgcolor: 'rgb(8, 8, 8)',
        overflow: 'hidden',     
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1,
      }}
    >

      <ToggleButtonGroup
      sx={{m: 2}}
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label="text alignment"
    >
      <ToggleButton value="left" aria-label="left aligned">
        <FormatAlignLeftIcon />
      </ToggleButton>
      <ToggleButton value="center" aria-label="centered">
        <FormatAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="right" aria-label="right aligned">
        <FormatAlignRightIcon />
      </ToggleButton>
      <ToggleButton value="justify" aria-label="justified" disabled>
        <FormatAlignJustifyIcon />
      </ToggleButton>
    </ToggleButtonGroup>

      <Divider variant="fullWidth" />

      <Typography variant='h6' sx={{m: 2, fontWeight: 'bold'}}>Заголовки</Typography>
      <List>
        <Typography sx={{m: 2, mt: 0}}>1. Заголовок 1</Typography>
        <Typography sx={{m: 2, mt: 0}}>2. Заголовок 2</Typography>
        <Typography sx={{m: 2, mt: 0}}>3. Заголовок 3</Typography>
      </List>

       <Divider variant="fullWidth" />

       <Typography variant='h6' sx={{m: 2, fontWeight: 'bold'}}>Теги</Typography>
      <List>
        <Typography sx={{m: 2, mt: 0}}>1. Тег 1</Typography>
        <Typography sx={{m: 2, mt: 0}}>2. Тег 2</Typography>
      </List>
    </Paper>
  );
}

export default RightSidebar