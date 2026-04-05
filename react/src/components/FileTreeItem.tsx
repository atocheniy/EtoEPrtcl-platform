import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { ApplicationTheme, listVariants } from '../types/auth';
import FolderIcon from '@mui/icons-material/Folder';
import { motion } from 'framer-motion';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEncryption } from './context/EncryptionContext';

const MotionBox = motion(Box);

export const FileTreeItem = ({ item, level, selectedId, onFileSelect, expanded, onToggle, onMenuOpen, getIcon, masterKey, orbColors, index }: any) => {
    const isFolder = item.isFolder;
    const isOpen = expanded.includes(item.id);
    const { currentTheme } = useEncryption();

    const getAccentColor = (alpha: string) => orbColors[1].replace(/[\d.]+\)$/g, `${alpha})`);

    return (
        <>
        <MotionBox sx={{ 
            border: isFolder && isOpen ? `1px solid ${getAccentColor('0.2')}` : '1px solid transparent',
            bgcolor: isFolder && isOpen ? getAccentColor('0.03') : 'transparent',
            borderRadius: '12px',
            mb: isFolder && isOpen ? 1 : 0.5,
            mx: isFolder && level > 0 ? 1 : 0,
            transition: 'border 0.2s, background-color 0.2s',
            overflow: 'hidden'
        }}
        variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={index}
            layout>
            <ListItem 
                disablePadding 
                sx={{ width: level > 0 ? 'auto' : '100%', mx: !isFolder && level > 0 ? 1 : 0, mt: !isFolder && level > 0 ? 0.5 : 0,  border: isFolder ? `1px solid ${orbColors[1].replace(/[\d.]+\)$/g, '0.1)')}` : 'none', bgcolor: isFolder ? orbColors[1].replace(/[\d.]+\)$/g, '0.05)') : 'transparent', mb: 1, borderRadius: 3, '&:hover .file-actions': { opacity: 1 }  }}  
                
                secondaryAction={
                <IconButton
                className="file-actions" 
                edge="end"
                size="small"
                onClick={(e) => onMenuOpen(e, item)}
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: 'rgba(117, 117, 117, 0.5)',
                    '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                >
                <MoreVertIcon fontSize="small" />
                </IconButton>
            }>
                <ListItemButton
                    disabled={!masterKey}
                    selected={selectedId === item.id}
                    onClick={() => isFolder ? onToggle(item.id) : onFileSelect(item.id)}
                    sx={{
                        borderRadius: 3,
                        pl: 1, 
                        pr: 1,
                        '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                            bgcolor: currentTheme === ApplicationTheme.Dark ? 'white' : 'gray',
                        },
                        '& .MuiListItemIcon-root': {
                            color: 'inherit',
                        }
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                        {isFolder ? (
                        <FolderIcon sx={{ color: orbColors[1].replace(/[\d.]+\)$/g, '1)') }} /> 
                        ) : (
                        getIcon(item.extension)
                        )}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.name} 
                        primaryTypographyProps={{ 
                            fontWeight: isFolder ? 'bold' : 'medium',
                            noWrap: true,       
                            title: item.name,
                            fontSize: '0.9rem',
                        }}
                    />
                </ListItemButton>
            </ListItem>

            {isFolder && (
                <Collapse in={isOpen} timeout="auto">
                    <List component="div" disablePadding>
                        {item.children.map((child: any, childIndex: number) => (
                            <FileTreeItem 
                                key={child.id} 
                                item={child} 
                                level={level + 1} 
                                index={childIndex}
                                selectedId={selectedId}
                                onFileSelect={onFileSelect}
                                expanded={expanded}
                                onToggle={onToggle}
                                onMenuOpen={onMenuOpen}
                                getIcon={getIcon}
                                masterKey={masterKey}
                                orbColors={orbColors}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
            </MotionBox>
        </>
    );
};