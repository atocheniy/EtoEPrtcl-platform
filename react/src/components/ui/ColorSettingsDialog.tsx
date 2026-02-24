import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Button, Typography, Box } from '@mui/material';
import { RgbaStringColorPicker } from 'react-colorful';
import { useEncryption } from '../context/EncryptionContext';
import { whiteOutlinedButton, whiteSolidButton } from '../css/sx';
import { UserService } from '../../services/userService';

interface ColorSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

const DEFAULT_COLOR_1 = 'rgba(99, 102, 241, 0.3)';
const DEFAULT_COLOR_2 = 'rgba(169, 85, 247, 0.15)';

export const ColorSettingsDialog = ({ open, onClose }: ColorSettingsDialogProps) => {
    const { orbColors, setOrbColors } = useEncryption();
    const [color1, color2] = orbColors;

    const handleApply = async () => {
        try {
            await UserService.updateColors(color1, color2);
            onClose();
        } catch (e) {
            console.error("Не удалось сохранить цвета в БД", e);
        }
    };

    const handleReset = () => {
        setOrbColors([DEFAULT_COLOR_1, DEFAULT_COLOR_2]);
    };

    const handleClear = () => {
        setOrbColors(['rgba(0,0,0,0)', 'rgba(0,0,0,0)']);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            slotProps={{
                backdrop: {
                    sx: {backgroundColor: 'rgba(0, 0, 0, 0)' }
                }
            }}
            PaperProps={{ 
                sx: { 
                    bgcolor: 'rgba(12, 12, 12, 0.7) !important', 
                    background: 'rgba(27, 27, 27, 0.7) !important',
                    backdropFilter: 'blur(12px) !important', 
                    border: '1px solid rgba(255, 255, 255, 0.1) !important', 
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5) !important', 
                    borderRadius: '20px !important',
                    color: 'white !important',
                    minWidth: '500px'
                } 
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>
               Настройка цвета
            </DialogTitle>
            
            <DialogContent>
                <Stack direction="row" spacing={4} justifyContent="center" sx={{ py: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>First</Typography>
                        <RgbaStringColorPicker color={color1} onChange={(c) => setOrbColors([c, color2])} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Second</Typography>
                        <RgbaStringColorPicker color={color2} onChange={(c) => setOrbColors([color1, c])} />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button 
                    onClick={handleClear} 
                    variant="outlined" 
                    sx={{ ...whiteOutlinedButton, borderColor: 'rgba(255,77,77,0.5)', color: '#ff6b6b', '&:hover': { borderColor: '#ff4d4d' } }}
                >
                    Выключить
                </Button>
                
                <Box sx={{ flexGrow: 1 }} />

                <Button 
                    onClick={handleReset} 
                    variant="outlined" 
                    sx={whiteOutlinedButton}
                >
                    Сброс
                </Button>

                <Button 
                    onClick={handleApply} 
                    variant="contained" 
                    sx={whiteSolidButton}
                >
                    Применить
                </Button>
            </DialogActions>
        </Dialog>
    );
};