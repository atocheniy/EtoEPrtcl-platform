import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { useApplication } from './ApplicationContext';
import { PerformanceMode } from '../../types/auth';

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        SidebarBlur: true;
        blur: true;
        solid: true;
        DialogBlur: true;
        MenuBlur: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        whiteOutlined: true;
        whiteSolid: true;
    }
}

declare module '@mui/material/TextField' {
    interface TextFieldPropsVariantOverrides {
        whiteOutlined: true;
        whiteSolid: true;
    }
}

export const AppThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const { isDarkMode, mode } = useApplication();

    const theme = useMemo(() => createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            primary: {
                main: isDarkMode ? '#ececec' : '#2c2c2c',
            },
            secondary: {
                main: isDarkMode ? '#a7a7a7' : '#505050',
            },
            background: {
                paper: isDarkMode ? 'rgb(10, 10, 10)' : 'rgb(230, 230, 230)',
            },
        },
        components: {
            MuiPaper: {
                variants: [
                    {
                        props: { variant: 'SidebarBlur' },
                        style: {
                            backgroundColor: mode === PerformanceMode.Off 
                                ? (isDarkMode ? 'rgba(20, 20, 20, 0.9)' : 'rgba(230, 230, 230, 0.9)')
                                : (isDarkMode ? 'rgb(20, 20, 20)' : 'rgb(230, 230, 230)'),
                            backdropFilter: mode === PerformanceMode.Off ? "blur(20px) saturate(150%)" : 'none',
                            WebkitBackdropFilter: mode === PerformanceMode.Off ? "blur(20px) saturate(150%)" : 'none',
                            boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
                        },
                    },
                    {
                        props: { variant: 'blur' },
                        style: {
                            backgroundColor: mode === PerformanceMode.Off 
                                ? (isDarkMode ? 'rgba(20, 20, 20, 0.7)' : 'rgba(230, 230, 230, 0.7)')
                                : (isDarkMode ? 'rgb(20, 20, 20)' : 'rgb(230, 230, 230)'),
                            backdropFilter: mode === PerformanceMode.Off ? "blur(5px) saturate(150%)" : 'none',
                            WebkitBackdropFilter: mode === PerformanceMode.Off ? "blur(5px) saturate(150%)" : 'none',
                        },
                    },
                    {
                        props: { variant: 'solid' },
                        style: {
                            backgroundColor: isDarkMode ? 'rgb(20, 20, 20)' : 'rgb(230, 230, 230)',
                            backgroundImage: 'none',
                        },
                    },


                    {
                        props: { variant: 'DialogBlur' },
                                style: {
                                        backgroundColor: mode === PerformanceMode.Off 
                                            ? (isDarkMode ? 'rgba(20, 20, 20, 0.5)' : 'rgba(230, 230, 230, 0.5)')
                                            : (isDarkMode ? 'rgba(20, 20, 20)' : 'rgb(230, 230, 230)'),
                                        backdropFilter: mode === PerformanceMode.Off ? 'blur(20px) saturate(160%)' : 'none',
                                        WebkitBackdropFilter: mode === PerformanceMode.Off ? 'blur(20px) saturate(160%)' : 'none',
                                        backgroundImage: 'none',
                                        borderRadius: '24px',
                                        boxShadow: isDarkMode ? '0 24px 50px rgba(0,0,0,0.5)' : '0 24px 50px rgba(83, 83, 83, 0.5)',
                                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgb(209, 209, 209)',
                                }
                    },
                    {
                        props: { variant: 'MenuBlur' },
                                style: {
                                        backgroundColor: mode === PerformanceMode.Off 
                                            ? (isDarkMode ? 'rgba(32, 32, 32, 0.75)' : 'rgba(230, 230, 230, 0.75)')
                                            : (isDarkMode ? 'rgb(32, 32, 32)' : 'rgb(230, 230, 230)'),
                                       borderRadius: '20px', 
                                       backdropFilter: mode === PerformanceMode.Off ? 'blur(15px) saturate(150%)' : undefined,
                                       WebkitBackdropFilter: mode === PerformanceMode.Off ? 'blur(15px) saturate(150%)' : undefined,
                                       boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)' : '0 20px 40px rgba(83, 83, 83, 0.4), 0 0 0 1px rgba(255,255,255,0.08)', 
                                       border: isDarkMode ? '1px solid rgba(75, 75, 75, 1)' : '1px solid rgba(200, 200, 200, 1)',
                                       overflow: 'hidden',
                                }
                    },
                ],
            },
            MuiButton: {},
            MuiTextField: {
                styleOverrides: {
                    root: ({ ownerState, theme }) => ({
                        ...(ownerState.variant === 'outlined' && {
                            '& .MuiInputLabel-root': {
                                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                '&.Mui-focused': {
                                    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                                }
                            },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '15px',
                                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                '& fieldset': {
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                },
                                '&:hover fieldset': {
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main,
                                    borderWidth: '1px',
                                },
                            },
                        }),
                        ...(ownerState.color === 'secondary' && {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', 
                                
                                '& fieldset': { 
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    transition: 'border-color 0.2s',
                                },
                                '&:hover fieldset': { 
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                                },
                                '&.Mui-focused fieldset': { 
                                    borderColor: isDarkMode ? '#ffffff' : '#2c2c2c',
                                    borderWidth: '1px', 
                                },
                                '& input': { 
                                    color: isDarkMode ? 'white' : '#2c2c2c',  
                                    fontSize: '0.9rem',
                                    '&::placeholder': {
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                                        opacity: 1,
                                    }
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                '&.Mui-focused': {
                                    color: isDarkMode ? '#ffffff' : '#2c2c2c',
                                }
                            }
                        }),
                    }),
                },
            },
        }
    }), [isDarkMode, mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};