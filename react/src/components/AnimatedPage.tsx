import { motion } from 'framer-motion';
import type { ReactNode } from 'react'; 
import { useEncryption } from './context/EncryptionContext';
import { ApplicationTheme } from '../types/auth';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.99,
    },
};

const pageTransition = {
    type: 'spring',
    stiffness: 420,
    damping: 38,
    mass: 0.8,
} as const;

interface AnimatedPageProps {
    children: ReactNode;
}

const AnimatedPage = ({ children }: AnimatedPageProps) => {
    const { currentTheme } = useEncryption();
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                overflow: 'hidden',
                willChange: 'transform, opacity',
                backgroundColor: currentTheme === ApplicationTheme.Dark ? 'rgb(10, 10, 10)' : 'rgb(230, 230, 230)',
                transition: 'background-color 0.3s ease',
            }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;