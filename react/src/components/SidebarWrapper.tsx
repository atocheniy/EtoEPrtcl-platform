import { Paper, Divider, Typography, Box, type SxProps } from '@mui/material';
import { UserSection } from './UserSection';

interface SidebarWrapperProps {
    classnames?: string;
    title: string;
    highAction: React.ReactNode;
    children: React.ReactNode;
    topAction?: React.ReactNode;
    bottomAction?: React.ReactNode;
    secondBottomAction?: React.ReactNode;
    customsx?: SxProps;
}

export const SidebarWrapper = ({ classnames, title, highAction, children, topAction, bottomAction, secondBottomAction, customsx }: SidebarWrapperProps) => {
    return (
        <Paper
        elevation={1}
        className={classnames}
        sx={[{
            width: 220, 
            m: 1,                  
            borderRadius: 3,       
            height: 'calc(100vh - 16px)', 
        
            overflow: 'hidden',     
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.08)',

            transition: 'all 0.3s ease-in-out',
        }, ...(Array.isArray(customsx) ? customsx : [customsx]),]}
        >
            <Typography variant='h6' sx={{m: 2, textAlign: 'center', fontWeight: 'bold', '&.Mui-selected': {bgcolor: 'primary.light'}}}>{title}</Typography>

            {highAction}

            <Box component="form" sx={{ '& > :not(style)': { m: 2 } }} noValidate autoComplete="off">
                {topAction}
            </Box>
            
            <Divider variant="fullWidth" />

            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#222', borderRadius: '10px' },
                '&': {
                    scrollbarWidth: 'thin', 
                    scrollbarColor: 'rgba(54, 54, 54, 0) transparent',
                    transition: "all 0.3s",
                },
                '&:hover': {
                    scrollbarColor: 'rgba(54, 54, 54, 1) transparent',
                }
            }}>
                {children}
            </Box>

            <Divider variant="fullWidth" />
            <Box sx={{ p: 2 }}>
                {bottomAction}
            </Box>

            {secondBottomAction ? (
                <Box sx={{ p: 2, pt: 0.5 }}>
                    {secondBottomAction}
                </Box>) : <></>
            }

            <UserSection />
        </Paper>
    );
};