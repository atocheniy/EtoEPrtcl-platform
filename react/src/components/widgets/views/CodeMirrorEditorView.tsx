import { Box, Typography } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import CodeMirror from '@uiw/react-codemirror';
import { githubDark } from '@uiw/codemirror-theme-github'; 
import { githubLight } from '@uiw/codemirror-theme-github';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { useMemo } from "react";
import { useApplication } from "../../context/ApplicationContext";
import { ApplicationTheme } from "../../../types/auth";
import { EditorView } from '@codemirror/view';

interface CodeMirrorEditorViewProps {
    fontSize: number;
    readOnly: boolean;
    value: string;
    editorRef: React.RefObject<any>;
    isImageContent: boolean;
    handleChange: (val: string | undefined) => void;
}

function CodeMirrorEditorView({ fontSize, readOnly, value, editorRef, isImageContent, handleChange }: CodeMirrorEditorViewProps) {

    const { currentTheme, orbColors } = useApplication();
    
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

    return (
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
    )
}

export default CodeMirrorEditorView;