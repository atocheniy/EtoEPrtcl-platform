import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { useEncryption } from './EncryptionContext';

export const AppThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const { isDarkMode } = useEncryption();

    const theme = useMemo(() => createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            
        },
        
    }), [isDarkMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};