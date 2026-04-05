import { Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEncryption } from '../context/EncryptionContext';
import { ApplicationTheme } from '../../types/auth';

interface AuthLayoutProps {
    text: string;
    buttonLabel: string;
    navigateTo: string;
    buttonWidth?: string;
}

const AuthLayout = ({ text, buttonLabel, navigateTo }: AuthLayoutProps) => {
    const navigate = useNavigate();
    const { currentTheme } = useEncryption();
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
                bgcolor: currentTheme === ApplicationTheme.Dark ? '#222222b5' : '#f5f5f5',
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
            <Typography sx={{ }}>{text}</Typography>
            <Button
                fullWidth
                variant='contained'
                onClick={() => navigate(navigateTo)}
                sx={{
                    width: "170px",
                    borderRadius: '12px',
                    textTransform: 'none',
                    border: '1px solid rgba(112, 112, 112, 0.3)',
                    transition: '0.3s',
                }}
            >
                {buttonLabel}
            </Button>
        </Paper>
    );
};

export default AuthLayout;