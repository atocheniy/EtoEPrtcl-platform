import { motion, type Variants } from "framer-motion";
import { ApplicationTheme, PerformanceMode } from "../../../types/auth";
import { useApplication } from "../../context/ApplicationContext";
import { Box, Skeleton, Stack } from "@mui/material";

interface StartedSkeletonProps {
    panelVariants: Variants;
    primaryGlow: string;
}

function StartedSkeleton({ panelVariants, primaryGlow }: StartedSkeletonProps) {
    const { currentTheme, mode } = useApplication();
    const glowAnimation = `
    @keyframes borderPulse {
        0% { box-shadow: inset 0 0 30px rgba(255,255,255,0.02); }
        50% { box-shadow: inset 0 0 60px var(--glow-color); }
        100% { box-shadow: inset 0 0 30px rgba(255,255,255,0.02); }
    }
    `;

    return(
        <motion.div
                    key={mode === PerformanceMode.Off ? "empty-state" : undefined}
                    variants={ mode === PerformanceMode.Off ? panelVariants : undefined}
                    initial={mode === PerformanceMode.Off ? "initial" : undefined}
                    animate={mode === PerformanceMode.Off ? "animate" : undefined}
                    exit={mode === PerformanceMode.Off ? "exit" : undefined}
                    style={{ width: '100%', height: '100%' }}
                >
    <Box sx={{ 
            height: '100%', 
            width: '100%', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '--glow-color': primaryGlow,
            animation: mode === PerformanceMode.Off ? 'borderPulse 8s infinite ease-in-out' : 'none',
            borderRadius: 3, 
        }}>
            <style>{glowAnimation}</style>

            <Box sx={{ 
                width: '100%', 
                maxWidth: '1100px', 
                opacity: 0.3, 
                userSelect: 'none',
                pointerEvents: 'none',
                px: 4
            }}>
                <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="60%" height={60} sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)', mb: 4 }} />
    
    <Stack spacing={2.5}>
        <Box>
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="100%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="95%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="40%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
        </Box>

        <Box sx={{ borderLeft: '4px solid rgba(255,255,255,0.1)', pl: 3, my: 2 }}>
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="80%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false}  variant="text" width="70%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5, bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.08)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="30%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5, bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.08)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="50%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
        </Stack>

        <Box sx={{ pt: 2 }}>
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="100%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="85%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
        </Box>
         <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5, bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.08)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="30%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5, bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.08)' : 'rgba(58, 58, 58, 0.29)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="50%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.06)' : 'rgba(58, 58, 58, 0.29)' }} />
        </Stack>

        <Box sx={{ pt: 2 }}>
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="100%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
            <Skeleton animation = {mode === PerformanceMode.Off ? "wave" : false} variant="text" width="85%" sx={{ bgcolor: currentTheme === ApplicationTheme.Dark ? 'rgba(255,255,255,0.04)' : 'rgba(58, 58, 58, 0.1)' }} />
        </Box>
    </Stack>
            </Box>

            
        </Box></motion.div>
    );
}

export default StartedSkeleton;