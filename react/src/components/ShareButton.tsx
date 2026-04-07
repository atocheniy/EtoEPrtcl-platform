import { Button, Paper } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { ApplicationTheme } from "../types/auth";
import { useApplication } from "./context/ApplicationContext";

interface ShareButtonProps {
  setOpenShareDialog: React.Dispatch<React.SetStateAction<boolean>>
}

function ShareButton({ setOpenShareDialog }: ShareButtonProps) {
    const { currentTheme } = useApplication();
    const { currentProjectId, projectData } = useApplication();
    
    return (
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
    );
}

export default ShareButton;