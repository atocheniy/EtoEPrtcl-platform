import React, { useState, useRef, type ReactElement } from 'react';
import { TextField, MenuItem } from '@mui/material';
import { MotionMenu } from './MotionMenu';
import type { TextFieldProps } from '@mui/material/TextField';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface ChildProps {
    value: any;
    label?: string;
    children?: React.ReactNode;
    sx?: any;
}

type MotionTextFieldProps = Omit<TextFieldProps, 'select' | 'onChange'> & {
    value: any;
    onChange: (value: any) => void;
    children: React.ReactNode;
};


export const MotionTextField = ({ 
    label, 
    value, 
    onChange, 
    children, 
    sx, 
    ...props 
}: MotionTextFieldProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = () => {
        setAnchorEl(containerRef.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (newValue: any) => {
        onChange(newValue);
        handleClose();
    };

    const getDisplayValue = () => {
        const childrenArray = React.Children.toArray(children);
        const selectedChild = childrenArray.find(
            (child): child is ReactElement<ChildProps> => 
                React.isValidElement(child) && (child.props as ChildProps).value == value
        );

        if (!selectedChild) return '';
        if (selectedChild.props.label) return selectedChild.props.label;
        if (typeof selectedChild.props.children === 'string') return selectedChild.props.children;

        if (Array.isArray(selectedChild.props.children)) {
            const textNode = selectedChild.props.children.find(c => typeof c === 'string');
            if (textNode) return textNode;
            
            const typographyNode: any = selectedChild.props.children.find(
                (c: any) => React.isValidElement(c) && (c.props as any).children
            );
            if (typographyNode) return typographyNode.props.children;
        }

        return '';
    };

    return (
        <>
            <TextField
                {...props}
                select={false}
                ref={containerRef}
                label={label}
                value={getDisplayValue()} 
                onClick={handleOpen}
                autoComplete="off"
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <ArrowDropDownIcon 
                            sx={{ 
                                transition: 'transform 0.2s', 
                                transform: open ? 'rotate(180deg)' : 'none',
                                opacity: 0.5,
                                cursor: 'pointer'
                            }} 
                        />
                    )
                }}
                sx={{
                    cursor: 'pointer',
                    '& .MuiInputBase-input': { cursor: 'pointer' },
                    ...sx
                }}
            />

            <MotionMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{ 
                    minWidth: containerRef.current?.clientWidth || 200,
                    mt: 1 
                }}
            >
                {React.Children.map(children, (child) => {
                    if (!React.isValidElement(child)) return child;

                    const element = child as ReactElement<ChildProps>;

                    return React.cloneElement(element, {
                        onClick: () => handleSelect(element.props.value),
                        selected: element.props.value === value,
                        sx: {
                            ...element.props.sx,
                            fontWeight: element.props.value === value ? 600 : 400
                        }
                    } as any);
                })}
            </MotionMenu>
        </>
    );
};