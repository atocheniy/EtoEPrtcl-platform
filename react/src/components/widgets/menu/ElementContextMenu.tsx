import { Divider, MenuItem, Typography } from "@mui/material";
import { MotionMenu } from "../../motion/MotionMenu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/ArrowDownward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CreateIcon from '@mui/icons-material/Create';
import { useApplication } from "../../context/ApplicationContext";
import { DCrypto } from "../../../services/cryptoService";
import $api from "../../../api/axios";
import type { FileItem } from "../../../types/auth";
import { FileService } from "../../../services/fileService";

interface ElementContextMenuProps 
{
    menuFile: FileItem | null;
    selectedId: string | null;
    closeFile: () => void;
    setMenuFile: React.Dispatch<React.SetStateAction<FileItem | null>>;
    handleFileMenuClose: () => void;
    fileMenuAnchorEl: HTMLElement | null;
    handleOpenRename: () => void;
    setCreateParentId: React.Dispatch<React.SetStateAction<string | null>>;
    setIsCreatingFolder: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

function ElementContextMenu({ menuFile, selectedId, closeFile, setMenuFile, handleFileMenuClose, fileMenuAnchorEl, handleOpenRename, setCreateParentId, setIsCreatingFolder, setOpenDialog }: ElementContextMenuProps) {
    const { currentProjectKey, setProjectFiles } = useApplication();

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

    const handleDownloadFile = async () => {
        if (!menuFile || !currentProjectKey) return;

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

    return(
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
    );
}

export default ElementContextMenu;