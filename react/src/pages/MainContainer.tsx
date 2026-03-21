import { useState, useRef, useEffect, useTransition } from 'react'

//? Components -------------------------------------

import LeftSidebar from '../components/LeftSidebar.tsx';
import LeftSidebarFiles from '../components/LeftSidebarFiles.tsx';
import ContentPanel, { type ContentPanelHandle } from '../components/ContentPanel.tsx';
import RightSidebar from '../components/RightSidebar.tsx';
import '../components/css/MainContainer.css'
import TopPanel from '../components/TopPanel.tsx';
import ToolsPanel, { type MarkdownCommand } from '../components/ToolsPanel.tsx';

//? Functions -------------------------------------

// import type { MarkdownCommand } from '../components/ToolsPanel.tsx';

//? Services -------------------------------------

import { $api } from '../api/axios';
// import { FileService } from '../services/fileService.ts';
import { TagsService } from '../services/tagsService.ts';

//? Animations -------------------------------------

import AnimatedPage from '../components/AnimatedPage'; 
// import { motion } from 'framer-motion';
import { DCrypto } from '../services/cryptoService.ts';
import { useEncryption } from '../components/context/EncryptionContext.tsx';

import { AnimatePresence, motion } from 'framer-motion';
import { Box } from '@mui/material';

    const MotionBox = motion(Box);

//* =============================================================================
//* Main container application
//* =============================================================================
function MainContainer() {

    //! === States ===
    // const MotionPaper = motion.div;
    const [currentFileTags, setCurrentFileTags] = useState<string[]>([]);
    const [currentFileLinks, setCurrentFileLinks] = useState<string[]>([]);

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    // const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const { masterKey, setMasterKey } = useEncryption(); 
    const [isPending, startTransition] = useTransition();
    const [manualLoading, setManualLoading] = useState(false);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [isWorkingWithPreview, setIsWorkingWithPreview] = useState(false);
    const [isProjectSettinsOpen, setIsProjectSettinsOpen] = useState(false);

    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const showSkeleton = (isPending || manualLoading || isFileLoading) && (isPreviewMode || isWorkingWithPreview);

    const { userData } = useEncryption();
    const { signingKey, setSigningKey } = useEncryption();
     const { orbColors, refreshCurrentProjectId, refreshProjects } = useEncryption();
     const { clearCurrentProjectId } = useEncryption();
     const { projectFiles, setProjectFiles } = useEncryption();

    //! === Refs ===
    const contentPanelRef = useRef<ContentPanelHandle>(null);

    const contentRef = useRef<string>(''); 
    const lastSavedContentRef = useRef<string>('');
    const activeFileIdRef = useRef<string | null>(null);
    const fileNameRef = useRef<string>('');

    //! === Functions ===

    const handleCommand = (command: MarkdownCommand) => { contentPanelRef.current?.applyCommand(command);};

    const handleProjectSelect = (id: string) => {
        refreshCurrentProjectId(id);
        setSelectedProjectId(id);
        setIsProjectSidebarOpen(false); 
    };

    const handleCloseProject = () => {
        clearCurrentProjectId();

        setActiveFileId(null);
        setFileName('');
        setFileContent('');
        activeFileIdRef.current = null;
        contentRef.current = '';

        setIsProjectSettinsOpen(false);
        setIsPreviewMode(false);

        setIsProjectSidebarOpen(true);
    };

    const updateActiveFileName = (newName: string) => {
        setFileName(newName);
        fileNameRef.current = newName;
    };

    const saveFile = async () => {
        const idToSave = activeFileIdRef.current;
        const contentToSave = contentRef.current;
        const nameToSave = fileNameRef.current;

        if (!idToSave || !masterKey || contentToSave === lastSavedContentRef.current) return false;

        try {

            const { tags, linkedFileIds } = await TagsService.extractMetadata(contentToSave, projectFiles, masterKey, userData.salt);
            const newIvRaw = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encoder = new TextEncoder();
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: newIvRaw },
                masterKey,
                encoder.encode(contentToSave)
            );

            const encryptedName = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: newIvRaw },
                masterKey,
                encoder.encode(nameToSave)
            );

            const payload = {
                name: DCrypto.bufferToBase64(encryptedName),
                content: DCrypto.bufferToBase64(encryptedContent),
                iv: DCrypto.bufferToBase64(newIvRaw),
                tags: tags,
                linkedFileIds: linkedFileIds
            };

            lastSavedContentRef.current = contentToSave;

            await $api.put(`/files/${activeFileId}`, payload);

            setProjectFiles(prev => prev.map(f => 
                f.id === activeFileId ? { ...f, iv: payload.iv, tags, links: linkedFileIds } : f
            ));
            
            console.log("Файл сохранен и подписан цифровым ключом.");
            return true;
        } catch (e) {
            console.error("Ошибка сохранения", e);
            return false;
        }
    };

    const handleFileSelect = async (fileId: string) => {

        if (fileId === activeFileId) return;
        setIsProjectSettinsOpen(false); 
        saveFile();

        if (isPreviewMode) setIsWorkingWithPreview(true);
        setIsFileLoading(true);
        try {
            const response = await $api.get(`/files/${fileId}`);
            const { content, iv, name, tags, links } = response.data;

            if (masterKey && iv) {
                try {
                   
                    const decryptedName = await DCrypto.decrypt(name, iv, masterKey);
                    const decryptedContent = content ? await DCrypto.decrypt(content, iv, masterKey) : "";

                    const decryptedTags = await Promise.all((tags || []).map(async (t: any) => {
                        return await DCrypto.decrypt(t.encryptedName, t.iv, masterKey);
                    }));

                    startTransition(() => {
                        setFileName(decryptedName);
                        setFileContent(decryptedContent);
                        setActiveFileId(fileId);
                        setCurrentFileTags(decryptedTags); 
                        setCurrentFileLinks(links); 
                    });

                    contentRef.current = decryptedContent;
                    lastSavedContentRef.current = decryptedContent;
                    activeFileIdRef.current = fileId; 
                    fileNameRef.current = decryptedName;

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
        } finally {
            setIsFileLoading(false);
            if (!isPreviewMode) setIsWorkingWithPreview(false);
        }
    };

    const closeFile = async () => {
        // console.log("close file");

        setActiveFileId(null);
        setFileName('');
        setFileContent('');

        setIsPreviewMode(false);
        setIsWorkingWithPreview(false);

        activeFileIdRef.current = null;
        contentRef.current = '';
        lastSavedContentRef.current = '';
        fileNameRef.current = '';
    }

    const handleContentChange = (newText: string) => {
        contentRef.current = newText;
    };

    useEffect(() => {
        const tryAutoLogin = async () => {
            if (masterKey && signingKey) return;

            const [savedMaster, savedSigning] = await Promise.all([
                DCrypto.loadKeyFromStorage("master_key"),
                DCrypto.loadKeyFromStorage("signing_key")
            ]);

            if (savedMaster) {
                // console.log("Master Key восстановлен");
                setMasterKey(savedMaster);
            }
            
            if (savedSigning) {
                // console.log("Signing Key восстановлен");
                setSigningKey(savedSigning);
            }
        };
        tryAutoLogin();
    }, []);

  return (
    <AnimatedPage>
      <div className='mainContainer mainC'>
         <MotionBox
                   animate={{
        background: `radial-gradient(circle, ${orbColors[0]} 0%, transparent 80%)`,
    }}
    transition={{ duration: 2, ease: "easeInOut" }}
                    sx={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '85vw',  
            height: '85vh',  
            borderRadius: '50%',
           
            filter: 'blur(80px)', 
            zIndex: 0,
            pointerEvents: 'none' ,
        }}
                />

                <MotionBox
                animate={{
        background: `radial-gradient(circle, ${orbColors[1]} 0%, transparent 80%)`,
    }}
    transition={{ duration: 2, ease: "easeInOut" }}
                    sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '90vw',
            height: '90vh',
            borderRadius: '50%',
           
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none' ,
        }}
                />

        <motion.div
                initial={false}
                animate={{ 
                    width: isLeftSidebarOpen ? 236 : 10,
                    opacity: isLeftSidebarOpen ? 1 : 0 ,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{
                    display: 'flex',        
                    flexDirection: 'column',
                    height: '100vh',        
                    overflow: 'hidden',      
                    flexShrink: 0,          
                }}
        >    
        <Box sx={{ width: 220, height: 'calc(100vh - 16px)', display: 'flex' }}>
            <div className="leftSidebarStack">
                <LeftSidebar isOpen={isProjectSidebarOpen} onProjectSelect={handleProjectSelect} onFileSelect={handleFileSelect} closeFile={closeFile}/>
                <LeftSidebarFiles projectId={selectedProjectId} onBack={() => setIsProjectSidebarOpen(true)} onFileSelect={handleFileSelect} projectIdSelected={selectedProjectId} isProjectSettinsOpen={isProjectSettinsOpen} setIsProjectSettinsOpen={setIsProjectSettinsOpen} closeFile={closeFile} onRenameSuccess={updateActiveFileName}/>
            </div>
            </Box>
            
        </motion.div>

        <div style={{display: "flex", flexDirection: "column", flex: 1, position: 'relative', justifyContent: 'center', alignItems: "center"}}>
          <ContentPanel ref={contentPanelRef} isPreviewMode={isPreviewMode} activeFileId={activeFileId} content={fileContent} onChange={handleContentChange} isLoading={showSkeleton} saveFile={saveFile} isProjectSettinsOpen={isProjectSettinsOpen} setIsProjectSettinsOpen={setIsProjectSettinsOpen} handleCloseProject={handleCloseProject} onFileSelect={handleFileSelect}/>
          <TopPanel selected={isPreviewMode} fileName={fileName} isLeftOpen={isLeftSidebarOpen} onLeftToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} isRightOpen={isRightSidebarOpen} onRightToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} activeFileId={activeFileId} closeFile={closeFile} 
          onToggle={() => {
                const nextMode = !isPreviewMode;
        
                if (nextMode) {
                    setIsWorkingWithPreview(true);
                    setManualLoading(true);
                    setTimeout(() => {
                        startTransition(() => {
                            setIsPreviewMode(true);
                            setManualLoading(false);
                        });
                    }, 50);
                } else {
                    setIsPreviewMode(false);
                    setIsWorkingWithPreview(false);
                }
            }} onSave={saveFile}/>
            <AnimatePresence>
                {!isPreviewMode && activeFileId && ( 
      <motion.div
        initial={{ y: 100, x: "-50%", opacity: 0 }} 
        animate={{ y: 0, x: "-50%", opacity: 1 }}  
        exit={{ y: 100, x: "-50%", opacity: 0 }}     
        transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 25
        }}
        style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: '50%',
            zIndex: 101 ,
            width: 'fit-content'
        }}
      >
          <ToolsPanel onCommand={handleCommand}></ToolsPanel>
          </motion.div> )}
          </AnimatePresence>
        </div>
        <motion.div
            initial={false}
            animate={{ 
            width: isRightSidebarOpen ? 220 : 23,
            opacity: isRightSidebarOpen ? 1 : 0,
            marginLeft: isRightSidebarOpen ? 0 : -20 
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', display: 'flex' }}
        >
            <RightSidebar content={fileContent} tags={currentFileTags} links={currentFileLinks} allFiles={projectFiles} onFileSelect={handleFileSelect} />
        </motion.div>
      </div>
    </AnimatedPage>
  )
}

export default MainContainer