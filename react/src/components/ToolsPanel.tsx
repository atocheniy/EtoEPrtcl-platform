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

export type MarkdownCommand = 'bold' | 'italic' | 'code' | 'quote' | 'ul' | 'ol' | 'link' | 'image' | 'todo';

interface ToolsPanelProps {
    onCommand: (command: MarkdownCommand) => void;
}

function ToolsPanel({ onCommand }: ToolsPanelProps) {
  const buttonStyle = {
        color: 'rgba(255, 255, 255, 0.7)',
        transition: 'all 0.2s ease-in-out',
        borderRadius: "15px",
        ml: 0.5,
        mr: 0.5,
        '&:hover': {
            color: '#fff',
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
                bgcolor: 'rgba(20, 20, 20, 0.9)', 
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px'
            },
            },
            arrow: {
            sx: {
                color: 'rgba(20, 20, 20, 0.9)', 
            },
            },
        }
    };
    
  return (
    <>
        <Paper
        elevation={1}
        sx={{
            
            width: 'auto',
            maxWidth: '800px', 
            m: 1,    
            mb: 2,       
            p: 2,    
            zIndex: '100',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6, 
            bgcolor: '#141414b5',    
            backdropFilter: "blur(5px) saturate(150%) !important",  
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px',
            boxSizing: 'border-box',
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            
        }}
        >
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
    </>
  )
}

export default ToolsPanel
