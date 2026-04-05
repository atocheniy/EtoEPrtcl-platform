import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide, type SlideProps } from '@mui/material';

interface NotificationContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
    return <Slide {...props} 
      timeout={{ 
        enter: 500,
        exit: 400   
      }} 
      easing={{
        enter: 'cubic-bezier(0, 0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      }} 
      direction="left" />;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');

    const showSuccess = useCallback((msg: string) => {
        setMessage(msg);
        setSeverity('success');
        setOpen(true);
    }, []);

    const showError = useCallback((msg: string) => {
        setMessage(msg);
        setSeverity('error');
        setOpen(true);
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showSuccess, showError }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={3000}
                slots={{ transition: SlideTransition }}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                key={message} 
            >
                <Alert 
                    onClose={handleClose} 
                    severity={severity} 
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: '12px', color: 'white' }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};