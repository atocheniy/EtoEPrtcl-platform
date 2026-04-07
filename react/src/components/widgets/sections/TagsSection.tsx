import { Box, Stack, Typography } from "@mui/material";
import TagIcon from '@mui/icons-material/Tag';

interface TagsSectionProps {
    tags: string[]; 
}

function TagsSection({ tags }: TagsSectionProps) {

    return(
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <TagIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                    Теги
                </Typography>
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 1 }}>
            {tags.length > 0 ? tags.map((tag, i) => (
                <Typography 
                    key={i} 
                    sx={{ 
                        fontSize: '0.75rem', 
                        color: '#818cf8', 
                        bgcolor: 'rgba(129, 140, 248, 0.1)', 
                        px: 1, py: 0.2, 
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.2)' }
                    }}
                >
                #{tag}
                </Typography>
            )) : (
                <Typography variant="caption" sx={{ opacity: 0.3 }}>Нет тегов</Typography>
            )}
            </Box>
        </Box>
    );
}

export default TagsSection;