import { Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { MotionDialog } from "../../motion/MotionDialog";
import { whiteOutlinedButton, whiteSolidButton } from "../../css/sx";
import { useApplication } from "../../context/ApplicationContext";
import { DCrypto } from "../../../services/cryptoService";
import { FileService } from "../../../services/fileService";
import type { FileItem } from "../../../types/auth";


interface RenameDialogProps {
    openRenameDialog: boolean;
    newFileName: string;
    menuFile: FileItem | null;
    setOpenRenameDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setNewFileName: React.Dispatch<React.SetStateAction<string>>;
    setMenuFile: React.Dispatch<React.SetStateAction<FileItem | null>>;
    onRenameSuccess: (newName: string) => void;
    selectedId: string | null;
}

function RenameDialog({ openRenameDialog, newFileName, menuFile, setOpenRenameDialog, setNewFileName, setMenuFile, onRenameSuccess, selectedId }: RenameDialogProps) {    
    const { masterKey, currentProjectKey, setProjectFiles } = useApplication();
    
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

    return(
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
    );
}

export default RenameDialog;