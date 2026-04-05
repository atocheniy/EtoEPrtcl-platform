import React from 'react';
import { Box, Typography, Button, Container, Stack, Grid, alpha } from '@mui/material';
import { useNavigate } from 'react-router';
import CreateIcon from '@mui/icons-material/Create';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15 
    }
  }
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        p: '1px',
        borderRadius: 6,
        background: 'rgba(255, 255, 255, 0.05)',
        transition: '0.4s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 40%)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(156, 156, 156, 0.2), transparent 40%)',
          zIndex: 0,
          opacity: 0,
          transition: 'opacity 0.5s',
        },
        '&:hover::before': { opacity: 1 }
      }}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, bgcolor: '#0c0c0c', borderRadius: 'inherit', p: 4, height: '98.8%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: alpha('#b4b4b4', 0.1), color: '#b1b1b1', mb: 3, border: `1px solid ${alpha('#afafaf', 0.2)}` }}>
          {icon}
        </Box>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</Typography>
      </Box>
    </Box>
  );
};

function HomePage() {
  const navigate = useNavigate();

  const mainFeatures = [
    { icon: <CreateIcon />, title: "Управление проектами", desc: "Удобная разметка с просмотром. Интерфейс не перегружен." },
    { icon: <CloudQueueIcon />, title: "Облачное хранилище", desc: "Облачная синхронизация позволяет работать над проектами с любого устройства в любое время." },
    { icon: <CodeIcon />, title: "Защита шифованием на стороне клиента", desc: "E2EE-платформа с асимметричной подписью запросов." },
  ];

  const secondaryFeatures = [
    { icon: <StorageIcon fontSize="small" />, text: "Шифрованные данные на сервере" },
    { icon: <SpeedIcon fontSize="small" />, text: "Высокая скорость работы" },
    { icon: <SecurityIcon fontSize="small" />, text: "Открытый исходный код" },
    { icon: <CheckCircleOutlineIcon fontSize="small" />, text: "Без рекламы" },
  ];

  
  return (

        <Box sx={{overflowY: 'visible', width: "100%"}}>
      <Box sx={{ position: 'relative', bgcolor: '#080808', color: 'white',  overflowX: 'hidden', minHeight: '100vh' }}>
        

        <Container style={{maxWidth: "1400px"}} sx={{ pt: { xs: 10, md: 15 }, position: 'relative', zIndex: 1 }}>
          
          <Stack  component={motion.div} 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}  spacing={4} alignItems="center" textAlign="center" sx={{ mb: 10, mt: 5 }}>

            <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 800, background: 'linear-gradient(180deg, #FFF 30%, rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, letterSpacing: '-0.04em' }}>
              Платформа для управления проектами
            </Typography>
            
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: '650px', fontWeight: 400 }}>
               Мощный менеждер проектов с markdown-редактор для создания документации, заметок и кода. 
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" size="large" onClick={() => navigate('/login')} sx={{ bgcolor: 'white', color: 'black', borderRadius: '14px', px: 5, py: 2, fontWeight: 700, '&:hover': { bgcolor: '#f0f0f0' } }}>Начать работу</Button>
              <Button variant="outlined" size="large" startIcon={<GitHubIcon />} onClick={() => window.open('https://github.com/atocheniy/EtoEPrtcl-platform/tree/main', '_blank')} sx={{ borderRadius: '14px', px: 4, borderColor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.5)' } }}>GitHub</Button>
            </Stack>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 15 }}>
            {mainFeatures.map((f, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ py: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Grid container spacing={4} justifyContent="center">
                {secondaryFeatures.map((item, idx) => (
                    <Grid key={idx} size={{ xs: 6, md: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            <Box sx={{ color: '#bbbbbb' }}>{item.icon}</Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.text}</Typography>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
          </Box>

        </Container>
      </Box>
      </Box>

  );
}

export default HomePage;