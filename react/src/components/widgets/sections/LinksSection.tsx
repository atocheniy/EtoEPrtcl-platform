import { Box, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import type { FileItem } from "../../../types/auth";

interface LinksSectionProps {
    links: string[];       
    allFiles: FileItem[];  
    onFileSelect: (id: string) => void;
}

function LinksSection({ links, allFiles, onFileSelect }: LinksSectionProps) {

    return(
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LinkIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                    Ссылки
                </Typography>
            </Stack>
            <List disablePadding>
            {links.length > 0 ? links.map(linkId => {
                const targetFile = allFiles.find(f => f.id === linkId);
                return (
                <ListItemButton 
                    key={linkId} 
                    onClick={() => onFileSelect(linkId)}
                    sx={{ py: 0.2, px: 1, borderRadius: 2 }}
                >
                    <ListItemText 
                    primary={targetFile?.name || "Загрузка..."} 
                    primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, color: '#4ade80' }} 
                    />
                </ListItemButton>
                );
            }) : (
                <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет ссылок</Typography>
            )}
            </List>
        </Box>
    );
}

export default LinksSection;