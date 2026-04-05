import {useMemo, useRef, useState} from'react';
import {List ,Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, Divider, Stack} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import TextField from '@mui/material/TextField';
import CreateIcon from '@mui/icons-material/Create';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import { AnimatePresence } from 'framer-motion';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {whiteSolidButton, whiteOutlinedButton} from './css/sx.tsx'
import { $api } from '../api/axios';
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from './context/EncryptionContext.tsx';
import { SidebarWrapper } from './SidebarWrapper.tsx';
import { ApplicationTheme, type FileItem } from '../types/auth.ts';

import CreateNewFolderIcon from '@mui/icons-material/ArrowDownward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileService } from '../services/fileService.ts';

import FolderIcon from '@mui/icons-material/Folder';
import { FileTreeItem } from './FileTreeItem.tsx';
import { MotionMenu } from './ui/MotionMenu.tsx';
import { MotionDialog } from './ui/MotionDialog.tsx';
import { MotionTextField } from './ui/MotionTextField.tsx';

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

  const { masterKey, projectData, projectFiles, setProjectFiles } = useEncryption();
  // const [files, setFiles] = useState<FileItem[]>([]);
  // const [projectName, setProjectName] = useState<string>('Загрузка...'); 
  const [openDialog, setOpenDialog] = useState(false);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);

  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { orbColors } = useEncryption();
  const { currentTheme } = useEncryption();
  const { currentProjectKey, clearCurrentProjectId } = useEncryption();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenCreateMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      setCreateAnchorEl(event.currentTarget);
  };

  const handleCloseCreateMenu = () => {
      setCreateAnchorEl(null);
  };

  const [expanded, setExpanded] = useState<string[]>([]);

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

  const handleCloseRename = () => {
      setOpenRenameDialog(false);
      setNewFileName("");
      setMenuFile(null);
  };

  const handleRenameSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!menuFile || !newFileName.trim() || !masterKey || !currentProjectKey) return;

    try {
        const currentIvBuffer = DCrypto.base64ToBuffer(menuFile.iv);

        const encrypted = await DCrypto.encrypt(newFileName, currentProjectKey, currentIvBuffer);

        await FileService.updateFileMetadata(
          menuFile.id, 
          encrypted.content, 
          menuFile.extension, 
          menuFile.iv
        );

        if (menuFile.id === selectedId) onRenameSuccess(newFileName);

        setProjectFiles(prev => prev.map(f => 
          f.id === menuFile.id ? { ...f, name: newFileName } : f
        ));

        handleCloseRename();
    } catch (error) {
        console.error("Ошибка при переименовании файла:", error);
    }
};

  const handleDeleteFile = async () => {
    if (!menuFile) return;
    if (window.confirm(`Удалить файл ${menuFile.name}?`)) {
        try {
            await FileService.deleteFile(menuFile.id)
            setProjectFiles(prev => prev.filter(f => f.id !== menuFile.id));
            if (menuFile.id === selectedId) closeFile();

            setMenuFile(null);
            handleFileMenuClose();
        } catch (e) {
            console.error("Ошибка при удалении", e);
        }
    }
};

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId || !masterKey || !currentProjectKey) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const rawText = e.target?.result as string;
            
            const sharedIv = window.crypto.getRandomValues(new Uint8Array(12));

            const encryptedContent = await DCrypto.encrypt(rawText, currentProjectKey, sharedIv);
            const encryptedName = await DCrypto.encrypt(file.name, currentProjectKey, sharedIv);

            const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : (isImage ? '.png' : '.md');

            const response = await $api.post('/files', {
                name: encryptedName.content,
                content: encryptedContent.content,
                iv: encryptedName.iv, 
                extension: extension,
                projectId: projectId
            });

            const newFile = { ...response.data, name: file.name };
            setProjectFiles(prev => [...prev, newFile]);
            
            console.log("Файл успешно загружен с общим IV");
            event.target.value = ''; 
        } catch (err) {
            console.error("Ошибка при загрузке/шифровании:", err);
        }
    };
    if (isImage) {
        reader.readAsDataURL(file); 
    } else {
        reader.readAsText(file);  
    }
};
  
  const handleCloseDialog = () => {setOpenDialog(false);};
  const handleCloseFolderDialog = () => {setOpenFolderDialog(false);};

  const getIcon = (ext: string) => {
      if (ext === '.md') return <DescriptionIcon />;
      if (['.png', '.jpg', '.jpeg'].includes(ext)) return <ImageIcon />;
      return <InsertDriveFileIcon />;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fileName = formData.get('fileName') as string;

        if (!fileName || !projectId || !masterKey || !currentProjectKey) return;

        try {
          const encrypted = await DCrypto.encrypt(fileName, currentProjectKey);
          const encryptedContent = await DCrypto.encrypt("", currentProjectKey, DCrypto.base64ToBuffer(encrypted.iv));
          const response = await $api.post('/files', {
            name: encrypted.content,
            content: encryptedContent.content,
            iv: encrypted.iv,
            projectId: projectId,
            parentId: createParentId,
            isFolder: isCreatingFolder,
          });
        
          const serverData = response.data;

          const newItem: FileItem = { 
            id: serverData.id || serverData.Id, 
            name: fileName, 
            iv: serverData.iv || serverData.Iv,
            extension: serverData.extension || serverData.Extension || (isCreatingFolder ? "" : ".md"),
            parentId: createParentId,
            isFolder: isCreatingFolder,
          };

          setProjectFiles(prev => [...prev, newItem]);

          if (createParentId) {
            setExpanded(prev => prev.includes(createParentId) ? prev : [...prev, createParentId]);
          }

          if (!isCreatingFolder) onFileSelect(newItem.id); 
          handleCloseDialog();
        } catch (error) {
              console.error("Ошибка при создании файла:", error);
        }
  };

  const handleFolderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const folderName = formData.get('folderName') as string;

        if (!folderName || !projectId || !masterKey || !currentProjectKey) return;

        try {
          const encrypted = await DCrypto.encrypt(folderName, currentProjectKey);
          const encryptedContent = await DCrypto.encrypt("", currentProjectKey, DCrypto.base64ToBuffer(encrypted.iv));
          const response = await $api.post('/files', {
            name: encrypted.content,
            content: encryptedContent.content,
            iv: encrypted.iv,
            projectId: projectId,
            isFolder: true,
          });
        
          const newFolder = { ...response.data, name: folderName };
          setProjectFiles(prev => [...prev, newFolder]);
          handleCloseFolderDialog();
        } catch (error) {
              console.error("Ошибка при создании папки:", error);
        }
  };

  const changeSearchField = (event: any) => {
      setSearchField(event.target.value);
    }
  
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
  /*
  useEffect(() => {
        if (projectId && masterKey) {               
            $api.get<FileItem[]>(`/files/project/${projectId}`)
                .then(async response => {
                    const decryptedFiles = await Promise.all(response.data.map(async f => {
                      try {
                          const name = await DCrypto.decrypt(f.name, f.iv, masterKey);
                          return { ...f, name };
                      } catch { return { ...f, name: "Ошибка расшифровки" }; }
                  }));
                    setFiles(decryptedFiles);
                })
                .catch(err => console.error("Ошибка загрузки файлов:", err));
        } else {
            setFiles([]);
        }
  }, [projectId, masterKey]); 
  */

  const handleDownloadFile = async () => {
    if (!menuFile || !masterKey || !currentProjectKey) return;

    try {
        const response = await $api.get(`/files/${menuFile.id}`);
        const { content, iv } = response.data;

        if (!content) {
            console.warn("Файл пуст");
            return;
        }
        const decryptedContent = await DCrypto.decrypt(content, iv, currentProjectKey);

        const blob = new Blob([decryptedContent], { type: 'text/markdown' });
        
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', menuFile.name);
        document.body.appendChild(link);
        link.click();

        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        handleFileMenuClose();
    } catch (error) {
        console.error("Ошибка при скачивании файла:", error);
    }
  };

  const availableFolders = useMemo(() => {
    return projectFiles.filter(f => f.isFolder);
  }, [projectFiles]);

  return (
    <>
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
           <>
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
        </>) : (
          <>
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
        </>
        )}
        </AnimatePresence>
      </List>
     }
     bottomAction={
       <>
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
        </>
     }
     secondBottomAction={
     <>
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
              onChange={handleFileUpload}
              accept=".md,.txt,.js,.ts,image/*"
          />
        </>
      }
      files={projectFiles}
      onFileSelect={onFileSelect}
      setSelectedId={setSelectedId}
      >
    </SidebarWrapper>

<MotionDialog 
                      open={openDialog} 
                      onClose={handleCloseDialog}
                      maxWidth="sm"
                      fullWidth
                  >  
   
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
    {isCreatingFolder ? <FolderIcon sx={{mb: 0.1, color: orbColors[1].replace(/[\d.]+\)$/g, '1)')}}/> : <DescriptionIcon sx={{mb: 0.1}}/>}
    {isCreatingFolder ? "Новая Папка" : "Новый Файл"}
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>
    Введите название для {isCreatingFolder ? "папки" : "файла"}. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <Stack spacing={3}>
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="fileName"
        label="Название файла"
        type="text"
        fullWidth
       color='secondary'  />
       
       <MotionTextField
          fullWidth
          label="Разместить в..."
          value={createParentId || ""}
          onChange={(val) => setCreateParentId(val || null)}
          color='secondary'
          sx={{'& .MuiOutlinedInput-root': {
            borderRadius: '15px',
            
          }
          }}
       >
          <MenuItem {...({ value: "", label: "Корень проекта" } as any)}  sx={{ gap: 1.5, py: 1, mb: 0.5, mx: 0.5, borderRadius: '10px',  }}>
            <InsertDriveFileIcon fontSize="small" sx={{ opacity: 0.5 }} />
            <Typography variant="body2">Корень проекта (общее пространство)</Typography>
          </MenuItem>
          
          {availableFolders.map((folder) => (
            <MenuItem key={folder.id} {...({ value: folder.id, label: folder.name } as any)} sx={{ gap: 1.5, py: 1, mb: 0.5, mx: 0.5, borderRadius: '10px',  }}>
              <FolderIcon fontSize="small" sx={{ opacity: 0.7, color: orbColors[1] }} />
              <Typography variant="body2">{folder.name}</Typography>
            </MenuItem>
          ))}
        </MotionTextField>
      </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
      onClick={handleCloseDialog}
      variant="outlined"
      sx={{ 
        ...whiteOutlinedButton,
         m: 1,
        px: 3
      }}
    >Отмена
    </Button>
          <Button 
      type="submit" 
      form="subscription-form"
      variant="contained"
      sx={{
    ...whiteSolidButton,
    m: 1,
    px: 3
}}
    >
      Создать
    </Button>
        </DialogActions>
      </MotionDialog>

 <MotionDialog 
                      open={openFolderDialog} 
                      onClose={handleCloseFolderDialog}
                      maxWidth="sm"
                      fullWidth
                  >  
     
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, textAlign: 'center'  }}>
    <FolderIcon sx={{mb: 0.1}}/> Новая Папка
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>
      Введите название для новой папки. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleFolderSubmit} id="subscription-form">
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="folderName"
        label="Название папки"
        type="text"
        fullWidth
        variant="outlined" 
        sx={{'& .MuiInputLabel-root': { color: currentTheme === ApplicationTheme.Dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' },'& .MuiOutlinedInput-root': {borderRadius: '15px','& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },'&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },'&.Mui-focused fieldset': { borderColor: 'white' }, },}}
      />
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
      onClick={handleCloseFolderDialog}
      variant="outlined"
      sx={{ 
        ...whiteOutlinedButton,
         m: 1,
        px: 3
      }}
    >Отмена
    </Button>
          <Button 
      type="submit" 
      form="subscription-form"
      variant="contained"
      sx={{
    ...whiteSolidButton,
    m: 1,
    px: 3
}}
    >
      Создать
    </Button>
        </DialogActions>
      </MotionDialog>

<MotionMenu
  anchorEl={fileMenuAnchorEl}
  open={Boolean(fileMenuAnchorEl)}
  onClose={handleFileMenuClose}
  sx={{ minWidth: '160px', mt: 0.5 }}
>
  {menuFile?.isFolder && [
    <MenuItem key="add-file" onClick={() => { 
        setCreateParentId(menuFile.id); 
        setIsCreatingFolder(false); 
        setOpenDialog(true); 
        handleFileMenuClose(); 
    }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
        <CreateIcon fontSize="small" sx={{ opacity: 0.7 }} />
        <Typography variant="body2">Создать файл здесь</Typography>
    </MenuItem>,
    <MenuItem key="add-folder" onClick={() => { 
        setCreateParentId(menuFile.id); 
        setIsCreatingFolder(true); 
        setOpenDialog(true); 
        handleFileMenuClose(); 
    }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
        <CreateNewFolderIcon fontSize="small" sx={{ opacity: 0.7 }} />
        <Typography variant="body2">Создать папку здесь</Typography>
    </MenuItem>,
    <Divider key="div" sx={{ my: 1, opacity: 0.1 }} />
  ]}
  <MenuItem onClick={handleOpenRename} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
    <EditIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Переименовать</Typography>
</MenuItem>

<MenuItem onClick={() => { handleDownloadFile(); handleFileMenuClose(); }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5 }}>
    <ArrowDownwardIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Скачать файл</Typography>
  </MenuItem>
  
  <MenuItem onClick={() => { handleDeleteFile(); handleFileMenuClose(); }} sx={{ gap: 1.5, borderRadius: '8px', mx: 0.5, color: '#f87171' }}>
    <DeleteIcon fontSize="small" sx={{ opacity: 0.7 }} />
    <Typography variant="body2">Удалить</Typography>
  </MenuItem>
</MotionMenu>

<MotionDialog 
                      open={openRenameDialog} 
                      onClose={handleCloseRename}
                      maxWidth="sm"
                      fullWidth
                  >  
        <DialogTitle sx={{ fontWeight: 600 }}>Переименовать файл</DialogTitle>
        <DialogContent>
            <form onSubmit={handleRenameSubmit} id="rename-form">
                <TextField
                    autoFocus
                    margin="dense"
                    label="Новое название"
                    fullWidth
                    variant="outlined"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    color='secondary'    />
            </form>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={handleCloseRename} variant="outlined"
            sx={{ 
              ...whiteOutlinedButton,
              m: 1,
              px: 3
            }}>
                Отмена
            </Button>
            <Button 
                type="submit" 
                form="rename-form" 
                variant="contained" 
                sx={{
                    ...whiteSolidButton,
                    m: 1,
                    px: 3
                }}
            >
                Сохранить
            </Button>
        </DialogActions>
    </MotionDialog>
      </>
  );
}

export default LeftSidebarFiles;