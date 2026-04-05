import { Menu, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type {MenuProps} from '@mui/material/Menu';
import { useEncryption } from '../context/EncryptionContext';
import { PerformanceMode } from '../../types/auth';

const menuAnimation = {
  initial: { 
    opacity: 0, 
    scale: 0.52, 
    filter: 'blur(20px)',
    y: 10 ,
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.52, 
    filter: 'blur(20px)', 
    transition: { duration: 0.2 } 
  }
};

const MotionPaper = motion.create(Paper);

interface MotionMenuProps extends Omit<MenuProps, 'open'> {
  open: boolean;
}

export const MotionMenu = ({ open, anchorEl, onClose, children, sx, ...props }: MotionMenuProps) => {
  const { mode } = useEncryption();
  const effectsEnabled = mode === PerformanceMode.Off;
  return (
    <AnimatePresence>
      {open && (
        <Menu
          {...props}
          open={true}
          anchorEl={anchorEl}
          onClose={onClose}
          TransitionComponent={!effectsEnabled ? undefined : undefined}
          transitionDuration={!effectsEnabled ? 225 : 0}
          slotProps={{
            paper: {
              variant: 'MenuBlur',
              component: effectsEnabled ? MotionPaper : Paper,
              ...(effectsEnabled ? {
                initial: "initial",
                animate: "animate",
                exit: "exit",
                variants: menuAnimation
              } : {}),
               sx: {
                ...sx
            } ,
            } as any
          }}
        >
          {children}
        </Menu>
      )}
    </AnimatePresence>
  );
};