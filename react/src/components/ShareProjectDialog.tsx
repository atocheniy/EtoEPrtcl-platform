import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Typography, 
    TextField, Button, Stack, Divider, List, ListItem, 
    Avatar, IconButton, Select, MenuItem, Chip,
    Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { whiteSolidButton, whiteOutlinedButton } from './css/sx';

import { useEncryption } from './context/EncryptionContext';
import { DCrypto } from '../services/cryptoService';
import { UserService } from '../services/userService';
import { ProjectService } from '../services/projectService';
import { MotionDialog } from './ui/MotionDialog';
import { motion } from 'framer-motion';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectData?: any;
}

export default function ShareProjectDialog({ open, onClose, projectData }: ShareProjectDialogProps) {
     const { masterKey, currentProjectKey, userData } = useEncryption();
     const [inviteEmail, setInviteEmail] = useState("");
     const [inviteRole, setInviteRole] = useState("viewer");
     const [members, setMembers] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);

    const fetchMembers = async () => {
        if (!projectData?.id) return;
        try {
            const data = await ProjectService.getMembers(projectData.id);
            setMembers(data);
        } catch (e) {
            console.error("Ошибка загрузки участников", e);
        }
    };

    useEffect(() => {
        if (open) fetchMembers();
    }, [open, projectData?.id]);

    const handleAddMember = async () => {
        if (!inviteEmail || !currentProjectKey) return;
        setLoading(true);
        try {
            const friend = await UserService.searchUser(inviteEmail);
            const rawKey = await window.crypto.subtle.exportKey("raw", currentProjectKey);
            const friendPubKey = await DCrypto.importExchangePublicKey(friend.exchangePublicKey);

            const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                friendPubKey,
                rawKey
            );

            await ProjectService.addMember(projectData.id, {
                userEmail: inviteEmail,
                encryptedProjectKey: DCrypto.bufferToBase64(encryptedKeyBuffer),
                iv: "RSA",
                role: inviteRole
            });

            setInviteEmail("");
            fetchMembers();
        } catch (e: any) {
            alert(e.response?.data || "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm("Удалить пользователя из проекта?")) return;
        try {
            await ProjectService.removeMember(projectData.id, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (e) {
            alert("Не удалось удалить");
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await ProjectService.updateMemberRole(projectData.id, userId, newRole);
            setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
        } catch (e) {
            alert("Не удалось обновить роль");
        }
    };

    const amIOwner = members.find(m => m.isMe)?.role === 'Owner';

    const [exportedKey, setExportedKey] = useState<string>("");
    useEffect(() => {
        const getRawKey = async () => {
            if (currentProjectKey && projectData?.isPublic) {
                const raw = await DCrypto.exportProjectKey(currentProjectKey);
                setExportedKey(raw);
            }
        };
        getRawKey();
    }, [currentProjectKey, projectData?.isPublic]);

    const isPublic = projectData?.isPublic;
    const shareUrl = isPublic 
        ? `${window.location.origin}/share/${projectData.id}#${exportedKey}`
        : "Доступ ограничен";

    const handleCopyLink = () => {  
    if (!isPublic) return;
        navigator.clipboard.writeText(shareUrl);
        alert("Публичная ссылка скопирована");
    };

    return (
        <MotionDialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >   
            <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>
                Управление доступом {projectData?.name ? `к "${projectData.name}"` : ''}
            </DialogTitle>
            
            <DialogContent sx={{ px: 4, pb: 4 }}>
                
                {amIOwner && (
                <>
                <Box sx={{ mb: 4, mt: 1 }}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        ДОСТУП ПО ССЫЛКЕ
                    </Typography>
                    <Stack direction="row" spacing={1}>
        <TextField 
            fullWidth 
            size="small"
            value={shareUrl}
            color='secondary'
            sx={{
                '& .MuiInputBase-input': { 
                    color: isPublic ? '#4ade80' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.8rem',
                    textOverflow: 'ellipsis'
                }
            }}
        />
        <Tooltip title={isPublic ? "Копировать ссылку" : "Сначала сделайте проект публичным в настройках"}>
            <span> 
                <Button 
                    variant="outlined" 
                    disabled={!isPublic}
                    sx={{ 
                        ...whiteOutlinedButton, 
                        minWidth: '40px', 
                        p: 0,
                        borderColor: isPublic ? '#4ade80' : 'rgba(255,255,255,0.1)',
                        color: isPublic ? '#4ade80' : 'disabled'
                    }}
                    onClick={handleCopyLink}
                >
                    <ContentCopyIcon fontSize="small" />
                </Button>
            </span>
        </Tooltip>
    </Stack>
    {!isPublic && (
        <Typography variant="caption" sx={{ color: '#818cf8', mt: 1, display: 'block' }}>
            * Чтобы активировать ссылку, включите «Публичный проект» в настройках.
        </Typography>
    )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        ПРИГЛАСИТЬ ПОЛЬЗОВАТЕЛЕЙ
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField 
                            fullWidth 
                            size="small"
                            placeholder="Email адрес..."
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            color='secondary'
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
                            onClick={handleAddMember}
                        >
                            <PersonAddIcon />
                        </Button>
                    </Stack>
                </Box>
                </>
                )}

                <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        УЧАСТНИКИ ПРОЕКТА ({members.length})
                    </Typography>
                    <List disablePadding>
                         {members.map((member, index) => (
    <motion.div
      key={member.userId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }} 
    >
                            <ListItem key={member.userId} disablePadding sx={{ py: 1, '&:hover .delete-btn': { opacity: 1 } }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: member.isMe ? '#818cf8' : 'rgba(255,255,255,0.1)' }}>
                                    {member.email.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="body2" 
                                        noWrap
                                        sx={{ fontWeight: member.isMe ? 700 : 500 }}
                                        >
                                        {member.email} {member.isMe && <Chip label="Вы" size="small" sx={{ height: '16px', fontSize: '0.6rem', ml: 1, bgcolor: 'rgba(129, 140, 248, 0.2)', color: '#818cf8' }} />}
                                    </Typography>
                                </Box>
                                
                                {member.role === 'Owner' ? (
                                    <Typography variant="caption" sx={{ pr: 2 }}>Владелец</Typography>
                                ) : (
                                    <Stack direction="row" alignItems="center">
                                        <Select
                                            size="small"    
                                            value={member.role}
                                            variant="standard"
                                            disableUnderline
                                            disabled={!amIOwner}
                                            onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                                            sx={{ fontSize: '0.8rem', mr: 1 }}
                                        >
                                            <MenuItem value="Viewer">Чтение</MenuItem>
                                            <MenuItem value="Editor">Редактор</MenuItem>
                                        </Select>
                                        {amIOwner && (
                                            <IconButton size="small" className="delete-btn" onClick={() => handleRemoveMember(member.userId)} sx={{ opacity: 0, transition: '0.2s', color: '#f87171' }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                )}
                            </ListItem>
                    </motion.div>
  ))}
</List>
                </Box>
            </DialogContent>
        </MotionDialog>
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