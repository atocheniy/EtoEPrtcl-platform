import { Box, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';

interface HistorySectionProps {
    handleRestore: (rev: any) => void
    history: any[]
}

function HistorySection({ handleRestore, history }: HistorySectionProps) {

    return (
        <Box sx={{ p: 2, pb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HistoryIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                    История версий
                </Typography>
            </Stack>

            <Box sx={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                pr: 0.5,
                '&::-webkit-scrollbar': { width: '3px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
            }}>
            <List disablePadding dense>
                {history.length > 0 ? history.map((rev) => (
                <ListItemButton 
                    key={rev.id} 
                    onClick={() => handleRestore(rev)}
                    sx={{ 
                        py: 0.5,
                        px: 1, 
                        borderRadius: 1.5,
                        mb: 0.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <ListItemText 
                    primary={new Date(rev.createdAt).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} 
                    secondary={rev.userEmail}
                    primaryTypographyProps={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 500 
                    }}
                    secondaryTypographyProps={{ 
                        fontSize: '0.62rem', 
                        noWrap: true 
                    }}
                    />
                </ListItemButton>
                )) : (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.3, fontSize: '0.7rem', pl: 1 }}>
                    Версии не найдены
                </Typography>
                )}
            </List>
            </Box>
        </Box>
    );
}

export default HistorySection;