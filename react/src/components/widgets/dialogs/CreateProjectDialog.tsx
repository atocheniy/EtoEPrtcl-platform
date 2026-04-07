import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { MotionDialog } from "../../motion/MotionDialog";
import { whiteOutlinedButton, whiteSolidButton } from "../../css/sx";
import { useApplication } from "../../context/ApplicationContext";
import { DCrypto } from "../../../services/cryptoService";
import { ProjectService } from "../../../services/projectService";

interface CreateProjectDialogProps {
    handleCloseDialog: () => void;
    onProjectSelect: (id: string) => void;
    openDialog: boolean;
}

function CreateProjectDialog({ handleCloseDialog, onProjectSelect, openDialog }: CreateProjectDialogProps) {

    const { masterKey, refreshProjects } = useApplication();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const projectName = formData.get('projectName') as string;
    
            if (!projectName || !masterKey) return;
    
            try {
                const projectKey = await DCrypto.generateProjectKey();
                const rawProjectKey = await DCrypto.exportProjectKey(projectKey);
    
                const encryptedName = await DCrypto.encrypt(projectName, projectKey);
    
                const wrappedKey = await DCrypto.encrypt(rawProjectKey, masterKey);
    
                const newProject = await ProjectService.createProject({
                    name: encryptedName.content,  
                    iv: encryptedName.iv, 
                    encryptedProjectKey: wrappedKey.content,
                    projectKeyIv: wrappedKey.iv
                });
                
                await refreshProjects(); 
                onProjectSelect(newProject.id); 
                handleCloseDialog();
            } catch (error) {
                console.error(error);
            }
      };

    return(
        <MotionDialog 
                      open={openDialog} 
                      onClose={handleCloseDialog}
                      maxWidth="sm"
                      fullWidth
                  >  
          
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
    Новый проект
  </DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>
      Введите название для вашего нового проекта. Вы сможете изменить настройки позже.
    </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
        autoFocus
        margin="dense"
        id="name"
        name="projectName"
        label="Название проекта"
        type="text"
        fullWidth
       color='secondary'     />
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
    );
}

export default CreateProjectDialog;