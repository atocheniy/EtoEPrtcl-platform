import { Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';

interface AuthLayoutProps {
    text: string;
    buttonLabel: string;
    navigateTo: string;
    buttonWidth?: string;
}

const AuthLayout = ({ text, buttonLabel, navigateTo }: AuthLayoutProps) => {
    const navigate = useNavigate();

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                m: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                bgcolor: '#222222b5',
                backdropFilter: "blur(10px)", 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                pl: 3,
                pr: 3,
                p: 2,
                gap: 3,
                boxSizing: 'border-box'
            }}
        >
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{text}</Typography>
            <Button
                fullWidth
                variant='contained'
                onClick={() => navigate(navigateTo)}
                sx={{
                    width: "170px",
                    borderRadius: '12px',
                    textTransform: 'none',
                    color: 'black',
                    border: '1px solid rgba(112, 112, 112, 0.3)',
                    background: 'white',
                    transition: '0.3s',
                    '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 1)',
                        background: 'rgba(82, 82, 82, 0.05)',
                        color: "white"
                    }
                }}
            >
                {buttonLabel}
            </Button>
        </Paper>
    );
};

export default AuthLayout;