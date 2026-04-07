import {
  Paper,
  IconButton, Tooltip,
  Divider,
} from '@mui/material';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import { useApplication } from '../context/ApplicationContext';
import { ApplicationTheme, PerformanceMode } from '../../types/auth';

export type MarkdownCommand = 'H' | 'bold' | 'italic' | 'code' | 'quote' | 'ul' | 'ol' | 'link' | 'image' | 'todo' | 'table';

interface ToolsPanelProps {
    onCommand: (command: MarkdownCommand) => void;
}

function ToolsPanel({ onCommand }: ToolsPanelProps) {

    const { mode, currentTheme } = useApplication();

  const buttonStyle = {
        color: currentTheme === ApplicationTheme.Dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        transition: 'all 0.2s ease-in-out',
        borderRadius: "15px",
        ml: 0.5,
        mr: 0.5,
        '&:hover': {
            color: currentTheme === ApplicationTheme.Dark ? '#fff' : '#000',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            scale: 1.1,
        }
    };

    const tooltipProps = {
        placement: "top" as const, 
        arrow: true,              
        enterDelay: 200,          
        slotProps: {
            popper: {
                disablePortal: true, 
                modifiers: [
                {
                    name: 'offset',
                    options: {
                    offset: [0, 8], 
                    },
                },
                ],
            },
            tooltip: {
            sx: {
                bgcolor: currentTheme === ApplicationTheme.Dark ? (mode === PerformanceMode.Off ? 'rgba(20, 20, 20, 0.9)' : 'rgba(20, 20, 20)') : (mode === PerformanceMode.Off ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255)'),
                backdropFilter: mode === PerformanceMode.Off ? 'blur(4px)' : undefined,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color:  currentTheme === ApplicationTheme.Dark ? 'white' : 'black',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px'
            },
            },
            arrow: {
            sx: {
                color:  currentTheme === ApplicationTheme.Dark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
            },
            },
        }
    };
    
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Paper
        elevation={1}
        variant='blur'
        sx={{
            
            width: 'auto',
            maxWidth: '800px', 
            m: 1,    
            mb: 2,       
            p: 2,    
            zIndex: '100',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '55px',
            boxSizing: 'border-box',
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            
        }}
        >
        <Tooltip title="Заголовок" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('H')}>
                <AlignHorizontalLeftIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Жирный" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('bold')}>
                <FormatBoldIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Курсив" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('italic')}>
                <FormatItalicIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Код" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('code')}>
                <CodeIcon />
            </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

        <Tooltip title="Маркированный список" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('ul')}>
                <FormatListBulletedIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Нумерованный список" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('ol')}>
                <FormatListNumberedIcon />
            </IconButton>
        </Tooltip>
        
        <Tooltip title="Чек-лист" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('todo')}>
                <CheckBoxIcon />
            </IconButton>
        </Tooltip>

         <Tooltip title="Таблица" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('table')}>
                <BackupTableIcon />
            </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

        <Tooltip title="Цитата" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('quote')}>
                <FormatQuoteIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Ссылка" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('link')}>
                <LinkIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Изображение" {...tooltipProps}>
            <IconButton sx={buttonStyle} onClick={() => onCommand('image')}>
                <ImageIcon />
            </IconButton>
        </Tooltip>
        </Paper>
    </div>
  )
}

export default ToolsPanel
