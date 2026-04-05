import React from 'react';
import { Dialog, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { DialogProps } from '@mui/material/Dialog';
import { useEncryption } from '../context/EncryptionContext';
import { ApplicationTheme, PerformanceMode } from '../../types/auth';

const dialogVariants = {
  initial: { opacity: 0, scale: 0.9, y: 15, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 20 } 
  },
  exit: { 
    opacity: 0, scale: 0.9, y: 15, filter: 'blur(10px)',
    transition: { duration: 0.25, ease: "easeInOut" } 
  }
};

const MotionPaper = motion.create(Paper);

interface MotionDialogProps extends Omit<DialogProps, 'open'> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MotionBackdrop = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { open, ...other } = props;
    const {mode, currentTheme } = useEncryption();
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: currentTheme === ApplicationTheme.Dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: mode === PerformanceMode.Off ? 'blur(4px)' : undefined,
                WebkitBackdropFilter: mode === PerformanceMode.Off ? 'blur(4px)' : undefined,
                transition: 'background-color 0.3s ease',
                zIndex: -1,
            }}
            {...other}
        />
    );
});


export const MotionDialog = ({ open, onClose, children, ...props }: MotionDialogProps) => {
  const { mode } = useEncryption();
  const effectsEnabled = mode === PerformanceMode.Off;
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          {...props}
          open={true}
          onClose={onClose}
          TransitionComponent={!effectsEnabled ? undefined : undefined}
          transitionDuration={!effectsEnabled ? 225 : 0}
          slots={{
            backdrop: MotionBackdrop
          }}
          slotProps={{
            
            paper: {
              variant: 'DialogBlur',
              component: effectsEnabled ? MotionPaper : Paper,
              ...(effectsEnabled ? {
                initial: "initial",
                animate: "animate",
                exit: "exit",
                variants: dialogVariants
              } : {}),
              sx: {
                ...props.PaperProps?.sx,
              }
            } as any
          }}
        >
          {children}
        </Dialog>
      )}
    </AnimatePresence>
  );
};