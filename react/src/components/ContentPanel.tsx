import { useEffect , useState } from 'react';

import MDEditor from '@uiw/react-md-editor';
import { Paper } from '@mui/material';

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

export interface ContentPanelHandle {
    getTextarea: () => HTMLTextAreaElement | null | undefined;
}

interface ContentPanelProps {
    isPreviewMode: boolean;
    content: string;
    onChange: (val: string) => void;
}
const ContentPanel = forwardRef<ContentPanelHandle, ContentPanelProps>((props, ref) => { 
   const { isPreviewMode, content, onChange } = props;
   const [value, setValue] = useState(content || "");
   const editorWrapperRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getTextarea: () => {
            return editorWrapperRef.current?.querySelector('textarea');
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
            borderRadius: 2,       
            height: 'calc(100vh - 16px)',
            
            bgcolor: '#1b1b1bff',
        }}
        >
            <div ref={editorWrapperRef} data-color-mode="dark" style={{ width: '100%', height: "100%"}}>
    <MDEditor
      value={value}
      onChange={handleChange}
      height="100%"
       minHeight={500}
      preview={isPreviewMode ? "preview" : "edit"}
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
                            max-width: 900px;
                            width: 100%;
                            margin: 0 auto; 
                            padding-top: 90px;
                            padding-bottom: 80px;
                        }
      .markdown-alert .markdown-alert-title { color: inherit; }
                        .wmde-markdown table { width: 100%; border-collapse: collapse; }

    `}</style>
  </div>
        </Paper>

    </>
  )
});

export default ContentPanel;