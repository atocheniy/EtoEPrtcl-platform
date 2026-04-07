import { Box, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import LanguageIcon from '@mui/icons-material/Language'; 
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useMemo } from "react";

interface OutLinksSectionProps {
    content: string;
}

function OutLinksSection({ content }: OutLinksSectionProps) {
    
    const externalLinks = useMemo(() => {
        if (!content) return [];
        const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
        return Array.from(content.matchAll(mdLinkRegex)).map(m => ({
          text: m[1],
          url: m[2]
        }));
    }, [content]);

    return(
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LanguageIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>
                    Внешние ресурсы
                </Typography>
            </Stack>
            <List disablePadding>
            {externalLinks.length > 0 ? externalLinks.map((link, i) => (
                <ListItemButton 
                    key={i} 
                    component="a" 
                    href={link.url} 
                    target="_blank" 
                    sx={{ py: 0.2, px: 1, borderRadius: 2 }}
                >
                <ListItemText 
                    primary={link.text} 
                    primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, color: '#60a5fa' }} 
                    secondary={link.url}
                />
                <OpenInNewIcon sx={{ fontSize: 12, opacity: 0.5, ml: 1, color: '#60a5fa' }} />
                </ListItemButton>
            )) : (
                <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет ссылок</Typography>
            )}
            </List>
        </Box>
    );
}

export default OutLinksSection;