import { Paper, Divider, Typography, Box, type SxProps } from '@mui/material';
import { UserSection } from './UserSection';

interface SidebarWrapperProps {
    title: string;
    highAction: React.ReactNode;
    children: React.ReactNode;
    topAction?: React.ReactNode;
    bottomAction?: React.ReactNode;
    secondBottomAction?: React.ReactNode;
    customsx?: SxProps;
}

export const SidebarWrapper = ({ title, highAction, children, topAction, bottomAction, secondBottomAction, customsx }: SidebarWrapperProps) => {
    return (
        <Paper
        elevation={1}
        className="leftSidebarOverlay"
        sx={[{
            width: 220, 
            m: 1,                  
            borderRadius: 3,       
            height: 'calc(100vh - 16px)', 
        
            overflow: 'hidden',     
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: "0 8px 22px rgba(0,0,0,0.3)",

            transition: 'all 0.3s ease-in-out',
        }, ...(Array.isArray(customsx) ? customsx : [customsx]),]}
        >
            <Typography variant='h6' sx={{m: 2, textAlign: 'center', fontWeight: 'bold', '&.Mui-selected': {bgcolor: 'primary.light'}}}>{title}</Typography>

            {highAction}

            <Box component="form" sx={{ '& > :not(style)': { m: 2 } }} noValidate autoComplete="off">
                {topAction}
            </Box>
            
            <Divider variant="fullWidth" />

            {children}

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