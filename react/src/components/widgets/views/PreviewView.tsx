import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import MDEditor from '@uiw/react-md-editor';
import rehypeHighlight from 'rehype-highlight';
import remarkGemoji from 'remark-gemoji';
import remarkBreaks from 'remark-breaks';
import { remarkAlert } from 'remark-github-blockquote-alert';
import { useApplication } from '../../context/ApplicationContext';
import { ApplicationTheme } from '../../../types/auth';
import { Box } from '@mui/material';
import { useCallback, useMemo } from 'react';
import React from 'react';
import LinkIcon from '@mui/icons-material/Link';


interface PreviewViewProps {
    fontSize: number;
    handleChange: (val: string | undefined) => void;
    onFileSelect: (fileId: string) => void;
    valueRef: React.RefObject<string>;
    value: string;
    editorWrapperRef: React.RefObject<HTMLDivElement | null>;
    activeFileId?: string | null; 
}

function PreviewView({ fontSize, handleChange, onFileSelect, valueRef, value, editorWrapperRef, activeFileId }: PreviewViewProps) {
    const { currentTheme, projectFiles, orbColors } = useApplication();

     const toggleMarkdownCheckbox = useCallback((targetIndex: number) => {
            const currentText = valueRef.current;
            const lines = currentText.split('\n');
            
            let matchCount = 0;
            let inCodeBlock = false;
            
            const newLines = lines.map(line => {
                 const codeBlockMatch = line.trim().match(/^(`{3,}|~{3,})/);
                 if (codeBlockMatch) {
                     inCodeBlock = !inCodeBlock;
                     return line;
                 }
                 if (inCodeBlock) return line;
                 const checkboxRegex = /^(\s*>*\s*[-*+]\s+)\[([ xX])\](.*)/;
                 const match = line.match(checkboxRegex);
                 
                 if (match) {
                     if (matchCount === targetIndex) {
                         const isChecked = match[2] !== ' ';
                         const newChar = isChecked ? ' ' : 'x';
                         matchCount++;
                         return `${match[1]}[${newChar}]${match[3]}`;
                     }
                     matchCount++;
                 }
                 return line;
            });
            
            const newValue = newLines.join('\n');
            if (newValue !== currentText) {
                handleChange(newValue);
            }
        }, []);

    const renderTextWithTags = (text: string, orbColors: [string, string]) => {
        const parts = text.split(/(\[\[.+?\]\]|#[\wа-яА-ЯёЁ]+)/g);
        
        return parts.map((part, i) => {
            if (part.startsWith('#')) {
                return (
                    <Box
                        key={i}
                        component="span"
                        sx={{
                            color: orbColors[0].replace(/[\d.]+\)$/g, '1)'), 
                            bgcolor: orbColors[1].replace(/[\d.]+\)$/g, '0.05)'), 
                            px: 0.8,
                            py: 0.2,
                            mx: 0.3,
                            borderRadius: '6px',
                            fontSize: '0.85em',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-block',
                            transition: '0.2s',
                            border: `1px solid ${orbColors[1].replace(/[\d.]+\)$/g, '0.1)')}`,
                            '&:hover': {
                                bgcolor: orbColors[1].replace(/[\d.]+\)$/g, '0.1)'),
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        {part}
                    </Box>
                );
            }
            if (part.startsWith('[[') && part.endsWith(']]')) {
                const fileName = part.slice(2, -2);
                const targetFile = projectFiles.find(f => f.name === fileName);
                
                return (
                    <Box
                        key={i}
                        component="span"
                        onClick={() => targetFile && onFileSelect(targetFile.id)}
                        sx={{
                            bgcolor: 'rgba(74, 222, 128, 0.1)',
                            px: 0.8, py: 0.1, mx: 0.3,
                            borderRadius: '6px',
                            fontSize: '0.9em',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            transition: '0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(74, 222, 128, 0.2)',
                                transform: 'translateY(-1px)'
                            },
                            color: targetFile ? '#4ade80' : '#ff7070',
                            cursor: targetFile ? 'pointer' : 'help',
                        }}
                    >
                        <LinkIcon sx={{ fontSize: '0.9em', mr: 0.5, opacity: 0.7 }} />
                        {fileName}
                    </Box>
                );
            }
            return part;
        });
    };   

    const mdxComponents = useMemo(() => ({
        table: ({ children }: any) => (
            <div className="table-container">
                <table>{children}</table>
            </div>
        ),
        p: ({ children }: any) => (
            <p>
                {React.Children.map(children, child => 
                    typeof child === 'string' ? renderTextWithTags(child, orbColors) : child
                )}
            </p>
        ),
        input: (props: any) => {
            if (props.type === 'checkbox') {
                return (
                    <input 
                        {...props} 
                        checked={!!props.checked}
                        disabled={false} 
                        readOnly 
                        style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }} 
                        onClick={(e) => {
                            e.stopPropagation();
                            const container = editorWrapperRef.current;
                            if (!container) return;
                            const allCheckboxes = Array.from(container.querySelectorAll('.wmde-markdown input[type="checkbox"]'));
                            const index = allCheckboxes.indexOf(e.target as HTMLInputElement);
                            
                            if (index !== -1) {
                                toggleMarkdownCheckbox(index);
                            }
                        }}
                    />
                );
            }
            return <input {...props} />;
        }
    }), [activeFileId, toggleMarkdownCheckbox, orbColors]);

    return(
         <MDEditor
            data-color-mode={currentTheme === ApplicationTheme.Dark ? "dark" : "light"}
                key={`preview-${activeFileId}`}
                value={value} 
                height="100%"
                minHeight={500}
      preview={"preview"}
       previewOptions={{
        components: mdxComponents,
                            remarkPlugins: [
                                remarkGfm,    
                                remarkMath,    
                                remarkGemoji, 
                                remarkBreaks,  
                                remarkAlert,   
                            ],
                            
                          
                            rehypePlugins: [
                                rehypeKatex,    
                                rehypeHighlight,
                                rehypeSlug,    
                                rehypeAutolinkHeadings, 
                                rehypeRaw     
                            ]
                        }}
                        style={{
        backgroundColor: 'transparent', 
        border: 'none',             
        boxShadow: 'none',
        height: "100%",
        fontSize: `${fontSize}px`
      }}
      visibleDragbar={false}
      hideToolbar={true} 
      textareaProps={{
        placeholder: 'Введите текст...'
      }}
                        />
    );
}

export default PreviewView;