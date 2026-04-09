import { Paper, Divider } from '@mui/material';

import { useState } from 'react';
import ShareProjectDialog from './dialogs/ShareProjectDialog';
import * as React from 'react';

import { Box } from '@mui/material';
import { type FileItem } from '../../types/auth';
import { useApplication } from '../context/ApplicationContext';
import $api from '../../api/axios';
import HistorySection from './sections/HistorySection';
import NavigationSection from './sections/NavigationSection';
import TagsSection from './sections/TagsSection';
import LinksSection from './sections/LinksSection';
import OutLinksSection from './sections/OutLinksSection';
import ShareButton from '../ShareButton';

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
  const [history, setHistory] = useState<any[]>([]);
  const { projectData, userData } = useApplication(); 
  const [openShareDialog, setOpenShareDialog] = useState(false);

  const loadHistory = async () => {
      if (!userData || userData.email === 'Без регистрации') {
         setHistory([]);  
         return;
      }
      const data = await $api.get(`/files/${activeFileId}/history`);
      setHistory(data.data);
  };

  React.useImperativeHandle(ref, () => ({
          refreshHistory: loadHistory
  }));

  React.useEffect(() => {
    if (activeFileId) loadHistory();
    else setHistory([]);
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

      <HistorySection handleRestore={handleRestore} history={history} />
      <Divider sx={{ opacity: 0.1 }} />
      <NavigationSection content={content} />
      <Divider sx={{ opacity: 0.1 }} />
      <TagsSection tags={tags} />
      <Divider sx={{ opacity: 0.1 }} />
      <LinksSection links={links} allFiles={allFiles} onFileSelect={onFileSelect} />
      <Divider sx={{ opacity: 0.1 }} />
      <OutLinksSection content={content} />
      </Paper>
      <ShareButton setOpenShareDialog={setOpenShareDialog} />

      <ShareProjectDialog 
        open={openShareDialog} 
        onClose={() => setOpenShareDialog(false)} 
        projectData={projectData}
      />
    </Box>
  );
});

export default RightSidebar