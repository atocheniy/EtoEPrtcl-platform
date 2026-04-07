import {useMemo, useRef, useState} from'react';
import {List ,Button, Typography} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import TextField from '@mui/material/TextField';
import CreateIcon from '@mui/icons-material/Create';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import { AnimatePresence } from 'framer-motion';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {whiteSolidButton, whiteOutlinedButton} from '../css/sx.tsx'
import { useApplication } from '../context/ApplicationContext.tsx';
import { SidebarWrapper } from '../layout/SidebarWrapper.tsx';
import { type FileItem } from '../../types/auth.ts';

import MenuItem from '@mui/material/MenuItem';

import FolderIcon from '@mui/icons-material/Folder';
import { FileTreeItem } from '../layout/FileTreeItem.tsx';
import { MotionMenu } from '../motion/MotionMenu.tsx';
import CreateElementDialog from './dialogs/CreateElementDialog.tsx';
import RenameDialog from './dialogs/RenameDialog.tsx';
import ElementContextMenu from './menu/ElementContextMenu.tsx';
import { useFileUpload } from '../../hooks/useFileUpload.ts';

const buildFileTree = (items: FileItem[]) => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    items.forEach(item => {
        map.set(item.id, { ...item, children: [] });
    });

    items.forEach(item => {
        const node = map.get(item.id);
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });

    const sortNodes = (nodes: any[]) => {
        nodes.sort((a, b) => (b.isFolder ? 1 : 0) - (a.isFolder ? 1 : 0));
        nodes.forEach(node => {
            if (node.children.length > 0) sortNodes(node.children);
        });
        return nodes;
    };

    return sortNodes(roots);
};

interface LeftSidebarFilesProps {
  projectId: string | null;
  onBack: () => void;
  onFileSelect: (fileId: string) => void; 
  projectIdSelected: string | null;
  isProjectSettinsOpen: boolean;
  setIsProjectSettinsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeFile: () => void;
  onRenameSuccess: (newName: string) => void;
}

function LeftSidebarFiles({ projectId, onBack, onFileSelect, projectIdSelected, isProjectSettinsOpen, setIsProjectSettinsOpen, closeFile, onRenameSuccess }: LeftSidebarFilesProps) {
  const { FileUpload } = useFileUpload(); 
  const {projectData, projectFiles } = useApplication();
  const [openDialog, setOpenDialog] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");
  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { orbColors } = useApplication();
  const { currentProjectKey, clearCurrentProjectId } = useApplication();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleOpenCreateMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      setCreateAnchorEl(event.currentTarget);
  };

  const handleCloseCreateMenu = () => {
      setCreateAnchorEl(null);
  };

  const toggleFolder = (id: string) => {
      setExpanded(prev => 
          prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
      );
  };

  const handleOpenGlobalCreate = (asFolder: boolean) => {
    setCreateParentId(null); 
    setIsCreatingFolder(asFolder);
    setOpenDialog(true);
  };

  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
      event.stopPropagation(); 
      setFileMenuAnchorEl(event.currentTarget);
      setMenuFile(file);
  };

  const handleFileMenuClose = () => {
      setFileMenuAnchorEl(null);
  };

  const handleOpenRename = () => {
      if (menuFile) {
          setNewFileName(menuFile.name);
          setOpenRenameDialog(true);
      }
      handleFileMenuClose();
  };

  const getIcon = (ext: string) => {
      if (ext === '.md') return <DescriptionIcon />;
      if (['.png', '.jpg', '.jpeg'].includes(ext)) return <ImageIcon />;
      return <InsertDriveFileIcon />;
  };

  const changeSearchField = (event: any) => { setSearchField(event.target.value); }
  
  const filteredFiles = useMemo(() => {
      const filtered = projectFiles.filter((file) =>
          file.name.toLowerCase().includes(searchField.toLowerCase())
      );

      return [...filtered].sort((a, b) => {
        if (a.isFolder === b.isFolder) return 0;
        return a.isFolder ? -1 : 1;
      });
  }, [projectFiles, searchField]);

  const fileTree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarWrapper
      projectIdSelected={projectIdSelected}
      isProjectSettinsOpen={isProjectSettinsOpen} setIsProjectSettinsOpen={setIsProjectSettinsOpen} closeFile={closeFile}
        title={projectId === projectData.id ? projectData.name : "Загрузка..."}
        variant='solid'
        highAction={
                <Button 
            variant="contained"      
            startIcon={<ArrowBackIcon />} 
            onClick={() => 
            { 
              closeFile(); 
              clearCurrentProjectId();
              onBack(); 
            }}
              sx={{ 
                  ...whiteSolidButton,
                  m: 1,
                  ml: 2,
                  mr: 2,
                  p: 1,
              }}
              > Назад
        </Button>
        }
      topAction={
          <TextField onChange={changeSearchField} value={searchField} id="outlined-basic" label="Поиск..." variant="outlined" />
      }
      children={
          <List sx={{ px: 2, mt: 1 }}>
          <AnimatePresence mode="popLayout">
          {searchField ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {fileTree.map((item, index) => (
              <FileTreeItem 
                  key={item.id}
                  item={item}
                  index={index}
                  level={0}
                  selectedId={selectedId}
                  onFileSelect={(id: string) => { setSelectedId(id); onFileSelect(id); }}
                  expanded={expanded}
                  onToggle={toggleFolder}
                  onMenuOpen={handleFileMenuOpen}
                  getIcon={getIcon}
                  masterKey={currentProjectKey}
                  orbColors={orbColors}
              />
          ))}
          {filteredFiles.length === 0 && searchField && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block', mt: 2 }}>
              Ничего не найдено
            </Typography>
          )}
          </div>) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {fileTree.map((item, index) => (
              <FileTreeItem 
                  key={item.id}
                  item={item}
                  index={index}
                  level={0}
                  selectedId={selectedId}
                  onFileSelect={(id: string) => { setSelectedId(id); onFileSelect(id); }}
                  expanded={expanded}
                  onToggle={toggleFolder}
                  onMenuOpen={handleFileMenuOpen}
                  getIcon={getIcon}
                  masterKey={currentProjectKey}
                  orbColors={orbColors}
              />
          ))}
          {filteredFiles.length === 0 && searchField && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block', mt: 2 }}>
              Ничего не найдено
            </Typography>
          )}
          </div>
          )}
          </AnimatePresence>
        </List>
      }
      bottomAction={
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Button
            variant="contained" 
            fullWidth           
            startIcon={<CreateIcon />} 
            onClick={handleOpenCreateMenu}
            sx={{...whiteSolidButton, p:1.5}}
          >
            Создать элемент
          </Button>
          <MotionMenu
    anchorEl={createAnchorEl}
    open={Boolean(createAnchorEl)}
    onClose={handleCloseCreateMenu}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    sx={{ minWidth: '200px', mb: 1.5 }}
  >
              <MenuItem onClick={() => { handleOpenGlobalCreate(false); handleCloseCreateMenu(); }} sx={{ gap: 1.5, py: 1, mx: 0.5, borderRadius: '10px', }}>
                  <DescriptionIcon fontSize="small" sx={{ opacity: 0.7 }} />
                  <Typography variant="body2">Файл</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleOpenGlobalCreate(true); handleCloseCreateMenu(); }} sx={{ gap: 1.5, py: 1, mt:0.5, mx: 0.5, borderRadius: '10px', }}>
                  <FolderIcon fontSize="small" sx={{ opacity: 0.7 }} />
                  <Typography variant="body2">Папка</Typography>
              </MenuItem>
          </MotionMenu>
          </div>
      }
      secondBottomAction={
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Button
              fullWidth           
              startIcon={<CloudDownloadIcon />} 
              onClick={() => fileInputRef.current?.click()}
              sx={{...whiteOutlinedButton, p:1.5}}
              variant="outlined"
            >
              Загрузить файл
            </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={FileUpload}
                accept=".md,.txt,.js,.ts,image/*"
            />
          </div>
        }
        files={projectFiles}
        onFileSelect={onFileSelect}
        setSelectedId={setSelectedId}
        >
      </SidebarWrapper>

      <CreateElementDialog openDialog={openDialog} setOpenDialog={setOpenDialog} isCreatingFolder={isCreatingFolder} createParentId={createParentId} onFileSelect={onFileSelect} setExpanded={setExpanded} setCreateParentId={setCreateParentId} />
      <ElementContextMenu menuFile={menuFile} selectedId={selectedId} closeFile={closeFile} setMenuFile={setMenuFile} handleFileMenuClose={handleFileMenuClose} fileMenuAnchorEl={fileMenuAnchorEl} handleOpenRename={handleOpenRename} setCreateParentId={setCreateParentId} setIsCreatingFolder={setIsCreatingFolder} setOpenDialog={setOpenDialog} />
      <RenameDialog openRenameDialog={openRenameDialog} newFileName={newFileName} menuFile={menuFile} setOpenRenameDialog={setOpenRenameDialog} setNewFileName={setNewFileName} setMenuFile={setMenuFile} onRenameSuccess={onRenameSuccess} selectedId={selectedId} />
    </div>
  );
}

export default LeftSidebarFiles;