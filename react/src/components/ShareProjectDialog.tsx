import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Typography, 
    TextField, Button, Stack, Divider, List, ListItem, 
    Avatar, IconButton, Select, MenuItem, Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { whiteSolidButton, whiteOutlinedButton } from './css/sx';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectData?: any;
}

const MOCK_MEMBERS =[
    { id: '1', email: 'owner@app.com', role: 'owner', isMe: true },
    { id: '2', email: 'colleague@gmail.com', role: 'editor', isMe: false },
    { id: '3', email: 'client@company.com', role: 'viewer', isMe: false },
];

export default function ShareProjectDialog({ open, onClose, projectData }: ShareProjectDialogProps) {
    const[inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://localhost:5173/share/${projectData?.id || 'demo'}#KEY123`);
        alert("Ссылка скопирована!");
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
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
                Управление доступом
            </DialogTitle>
            
            <DialogContent sx={{ px: 4, pb: 4 }}>
                
                <Box sx={{ mb: 4, mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', fontWeight: 600 }}>
                        ДОСТУП ПО ССЫЛКЕ
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField 
                            fullWidth 
                            size="small"
                            value="Ограничен (Только по приглашению)"
                            disabled
                            sx={inputStyle}
                        />
                        <Button 
                            variant="outlined" 
                            sx={{ ...whiteOutlinedButton, minWidth: '40px', p: 0 }}
                            onClick={handleCopyLink}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', fontWeight: 600 }}>
                        ПРИГЛАСИТЬ ПОЛЬЗОВАТЕЛЕЙ
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField 
                            fullWidth 
                            size="small"
                            placeholder="Email адрес..."
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            sx={inputStyle}
                        />
                        <Select
                            size="small"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            sx={selectStyle}
                        >
                            <MenuItem value="viewer">Чтение</MenuItem>
                            <MenuItem value="editor">Редактор</MenuItem>
                        </Select>
                        <Button 
                            variant="contained" 
                            sx={whiteSolidButton}
                        >
                            <PersonAddIcon />
                        </Button>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', fontWeight: 600 }}>
                        УЧАСТНИКИ ПРОЕКТА
                    </Typography>
                    <List disablePadding>
                        {MOCK_MEMBERS.map((member) => (
                            <ListItem 
                                key={member.id} 
                                disablePadding 
                                sx={{ py: 1, '&:hover .delete-btn': { opacity: 1 } }}
                            >
                                <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: member.isMe ? '#818cf8' : 'rgba(255,255,255,0.1)' }}>
                                    {member.email.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: member.isMe ? 700 : 500 }}>
                                        {member.email} {member.isMe && <Chip label="Вы" size="small" sx={{ height: '16px', fontSize: '0.6rem', ml: 1, bgcolor: 'rgba(129, 140, 248, 0.2)', color: '#818cf8' }} />}
                                    </Typography>
                                </Box>
                                
                                {member.role === 'owner' ? (
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', pr: 2 }}>Владелец</Typography>
                                ) : (
                                    <Stack direction="row" alignItems="center">
                                        <Select
                                            size="small"
                                            value={member.role}
                                            variant="standard"
                                            disableUnderline
                                            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', mr: 1, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                        >
                                            <MenuItem value="viewer">Чтение</MenuItem>
                                            <MenuItem value="editor">Редактор</MenuItem>
                                        </Select>
                                        <IconButton size="small" className="delete-btn" sx={{ opacity: 0, transition: '0.2s', color: '#f87171' }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: 'rgba(255,255,255,0.03)',
        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
        '&.Mui-focused fieldset': { borderColor: '#818cf8' },
        '& input': { color: 'white', fontSize: '0.9rem' }
    }
};

const selectStyle = {
    borderRadius: '10px',
    bgcolor: 'rgba(255,255,255,0.03)',
    color: 'white',
    fontSize: '0.9rem',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#818cf8' },
    '& .MuiSvgIcon-root': { color: 'white' }
};