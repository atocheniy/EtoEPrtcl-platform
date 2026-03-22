import React from 'react';
import { Popover, Paper, styled } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type {PopoverProps} from '@mui/material/Popover';
import type { Variants } from 'framer-motion';

const defaultVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 25 } 
  },
  exit: { 
    opacity: 0, scale: 0.95, y: 5, filter: 'blur(10px)',
    transition: { duration: 0.2 } 
  }
};

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

const MotionPaper = motion(Paper);

interface MotionPopoverProps extends PopoverProps {
  children: React.ReactNode;
}

export const MotionPopover = ({ 
  open, 
  anchorEl, 
  onClose, 
  children, 
  sx,
  ...props 
}: MotionPopoverProps) => {
  return (
    <AnimatePresence>
      {open && (
        <Popover
          {...props}
          open={true}
          anchorEl={anchorEl}
          onClose={onClose}
          transitionDuration={0}
          slotProps={{
            paper: {
              component: MotionPaper,
              initial: "initial",
              animate: "animate",
              exit: "exit",
              variants: menuAnimation,
               sx: {
                borderRadius: '20px', 
                background: 'rgba(43, 43, 43, 0.75)',
                backdropFilter: 'blur(15px) saturate(150%)', 
                WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)', 
                border: '1px solid rgba(75, 75, 75, 1)',
                overflow: 'hidden',
            } ,
            } as any
          }}
        >
          {children}
        </Popover>
      )}
    </AnimatePresence>
  );
};