import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, TextField, MenuItem, 
    Button, Stack, Divider, Switch,
    Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { whiteSolidButton } from '../../css/sx';

import { ApplicationTheme, ProjectPriority, ProjectStatus } from "../../../types/auth";
import { MotionTextField } from '../../motion/MotionTextField';
import { useApplication } from '../../context/ApplicationContext';

interface ProjectSettingsProps {
    projectData: { id: string; name: string; iv: string, isPublic: boolean, priority: ProjectPriority, status: ProjectStatus };
    onSave: (updatedData: { 
        id: string; 
        name: string; 
        isPublic: boolean; 
        priority: ProjectPriority; 
        status: ProjectStatus;
        publicEncryptedKey?: string;
        publicKeyIv?: string;
    }) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectData, onSave, onClose, onDelete  }) => {
    const [name, setName] = useState(projectData.name);
    const [isPublic, setIsPublic] = useState(projectData.isPublic);
    const [priority, setPriority] = useState<ProjectPriority>(projectData.priority);
    const [status, setStatus] = useState<ProjectStatus>(projectData.status);

    const { currentTheme } = useApplication();

    useEffect(() => {
        console.log(projectData.name)
        console.log(projectData.isPublic)
        console.log(projectData.priority)
        console.log(projectData.status)

        setName(projectData.name);
        setIsPublic(projectData.isPublic);
        setPriority(projectData.priority);
        setStatus(projectData.status);
    }, [projectData]);

    const handleSave = () => {
        onSave({
            id: projectData.id,
            name,
            isPublic,
            priority,
            status
        });
    };

    const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите удалить проект "${name}" и все файлы внутри него?`)) {
            onDelete(projectData.id);
        }
    };

    return (
        <Box 
            sx={{ 
                maxWidth: '600px', 
                width: '100%', 
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
            }}
        >
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                Настройки проекта
            </Typography>

            <Stack spacing={4}>
                <Box>
                    <TextField
                        fullWidth
                        label="Название проекта"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        color='secondary'
                        sx={{'& .MuiOutlinedInput-root': {
        borderRadius: '15px',}
                        }}
                            />
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

                    <MotionTextField
    label="Статус"
    value={status}
    onChange={(val) => setStatus(val)}
    color='secondary'
    sx={{'& .MuiOutlinedInput-root': {
        borderRadius: '15px',}
                        }}
>
                        <MenuItem value={ProjectStatus.Planning} sx={{ gap: 1.5, py: 1, mx: 0.5, borderRadius: '10px', }}>Планирование</MenuItem>
                        <MenuItem value={ProjectStatus.Active} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>В работе</MenuItem>
                        <MenuItem value={ProjectStatus.Hold} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>На паузе</MenuItem>
                        <MenuItem value={ProjectStatus.Completed} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>Завершен</MenuItem>
                    </MotionTextField>

<MotionTextField
    label="Приоритет"
    value={priority}
    onChange={(val) => setPriority(val)}
    color='secondary'
    sx={{'& .MuiOutlinedInput-root': {
        borderRadius: '15px',}
                        }}
>

                        <MenuItem value={ProjectPriority.Low} sx={{ gap: 1.5, py: 1, mx: 0.5, borderRadius: '10px', }}>Низкий</MenuItem>
                        <MenuItem value={ProjectPriority.Medium} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>Средний</MenuItem>
                        <MenuItem value={ProjectPriority.High} sx={{ gap: 1.5, py: 1, mt: 0.5, mx: 0.5, borderRadius: '10px', }}>Высокий</MenuItem>
                    </MotionTextField>
                </Stack>

                <Paper sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    bgcolor: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundImage: 'none'
                }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={2} alignItems="center">
                            {isPublic ? <PublicIcon sx={{ color: '#4ade80' }} /> : <LockIcon sx={{ color: '#818cf8' }} />}
                            <Box>
                                <Typography variant="subtitle1" sx={{}}>
                                    {isPublic ? 'Публичный доступ' : 'Приватный проект'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                    {isPublic ? 'Виден всем пользователям' : 'Доступен только вам и приглашенным'}
                                </Typography>
                            </Box>
                        </Stack>
                        <Switch 
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            color="primary"
                        />
                    </Stack>
                </Paper>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    border: '1px solid rgba(244, 67, 54, 0.2)', 
                    bgcolor: 'rgba(244, 67, 54, 0.05)' 
                }}>
                    <Typography variant="h6" sx={{ color: '#ff5252', fontWeight: 700, mb: 1 }}>
                        Удаление
                    </Typography>
                    <Typography variant="body2" sx={{  mb: 2 }}>
                        Удаление проекта приведет к безвозвратному удалению всех связанных файлов и данных.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteForeverIcon />}
                        onClick={handleDelete}
                        sx={{ 
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'rgba(244, 67, 54, 0.5)',
                            '&:hover': {
                                borderColor: '#ff5252',
                                bgcolor: 'rgba(244, 67, 54, 0.1)'
                            }
                        }}
                    >
                        Удалить этот проект
                    </Button>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button 
                        onClick={onClose}
                        sx={{  }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ ...whiteSolidButton, px: 4 }}
                    >
                        Сохранить изменения
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};    

export default ProjectSettings;