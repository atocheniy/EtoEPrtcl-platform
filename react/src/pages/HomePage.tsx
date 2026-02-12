import { Box, Typography, Button, Container, Stack, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import AnimatedPage from '../components/AnimatedPage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CreateIcon from '@mui/icons-material/Create';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CodeIcon from '@mui/icons-material/Code';
import { motion } from 'framer-motion';
import type {Variants} from 'framer-motion';

const MotionBox = motion(Box);
const orbVariants: Variants = {
    animate: (i: number) => ({
        x: i === 1 ? [0, 100, -100, 0] : [0, -80, 80, 0], 
        y: i === 1 ? [0, -100, 50, 0] : [0, 50, -100, 0],
        scale: [1, 1.2, 0.8, 1],
        transition: {
            duration: i === 1 ? 15 : 18,
            repeat: Infinity,
            ease: "linear" as const
        }
    })
};
function HomePage() {
    const navigate = useNavigate();

    const features = [
    { icon: <CreateIcon />, title: "Управление проектами", desc: "Удобная разметка с мгновенным превью. Интерфейс не перегружен." },
    { icon: <CloudQueueIcon />, title: "Облачное хранилище", desc: "Облачная синхронизация позволяет работать над проектами с любого устройства в любое время." },
    { icon: <CodeIcon />, title: "Защита корпоративного уровня", desc: "E2EE-платформа с асимметричной подписью запросов." },
    // { icon: <CodeIcon />, title: "Поддержка кода", desc: "Поддержка GFM, подсветка синтаксиса и поддержка формул LaTeX." }
  ];

  return (
    <AnimatedPage>
       <Box className='mainContainer' sx={{ overflowY: 'auto', position: 'relative', bgcolor: '#080808' }}>
        
       <MotionBox
                    custom={1}
                    variants={orbVariants}
                    animate="animate"
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '5%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
                        filter: 'blur(90px)',
                        zIndex: 0,
                        pointerEvents: 'none' 
                    }}
                />

                <MotionBox
                    custom={2}
                    variants={orbVariants}
                    animate="animate"
                    sx={{
                        position: 'absolute',
                        bottom: '5%',
                        right: '2%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        zIndex: 0,
                        pointerEvents: 'none' 
                    }}
                />

        <Container maxWidth="lg" sx={{ pt: 15, pb: 10, position: 'relative', zIndex: 1 }}>
          
          {/* CARDS SECTION */}
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem' }, 
                fontWeight: 800, 
                background: 'linear-gradient(to right, #fff, #888)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}
            >
              Ваши идеи в <br /> идеальном формате
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', fontWeight: 400 }}
            >
              Мощный менеждер проектов с markdown-редактор для создания документации, заметок и кода. 
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  bgcolor: 'white', color: 'black', borderRadius: '14px', px: 4, py: 1.5,
                  fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                }}
              >
                Начать работу
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => window.open('https://github.com', '_blank')}
                sx={{ 
                  borderRadius: '14px', px: 4, borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                GitHub
              </Button>
            </Stack>
          </Stack>

          {/* FEATURES SECTION */}
          <Grid container spacing={4} sx={{ mt: 15 }}>
            {features.map((f, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 6,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <Box sx={{ color: 'white', mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {f.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          

          {/* FOOTER */}
          <Box sx={{ mt: 20, textAlign: 'center', opacity: 0.3 }}>
             <Typography variant="caption">
                © 2024 YourProject Name. Built with React & ASP.NET Core
             </Typography>
          </Box>

        </Container>
      </Box>
    </AnimatedPage>
  )
}

export default HomePage