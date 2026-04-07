import { Box, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import TitleIcon from '@mui/icons-material/Title';
import { useMemo } from "react";

interface NavigationSectionProps {
    content: string;
}

function NavigationSection({ content }: NavigationSectionProps) {

    const generateSlug = (text: string) => {
        return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') 
        .replace(/[^\wа-яА-ЯёЁ0-9-]/g, '');
    };

    const headings = useMemo(() => {
        if (!content) return [];
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches = Array.from(content.matchAll(headingRegex));
        
        return matches.map(m => ({
        level: m[1].length,
        text: m[2],
        id: generateSlug(m[2])
        }));
    }, [content]);

    const scrollToHeading = (id: string) => {
        const target = document.getElementById(id);
        const container = document.getElementsByClassName('content-scroll-container')[0];

        if (target && container) {
            const containerTop = container.getBoundingClientRect().top;
            const targetTop = target.getBoundingClientRect().top;
            
            const scrollTarget = container.scrollTop + (targetTop - containerTop) - 90;

            container.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        }
    };

    return(
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <TitleIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                    Навигация
                </Typography>
            </Stack>
            <List disablePadding>
            {headings.length > 0 ? headings.map((h, i) => (
                <ListItemButton 
                key={i} 
                onClick={() => scrollToHeading(h.id)}
                sx={{ 
                    py: 0.3, 
                    px: 1, 
                    borderRadius: 2,
                    pl: h.level > 1 ? (h.level * 1) : 1 
                }}
                >
                <ListItemText 
                    primary={`${i + 1}. ${h.text}`} 
                    primaryTypographyProps={{ 
                        fontSize: '0.8rem', 
                        noWrap: true, 
                        fontWeight: h.level === 1 ? 700 : 400 
                    }} 
                />
                </ListItemButton>
            )) : (
                <Typography variant="caption" sx={{ opacity: 0.3, pl: 1 }}>Нет заголовков</Typography>
            )}
            </List>
        </Box>
    )
}

export default NavigationSection;