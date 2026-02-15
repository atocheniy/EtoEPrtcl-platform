import { useState, useEffect, useMemo } from 'react';

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

import remarkGemoji from 'remark-gemoji';

import remarkBreaks from 'remark-breaks';

import { remarkAlert } from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import rehypeRaw from 'rehype-raw';

import { forwardRef, useImperativeHandle, useRef } from 'react';

import {Skeleton, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type { MarkdownCommand } from './ToolsPanel';
import { memo } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardIcon from '@mui/icons-material/Keyboard';

import Grid from '@mui/material/Grid';

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
}
const ContentPanel = memo(forwardRef<ContentPanelHandle, ContentPanelProps>((props, ref) => { 
   const { isPreviewMode, content, onChange, isLoading, activeFileId } = props;
   const [value, setValue] = useState(content || "");
   const editorWrapperRef = useRef<HTMLDivElement>(null);
   const editorRef = useRef<any>(null);

   const editorTheme = useMemo(() => EditorView.theme({
        "&": {
            height: "100%",
            fontSize: "16px",
            backgroundColor: "transparent !important" 
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
            backgroundColor: "#ffffff !important",
            opacity: "1 !important",
        },
        ".cm-content ::selection": {
            color: "#000000 !important",
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
        },
        ".cm-content": {
            maxWidth: "900px", 
            margin: "0 auto", 
            paddingBottom: "80px",
            background: "rgb(20, 20, 20)",
            borderRadius: "10px"
        },
        ".cm-gutters": {
            display: "none"
        },
        "&.cm-focused": {
            outline: "none"
        }
   }), []);

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
                case 'bold': insertBefore = "**"; insertAfter = "**"; break;
                case 'italic': insertBefore = "*"; insertAfter = "*"; break;
                case 'code': insertBefore = "`"; insertAfter = "`"; break;
                case 'quote': insertBefore = "> "; break;
                case 'ul': insertBefore = "- "; break;
                case 'ol': insertBefore = "1. "; break;
                case 'todo': insertBefore = "- [ ] "; break;
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

     const handleChange = (val: string | undefined) => {
        const newValue = val || '';
        setValue(newValue);
        onChange(newValue);
    };
    
  return (
    <>
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
            
            bgcolor: 'rgb(20, 20, 20, 0.7)',
            border: '1px solid rgb(27, 27, 27)'
        }}
        >
            
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

{activeFileId ?  
           ( <div ref={editorWrapperRef} data-color-mode="dark" style={{ width: '100%', height: "100%", opacity: isLoading ? 0 : 1, flex: 1, minHeight: 0, transition: 'opacity 0.3s ease'}}>
    {isPreviewMode ? (
    
            <MDEditor
                value={value} 
                height="100%"
                minHeight={500}
      preview={"preview"}
       previewOptions={{
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
      }}
      visibleDragbar={false}
      hideToolbar={true} 
      textareaProps={{
        placeholder: 'Введите текст...'
      }}
                        />
            ) : (
                <CodeMirror
                    value={value}
                    ref={editorRef}
                    height="100%"
                    theme={githubDark}
                    extensions={[
                        markdown({ base: markdownLanguage }),
                        EditorView.lineWrapping, 
                        githubDark,
                        editorTheme
                    ]}
                    onChange={handleChange}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false,
                        autocompletion: false
                    }}
                    style={{ height: '100%' }}
                />
            )}
    <style>{`
            .w-md-editor, 
  .w-md-editor-content, 
  .w-md-editor-bar, 
  .w-md-editor-preview,
  .wmde-markdown {
      background-color: transparent !important;
      
  }

      
      ::-webkit-scrollbar { 
        width: 8px;
      }

      ::-webkit-scrollbar-thumb {
        background-color: #363636ff;    
        border-radius: 8px;    
      }

      .w-md-editor-text {
                            max-width: 900px;
                            margin: 0 auto; 
                            width: 100%;    
                            padding-top: 90px;
                            padding-bottom: 80px;
                        }

                         .w-md-editor-preview .wmde-markdown {
                           content-visibility: auto;
  contain-intrinsic-size: 1px 5000px;
                            max-width: 900px;
                            width: 100%;
                            margin: 0 auto; 
                            padding-top: 90px;
                            padding-bottom: 80px;
                            font-family: Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans;
                        }
      .markdown-alert .markdown-alert-title { color: inherit; }
                        .wmde-markdown table { width: 100%; border-collapse: collapse; }

                        .cm-scroller::-webkit-scrollbar { 
        width: 8px;
    }

    .cm-scroller::-webkit-scrollbar-thumb {
        background-color: #363636ff;    
        border-radius: 8px;    
    }

    .wmde-markdown {
 
}

    `}</style>
  </div>) : (<Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        width: '100%',
        p: 4,
        zIndex: 1 
    }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'rgba(255,255,255,0.9)', letterSpacing: -1 }}>
            Выберите файл для работы
        </Typography>

        <Grid container spacing={3} sx={{ maxWidth: '850px', width: '100%' }}>
            {[
                { 
                    title: 'Редактор', 
                    desc: 'Полноценная поддержка Markdown с мгновенным превью.', 
                    icon: <DescriptionIcon sx={{ color: '#818cf8' }} />,
                    color: 'rgba(129, 140, 248, 0.1)'
                },
                { 
                    title: 'Безопасность', 
                    desc: 'Ваши данные зашифрованы ключом AES-256 прямо в браузере.', 
                    icon: <ShieldIcon sx={{ color: '#4ade80' }} />,
                    color: 'rgba(74, 222, 128, 0.1)'
                },
                { 
                    title: 'Проекты', 
                    desc: 'Организуйте файлы в иерархические структуры и делитесь ими.', 
                    icon: <AutoAwesomeIcon sx={{ color: '#fbbf24' }} />,
                    color: 'rgba(251, 191, 36, 0.1)'
                },
                { 
                    title: 'Клавиши', 
                    desc: 'Используйте Ctrl+S для сохранения и Ctrl+Alt+P для превью.', 
                    icon: <KeyboardIcon sx={{ color: '#f87171' }} />,
                    color: 'rgba(248, 113, 113, 0.1)'
                }
            ].map((card, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: 5,
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(10px)',
                            transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                            }
                        }}
                    >
                        <Box sx={{ 
                            width: 48, height: 48, borderRadius: 3, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: card.color
                        }}>
                            {card.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                            {card.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                            {card.desc}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>)}
        </Paper>

    </>
  )
}), (prevProps, nextProps) => {
    return (
        prevProps.content === nextProps.content &&
        prevProps.isPreviewMode === nextProps.isPreviewMode &&
        prevProps.isLoading === nextProps.isLoading
    );
});

export default ContentPanel;