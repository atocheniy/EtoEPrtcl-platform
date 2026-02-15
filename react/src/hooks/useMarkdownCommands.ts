/*
import type { ContentPanelHandle } from "../components/ContentPanel";
import type { MarkdownCommand } from "../components/ToolsPanel";

export const useMarkdownCommands = (
    contentPanelRef: React.RefObject<ContentPanelHandle | null>,
    setFileContent: (val: string) => void,
    contentRef: React.MutableRefObject<string>
) => {
const handleCommand = (command: MarkdownCommand) => {
        const textarea = contentPanelRef.current?.getTextarea();
        if (!textarea) return;

        const start = textarea.selectionStart; 
        const end = textarea.selectionEnd;
        const text = textarea.value;  
        const selectedText = text.substring(start, end); 

        let before = text.substring(0, start);
        let after = text.substring(end);
        let newText = text;
        let cursorOffset = 0;

        switch (command) {
            case 'bold':
                newText = `${before}**${selectedText}**${after}`;
                cursorOffset = 2;
                break;
            case 'italic':
                newText = `${before}*${selectedText}*${after}`;
                cursorOffset = 1;
                break;
            case 'code':
                newText = `${before}\`${selectedText}\`${after}`;
                cursorOffset = 1;
                break;
            case 'quote':
                newText = `${before}\n> ${selectedText}${after}`;
                break;
            case 'ul':
                newText = `${before}\n- ${selectedText}${after}`;
                break;
            case 'link':
                newText = `${before}[${selectedText}](url)${after}`;
                break;
            case 'image':
                newText = `${before}![${selectedText}](img_url)${after}`;
                break;
        }

        contentRef.current = newText;
        
        setFileContent(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + cursorOffset, end + cursorOffset);
        }, 0);
    }
    return { handleCommand };
};
*/