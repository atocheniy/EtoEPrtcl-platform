import { useState, useEffect, useMemo, useCallback } from 'react';
import * as React from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { githubDark } from '@uiw/codemirror-theme-github'; 
import { EditorView } from '@codemirror/view';

import MDEditor from '@uiw/react-md-editor';
import { Box, Paper, Typography } from '@mui/material';

import remarkGfm from 'remark-gfm';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.css'; 

import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; 

import '../css/EditorStyles.css';

import remarkGemoji from 'remark-gemoji';

import remarkBreaks from 'remark-breaks';

import { remarkAlert } from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import rehypeRaw from 'rehype-raw';

import ImageIcon from '@mui/icons-material/Image';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import {Skeleton, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type { MarkdownCommand } from './ToolsPanel';
import { memo } from 'react';

import { githubLight } from '@uiw/codemirror-theme-github';
import { useApplication } from '../context/ApplicationContext';
import ProjectSettings from './views/ProjectSettings';
import { ProjectService } from '../../services/projectService';
import { DCrypto } from '../../services/cryptoService';
import { ApplicationTheme, PerformanceMode, type Project } from '../../types/auth';
import LinkIcon from '@mui/icons-material/Link';

import type { Variants } from 'framer-motion';

const panelVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10, 
    filter: 'blur(10px)', 
    scale: 0.99 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)', 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    filter: 'blur(10px)', 
    scale: 0.99,
    transition: { 
      duration: 0.2, 
      ease: "easeIn" 
    } 
  }
};

export const EditorSkeleton = () => {
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '900px', 
      margin: '0 auto', 
      pt: '90px',
      px: 2 ,
      bgcolor: "rgba(255, 255, 255, 0)"
    }}>
      <Stack spacing={2}>
        <Skeleton 
          variant="rectangular" 
          width="40%" 
          height={40} 
          sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)', mb: 4 }} 
        />
        
        {[...Array(18)].map((_, i) => (
          <Skeleton 
            key={i}
            variant="text" 
            width={`${Math.floor(Math.random() * 35 + 60)}%`}
            sx={{ fontSize: '1.2rem', bgcolor: 'rgba(255,255,255,0.05)' }} 
          />
        ))}

        <Skeleton variant="text" width="30%" sx={{ fontSize: '1.2rem', bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Stack>
    </Box>
  );
};

export interface ContentPanelHandle {
    applyCommand: (command: MarkdownCommand) => void;
}

interface ContentPanelProps {
    isPreviewMode: boolean;
    content: string;
    onChange: (val: string) => void;
    isLoading?: boolean;
    activeFileId?: string | null; 
    saveFile: () => Promise<boolean>;
    isProjectSettinsOpen: boolean;
    setIsProjectSettinsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleCloseProject: () => void;
    onFileSelect: (fileId: string) => void;
    readOnly: boolean;
}
const ContentPanel = memo(forwardRef<ContentPanelHandle, ContentPanelProps>((props, ref) => { 
   const { isPreviewMode, content, onChange, isLoading, activeFileId, saveFile, isProjectSettinsOpen, setIsProjectSettinsOpen, handleCloseProject, onFileSelect, readOnly } = props;
   const [value, setValue] = useState(content || "");
    const valueRef = useRef(value);
   const editorWrapperRef = useRef<HTMLDivElement>(null);
   const editorRef = useRef<any>(null);
   const [fontSize, setFontSize] = useState(16);
   const { projectData, masterKey, orbColors, refreshProjects, refreshProjectData, projectFiles } = useApplication();

   const { currentProjectKey } = useApplication();
    const { mode, currentTheme } = useApplication();

    const glowAnimation = `
  @keyframes borderPulse {
    0% { box-shadow: inset 0 0 30px rgba(255,255,255,0.02); }
    50% { box-shadow: inset 0 0 60px var(--glow-color); }
    100% { box-shadow: inset 0 0 30px rgba(255,255,255,0.02); }
  }
`;

const primaryGlow = orbColors[0].replace(/[\d.]+\)$/g, currentTheme === ApplicationTheme.Dark ? '0.15)' : '0.2)');

   useEffect(() => {
       valueRef.current = value;
   }, [value]);

   const editorTheme = useMemo(() => EditorView.theme({
        "&": {
            height: "100%",
            fontSize: `${fontSize}px`,
            backgroundColor: "transparent !important" ,
            transition: "font-size 0.1s ease"
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
            backgroundColor: "#ffffff !important",
            opacity: "1 !important",
        },
        ".cm-content ::selection": {
            color: `${orbColors[1].replace(/[\d.]+\)$/g, '0.8)')} !important`,
            backgroundColor: "transparent !important",
        },
        "&.cm-focused .cm-selectionLayer .cm-selectionBackground": {
            backgroundColor: "#ffffff !important",
        },
        ".cm-scroller": {
            fontFamily: "'JetBrains Mono', 'Consolas', 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace",
            lineHeight: "1.6",
            paddingTop: "90px",
            height: "100% !important",
            overflow: "auto !important", 
            paddingBottom: "90px",
        },
        ".cm-content": {
            maxWidth: "900px", 
            margin: "0 auto", 
            paddingBottom: "80px",
            background: currentTheme === ApplicationTheme.Dark ? "rgb(20, 20, 20)" : "rgb(245, 245, 245)",
            borderRadius: "10px",
            transition: "background-color 0.3s",
        },
        ".cm-gutters": {
            display: "none"
        },
        "&.cm-focused": {
            outline: "none"
        }
   }), [fontSize, currentTheme, orbColors]);

    const extensions = useMemo(() => [
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping, 
        currentTheme === ApplicationTheme.Dark ? githubDark : githubLight, 
        editorTheme,
    ], [editorTheme]);

    useImperativeHandle(ref, () => ({
        applyCommand: (command: MarkdownCommand) => {
            const view = editorRef.current?.view as EditorView;
            if (!view) return;

            const { state, dispatch } = view;
            const { from, to } = state.selection.main;
            const selectedText = state.sliceDoc(from, to);

            let insertBefore = "";
            let insertAfter = "";

            switch (command) {
                case 'H': insertBefore = "# "; insertAfter = ""; break;
                case 'bold': insertBefore = "**"; insertAfter = "**"; break;
                case 'italic': insertBefore = "*"; insertAfter = "*"; break;
                case 'code': insertBefore = "```\n"; insertAfter = "\n```"; break;
                case 'quote': insertBefore = "> "; break;
                case 'ul': insertBefore = "- "; break;
                case 'ol': insertBefore = "1. "; break;
                case 'todo': insertBefore = "- [ ] "; break;
                case 'table': 
                        insertBefore = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |\n`; 
                        break;
                case 'link': insertBefore = "["; insertAfter = "](url)"; break;
                case 'image': insertBefore = "!["; insertAfter = "](img_url)"; break;
            }

            dispatch({
                changes: { from, to, insert: `${insertBefore}${selectedText}${insertAfter}` },
                selection: { anchor: from + insertBefore.length, head: to + insertBefore.length },
                userEvent: "input.type"
            });

            view.focus();
        }
    }));

    useEffect(() => { setValue(content || ""); }, [content]);

    useEffect(() => {
       const element = editorWrapperRef.current;
       if (!element) return;

       const handleWheel = (e: WheelEvent) => {
           if (e.ctrlKey) {
               e.preventDefault(); 

               if (e.deltaY < 0) {
                   setFontSize((prev) => Math.min(prev + 1, 40));
               } else {
                   setFontSize((prev) => Math.max(prev - 1, 10));
               }
           }
       };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();

                console.log("Сохранение файла:", activeFileId);
                saveFile(); 
            }
        };

       element.addEventListener('wheel', handleWheel, { passive: false });
       element.addEventListener('keydown', handleKeyDown);

        return () => {
            element.removeEventListener('wheel', handleWheel);
            element.removeEventListener('keydown', handleKeyDown);
        };
   }, [activeFileId, isLoading]);

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

     

     const handleChange = useCallback((val: string | undefined) => {
        const newValue = val || '';
        setValue(newValue);
        onChange(newValue);
    }, [onChange]);
    
    const isImageContent = content.startsWith('data:image/');
    const showGlow = !activeFileId && !isProjectSettinsOpen;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Paper
        elevation={0}
        sx={{
            width: 'calc(100% - 8px)', 
            m: 1,
            ml: 0,           
            p: 0,        
            pt: 0,      
            pb: 0, 
            borderRadius: 3,       
            height: 'calc(100vh - 16px)',
            display: 'flex',
            position: 'relative',
            
            background: currentTheme === ApplicationTheme.Dark ? `linear-gradient(to bottom, 
      rgb(20, 20, 20) 0px, 
      rgb(20, 20, 20) 50px, 
      rgba(20, 20, 20, 0.7) 51px, 
      rgba(20, 20, 20, 0.7) 100%)` : 
      `linear-gradient(to bottom, 
      rgba(255, 255, 255, 0.8) 0px, 
      rgba(255, 255, 255, 0.8) 50px,
      rgba(255, 255, 255, 0.5) 51px,
      rgba(255, 255, 255, 0.5) 100%)`,
            border: currentTheme === ApplicationTheme.Dark ? '1px solid rgb(27, 27, 27)' : '1px solid rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            '--glow-color': primaryGlow,
           '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0,
            
            animation: mode === PerformanceMode.Off ? 'borderPulse 8s infinite ease-in-out' : 'none',
            
            opacity: showGlow ? 1 : 0, 
            transition: 'opacity 1.5s ease-in-out, background-color 0.3s, border-color 0.3s', 
            
        }
        }}
        ><style>{glowAnimation}</style>
            
             <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 5,
              backgroundColor: 'rgba(27, 27, 27, 0.17)', 
            }}
          >
            <EditorSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

 <AnimatePresence mode="wait"> 
    {isProjectSettinsOpen ? (
         <motion.div
                    key={mode === PerformanceMode.Off ? "project-settings" : undefined}
                    variants={mode === PerformanceMode.Off ? panelVariants : undefined}
                    initial={mode === PerformanceMode.Off ? "initial" : undefined}
                    animate={mode === PerformanceMode.Off ? "animate" : undefined}
                    exit={mode === PerformanceMode.Off ? "exit" : undefined}
                    style={{ width: '100%', height: '100%', overflowY: 'auto' }}
                >
            <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%',
        overflowY: 'auto'
    }}>
        {projectData.id === "123" ? (
            <EditorSkeleton />
        ) : (
            <ProjectSettings 
                projectData={projectData as Project} 
                onClose={() => {
                    setIsProjectSettinsOpen(false); 
                }} 
                onSave={ async (updatedData) => {
                    if (!masterKey || !currentProjectKey) return;

                     try {
                        const encrypted = await DCrypto.encrypt(updatedData.name, currentProjectKey);

                        if (updatedData.isPublic) {
                            const rawKey = await window.crypto.subtle.exportKey("raw", currentProjectKey);
                            
                            const publicMasterKey = await DCrypto.deriveMasterKey("PUBLIC_ACCESS", projectData.id);
                            const wrapped = await DCrypto.encrypt(DCrypto.bufferToBase64(rawKey), publicMasterKey);

                            updatedData.publicEncryptedKey = wrapped.content;
                            updatedData.publicKeyIv = wrapped.iv;
                        }

                        await ProjectService.updateProject({
                            id: updatedData.id,
                            name: encrypted.content,
                            iv: encrypted.iv,
                            isPublic: updatedData.isPublic,
                            priority: updatedData.priority,
                            status: updatedData.status,
                            publicEncryptedKey: updatedData.publicEncryptedKey,
                            publicKeyIv: updatedData.publicKeyIv,
                        });

                        await refreshProjects();
                        await refreshProjectData();
                        setIsProjectSettinsOpen(false);
                    } catch (error) {
                        console.error("Не удалось обновить настройки проекта:", error);
                    }
                }}
                onDelete={async (id) => {
                    try {
                        await ProjectService.deleteProject(id);
                        await refreshProjects(); 
                        
                        handleCloseProject();
                        setIsProjectSettinsOpen(false);

                    } catch (error) {
                        console.error("Ошибка при удалении проекта:", error);
                    }
                }}
            />
        )}
    </Box>
    </motion.div>
    ) : activeFileId ?  
           (  <motion.div
                    key={mode === PerformanceMode.Off ? `file-${activeFileId}` : undefined}
                    variants={mode === PerformanceMode.Off ? panelVariants : undefined}
                    initial={mode === PerformanceMode.Off ? "initial" : undefined}
                    animate={mode === PerformanceMode.Off ? "animate" : undefined}
                    exit={mode === PerformanceMode.Off ? "exit" : undefined}
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                > <div key={activeFileId} ref={editorWrapperRef} data-color-mode="dark" style={{ width: '100%', height: "100%", opacity: isLoading ? 0 : 1, flex: 1, minHeight: 0, transition: 'opacity 0.3s ease', fontSize: `${fontSize}px` }}>

    {isPreviewMode ? (
    
    isImageContent ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
            <img 
                src={value} 
                alt="Просмотр" 
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' }} 
            />
        </Box>
    ) : (
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
                        />)
            ) : (
                isImageContent ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.5 }}>
            <ImageIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography>Это изображение. Переключитесь в режим превью, чтобы посмотреть его.</Typography>
        </Box>
    ) : (
                <CodeMirror
                    value={value}
                    ref={editorRef}
                    readOnly={readOnly}
                    height="100%"
                    theme={currentTheme === ApplicationTheme.Dark ? githubDark : githubLight}
                    extensions={extensions}
                    onChange={handleChange}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false,
                        autocompletion: false
                    }}
                    style={{ height: '100%' }}
                />
    )
            )}
    <style>{`
            .w-md-editor-preview .wmde-markdown {
                font-size: ${fontSize}px !important;
            }
    `}</style>
  </div> </motion.div>) : (
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

            
        </Box></motion.div> )}
         </AnimatePresence>
        </Paper>

    </div>
  )
}), (prevProps, nextProps) => {
    return (
        prevProps.content === nextProps.content &&
        prevProps.isPreviewMode === nextProps.isPreviewMode &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.activeFileId === nextProps.activeFileId &&
        prevProps.isProjectSettinsOpen === nextProps.isProjectSettinsOpen
    );
});

export default ContentPanel;