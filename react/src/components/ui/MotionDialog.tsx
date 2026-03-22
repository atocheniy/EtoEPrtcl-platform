import React from 'react';
import { Dialog, Paper, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { DialogProps } from '@mui/material/Dialog';

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

const MotionPaper = motion(Paper);

interface MotionDialogProps extends Omit<DialogProps, 'open'> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MotionBackdrop = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { open, ...other } = props;
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: -1,
            }}
            {...other}
        />
    );
});


export const MotionDialog = ({ open, onClose, children, ...props }: MotionDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          {...props}
          open={true}
          onClose={onClose}
          transitionDuration={0}
          slots={{
            backdrop: MotionBackdrop
          }}
          slotProps={{
            
            paper: {
              component: MotionPaper,
              initial: "initial",
              animate: "animate",
              exit: "exit",
              variants: dialogVariants,
              sx: {
                borderRadius: '24px',
                bgcolor: 'rgba(20, 20, 20, 0.5)',
                backdropFilter: 'blur(20px) saturate(160%)',
                backgroundImage: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.5)',
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