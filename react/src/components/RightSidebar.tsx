import {
  Paper,
  List,
  Typography,
  Divider,
  Stack,
  Button
} from '@mui/material';

import { useState, useMemo } from 'react';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ShareProjectDialog from './ShareProjectDialog';
import * as React from 'react';
import TagIcon from '@mui/icons-material/Tag';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import LanguageIcon from '@mui/icons-material/Language'; 
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import HistoryIcon from '@mui/icons-material/History';

import {
  ListItemButton,
  ListItemText,
  Box,
} from '@mui/material';
import { ApplicationTheme, type FileItem } from '../types/auth';
import { useEncryption } from './context/EncryptionContext';
import { AnimatePresence, motion } from 'framer-motion';
import $api from '../api/axios';

interface RightSidebarProps {
  content: string;
  tags: string[];       
  links: string[];       
  allFiles: FileItem[];  
  onFileSelect: (id: string) => void;
  activeFileId?: string | null;
  handleRestore: (rev: any) => void;
}

export interface RightSidebarHandle {
    refreshHistory: () => Promise<void>;
}

const  RightSidebar = React.forwardRef<RightSidebarHandle, RightSidebarProps>((props, ref) => {
    const { content, tags, links, allFiles, onFileSelect, activeFileId, handleRestore } = props;
  // const [selectedIndex, setSelectedIndex] = useState(0);

const { currentTheme } = useEncryption();
const [history, setHistory] = useState<any[]>([]);

const loadHistory = async () => {
    const data = await $api.get(`/files/${activeFileId}/history`);
    setHistory(data.data);
};

React.useImperativeHandle(ref, () => ({
        refreshHistory: loadHistory
}));

const { currentProjectId, projectData } = useEncryption();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') 
      .replace(/[^\wа-яА-ЯёЁ0-9-]/g, '');
  };

  const headings = useMemo(() => {
    if (!content) return [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));
    
    return matches.map(m => ({
      level: m[1].length,
      text: m[2],
      id: generateSlug(m[2])
    }));
  }, [content]);

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    const container = document.getElementsByClassName('content-scroll-container')[0];

    if (target && container) {
        const containerTop = container.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        
        const scrollTarget = container.scrollTop + (targetTop - containerTop) - 90;

        container.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }
};

  const externalLinks = useMemo(() => {
    if (!content) return [];
    const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    return Array.from(content.matchAll(mdLinkRegex)).map(m => ({
      text: m[1],
      url: m[2]
    }));
  }, [content]);

  const [openShareDialog, setOpenShareDialog] = useState(false);

  React.useEffect(() => {
    if (activeFileId) {
        loadHistory();
    } else {
        setHistory([]);
    }
}, [activeFileId]);

  return (
     <Box sx={{ 
        width: 220, 
        minWidth: 210, 
        height: 'calc(100vh - 16px)', 
        m: 1, 
        ml: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1
    }}>
    <Paper
      elevation={1}
      variant='solid'
      sx={{
        flex: 1,  
        borderRadius: 3,       
        height: 'calc(100vh - 16px)', 
        
        transition: 'background-color 0.3s ease',
        overflow: 'hidden',     
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
      }}
    >

    <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HistoryIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                История версий
            </Typography>
        </Stack>

        <Box sx={{ 
            maxHeight: '180px', 
            overflowY: 'auto', 
            pr: 0.5,
            '&::-webkit-scrollbar': { width: '3px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
        }}>
          <List disablePadding dense>
            {history.length > 0 ? history.map((rev) => (
              <ListItemButton 
                key={rev.id} 
                onClick={() => handleRestore(rev)}
                sx={{ 
                    py: 0.5,
                    px: 1, 
                    borderRadius: 1.5,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <ListItemText 
                  primary={new Date(rev.createdAt).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} 
                  secondary={rev.userEmail}
                  primaryTypographyProps={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 500 
                  }}
                  secondaryTypographyProps={{ 
                      fontSize: '0.62rem', 
                      noWrap: true 
                  }}
                />
              </ListItemButton>
            )) : (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.3, fontSize: '0.7rem', pl: 1 }}>
                  Версии не найдены
              </Typography>
            )}
          </List>
        </Box>
      </Box>
<Divider sx={{ opacity: 0.1 }} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <TitleIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                Навигация
            </Typography>
        </Stack>
        <List disablePadding>
          {headings.length > 0 ? headings.map((h, i) => (
            <ListItemButton 
              key={i} 
              onClick={() => scrollToHeading(h.id)}
              sx={{ 
                py: 0.3, 
                px: 1, 
                borderRadius: 2,
                pl: h.level > 1 ? (h.level * 1) : 1 
              }}
            >
              <ListItemText 
                primary={`${i + 1}. ${h.text}`} 
                primaryTypographyProps={{ 
                    fontSize: '0.8rem', 
                    noWrap: true, 
                    fontWeight: h.level === 1 ? 700 : 400 
                }} 
              />
            </ListItemButton>
          )) : (
            <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет заголовков</Typography>
          )}
        </List>
      </Box>

      <Divider sx={{ opacity: 0.1 }} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <TagIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                Теги
            </Typography>
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 1 }}>
          {tags.length > 0 ? tags.map((tag, i) => (
            <Typography 
                key={i} 
                sx={{ 
                    fontSize: '0.75rem', 
                    color: '#818cf8', 
                    bgcolor: 'rgba(129, 140, 248, 0.1)', 
                    px: 1, py: 0.2, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.2)' }
                }}
            >
              #{tag}
            </Typography>
          )) : (
            <Typography variant="caption" sx={{ opacity: 0.3 }}>Нет тегов</Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ opacity: 0.1 }} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <LinkIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                Ссылки
            </Typography>
        </Stack>
        <List disablePadding>
          {links.length > 0 ? links.map(linkId => {
            const targetFile = allFiles.find(f => f.id === linkId);
            return (
              <ListItemButton 
                key={linkId} 
                onClick={() => onFileSelect(linkId)}
                sx={{ py: 0.2, px: 1, borderRadius: 2 }}
              >
                <ListItemText 
                  primary={targetFile?.name || "Загрузка..."} 
                  primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, color: '#4ade80' }} 
                />
              </ListItemButton>
            );
          }) : (
            <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет ссылок</Typography>
          )}
        </List>
      </Box>

      <Divider sx={{ opacity: 0.1 }} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <LanguageIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>
                Внешние ресурсы
            </Typography>
        </Stack>
        <List disablePadding>
          {externalLinks.length > 0 ? externalLinks.map((link, i) => (
            <ListItemButton 
                key={i} 
                component="a" 
                href={link.url} 
                target="_blank" 
                sx={{ py: 0.2, px: 1, borderRadius: 2 }}
            >
              <ListItemText 
                primary={link.text} 
                primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, color: '#60a5fa' }} 
                secondary={link.url}
              />
              <OpenInNewIcon sx={{ fontSize: 12, opacity: 0.5, ml: 1, color: '#60a5fa' }} />
            </ListItemButton>
          )) : (
            <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет ссылок</Typography>
          )}
        </List>
      </Box>
      </Paper>

<AnimatePresence>
      {currentProjectId && projectData.id !== "123" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgb(8, 8, 8)' : 'rgb(245, 245, 245)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<GroupAddIcon />}
          onClick={() => setOpenShareDialog(true)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            color: currentTheme === ApplicationTheme.Dark ? '#ffffff' : '#000000',
            borderRadius: '10px',
            py: 1,
            textTransform: 'none',
            fontWeight: 800,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: '0.2s',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderColor: '#ffffff'
            }
          }}
        >
          Поделиться
        </Button>
      </Paper>
       </motion.div>
      )}
    </AnimatePresence>
      

      <ShareProjectDialog 
        open={openShareDialog} 
        onClose={() => setOpenShareDialog(false)} 
        projectData={projectData}
      />


    
    </Box>
  );
});

export default RightSidebar