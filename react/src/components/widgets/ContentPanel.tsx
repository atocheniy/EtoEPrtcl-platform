import { useState, useEffect } from 'react';
import * as React from 'react';

import { EditorView } from '@codemirror/view';


import { Box, Paper } from '@mui/material';
import 'katex/dist/katex.css'; 

import 'highlight.js/styles/github-dark.css'; 

import '../css/EditorStyles.css';
import 'remark-github-blockquote-alert/alert.css';


import { forwardRef, useImperativeHandle, useRef } from 'react';

import {Skeleton, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type { MarkdownCommand } from './ToolsPanel';
import { memo } from 'react';
import { useApplication } from '../context/ApplicationContext';
import ProjectSettings from './views/ProjectSettings';
import { ProjectService } from '../../services/projectService';
import { DCrypto } from '../../services/cryptoService';
import { ApplicationTheme, PerformanceMode, type Project } from '../../types/auth';

import type { Variants } from 'framer-motion';
import StartedSkeleton from './views/StartedSkeleton';
import PreviewView from './views/PreviewView';
import CodeMirrorEditorView from './views/CodeMirrorEditorView';

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
   const { isPreviewMode, content, onChange, isLoading, activeFileId, saveFile, isProjectSettinsOpen, setIsProjectSettinsOpen, handleCloseProject, onFileSelect } = props;
   const [value, setValue] = useState(content || "");
    const valueRef = useRef(value);
   const editorWrapperRef = useRef<HTMLDivElement>(null);
   const editorInstanceRef = useRef<any>(null);
   const [fontSize, setFontSize] = useState(16);
   const { projectData, masterKey, orbColors, refreshProjects, refreshProjectData } = useApplication();

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

    const handleChange = React.useCallback((val: string | undefined) => {
        const newValue = val || '';
        setValue(newValue);
        onChange(newValue);
    }, [onChange]);

    useImperativeHandle(ref, () => ({
        applyCommand: (command: MarkdownCommand) => {
            const view = editorInstanceRef.current?.view as EditorView; 
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
    ) : (<PreviewView fontSize={fontSize} handleChange={handleChange} onFileSelect={onFileSelect} valueRef={valueRef} value={value} editorWrapperRef={editorWrapperRef} activeFileId={activeFileId} />)
            ) : (<CodeMirrorEditorView fontSize={fontSize} readOnly={false} value={value} editorRef={editorInstanceRef} isImageContent={isImageContent} handleChange={handleChange} />)}
    <style>{`
            .w-md-editor-preview .wmde-markdown {
                font-size: ${fontSize}px !important;
            }
    `}</style>
  </div> </motion.div>) : (<StartedSkeleton panelVariants={panelVariants} primaryGlow={primaryGlow} />)}
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