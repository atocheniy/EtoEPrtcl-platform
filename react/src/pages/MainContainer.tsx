import { useState, useRef, useEffect, useTransition } from 'react'

//? Components -------------------------------------

import LeftSidebar from '../components/LeftSidebar.tsx';
import LeftSidebarFiles from '../components/LeftSidebarFiles.tsx';
import ContentPanel, { type ContentPanelHandle } from '../components/ContentPanel.tsx';
import RightSidebar from '../components/RightSidebar.tsx';
import '../components/css/MainContainer.css'
import TopPanel from '../components/TopPanel.tsx';
import ToolsPanel from '../components/ToolsPanel.tsx';

//? Functions -------------------------------------

// import type { MarkdownCommand } from '../components/ToolsPanel.tsx';

//? Services -------------------------------------

import { $api } from '../api/axios';
import { FileService } from '../services/fileService.ts';

//? Animations -------------------------------------

import AnimatedPage from '../components/AnimatedPage'; 
// import { motion } from 'framer-motion';
import { useMarkdownCommands } from '../hooks/useMarkdownCommands.ts';
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from '../components/context/EncryptionContext.tsx';



//* =============================================================================
//* Main container application
//* =============================================================================
function MainContainer() {

    //! === States ===
    // const MotionPaper = motion.div;
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('Файл не выбран');
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { masterKey, setMasterKey } = useEncryption(); 
    const [isPending, startTransition] = useTransition();

    //! === Refs ===
    const contentPanelRef = useRef<ContentPanelHandle>(null);
    const contentRef = useRef<string>(''); 

    //! === Functions ===

    const { handleCommand } = useMarkdownCommands(contentPanelRef, setFileContent, contentRef);

    const handleProjectSelect = (id: string) => {
        setSelectedProjectId(id);
        setIsProjectSidebarOpen(false); 
    };

    const saveFile = async () => {
        if (!activeFileId || !masterKey) return false;

        try {
            const newIvRaw = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encoder = new TextEncoder();
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: newIvRaw },
                masterKey,
                encoder.encode(contentRef.current)
            );

            const encryptedName = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: newIvRaw },
                masterKey,
                encoder.encode(fileName)
            );

            const payload = {
                name: btoa(String.fromCharCode(...new Uint8Array(encryptedName))),
                content: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
                iv: btoa(String.fromCharCode(...new Uint8Array(newIvRaw)))
            };

            await $api.put(`/files/${activeFileId}`, payload);
            
            console.log("Файл и имя успешно перешифрованы и сохранены");
            return true;
        } catch (e) {
            console.error("Ошибка сохранения", e);
            return false;
        }
    };

    const handleFileSelect = async (fileId: string) => {
        try {
            const response = await $api.get(`/files/${fileId}`);
            const { content, iv, name } = response.data;

            if (masterKey && iv) {
                try {
                   
                     
                    const decryptedName = await DCrypto.decrypt(name, iv, masterKey);
                    startTransition(() => {
                        setFileName(decryptedName);
                    });

                    if (content && content.length > 0) {
                        const decryptedContent = await DCrypto.decrypt(content, iv, masterKey);
                        startTransition(() => {
                            setFileContent(decryptedContent);
                        });
                        contentRef.current = decryptedContent;
                    } else {
                        setFileContent("");
                        contentRef.current = "";
                    }
                     

                    setActiveFileId(fileId);
                } catch (cryptoError) {
                    console.error("Ошибка дешифрации. Неверный ключ или битые данные:", cryptoError);
                    setFileName("Ошибка доступа");
                }
            }else {
                console.error("Ключ или IV отсутствуют:", { hasKey: !!masterKey, iv });
                setFileName("Файл защищен или поврежден");
            }

        } catch (e) {
            console.error("Ошибка загрузки файла", e);
        }
    };

    const handleContentChange = (newText: string) => {
        contentRef.current = newText;
    };

    useEffect(() => {
        const tryAutoLogin = async () => {
            if (!masterKey) { 
                const savedKey = await DCrypto.loadKeyFromStorage();
                if (savedKey) {
                    console.log("Ключ успешно восстановлен.");
                    setMasterKey(savedKey);
                } else {
                    console.error("Ключ не найден.");
                }
            }
        };
        tryAutoLogin();
    }, [masterKey, setMasterKey]);

  return (
    <AnimatedPage>
      <div className='mainContainer'>
        <div className="leftSidebarStack">
            <LeftSidebar isOpen={isProjectSidebarOpen} onProjectSelect={handleProjectSelect}/>
            <LeftSidebarFiles projectId={selectedProjectId} onBack={() => setIsProjectSidebarOpen(true)} onFileSelect={handleFileSelect} />
        </div>
        <div style={{display: "flex", flexDirection: "column", flex: 1, position: 'relative', justifyContent: 'center', alignItems: "center"}}>
          <ContentPanel ref={contentPanelRef} isPreviewMode={isPreviewMode} content={fileContent} onChange={handleContentChange}/>
          <TopPanel  selected={isPreviewMode} fileName={fileName} onToggle={() => setIsPreviewMode(!isPreviewMode)} onSave={saveFile}/>
          <ToolsPanel onCommand={handleCommand}></ToolsPanel>
        </div>
        <RightSidebar/>
      </div>
    </AnimatedPage>
  )
}

export default MainContainer