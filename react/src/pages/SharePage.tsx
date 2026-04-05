import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useTransition } from 'react';
import { DCrypto } from '../services/cryptoService';
import { ProjectService } from '../services/projectService';
import { Box } from '@mui/material';
import { useEncryption } from '../components/context/EncryptionContext';
import LeftSidebarFiles from '../components/LeftSidebarFiles';
import ContentPanel from '../components/ContentPanel';
import TopPanel from '../components/TopPanel';
import AnimatedPage from '../components/AnimatedPage';
import { $api } from '../api/axios'; 
import { motion } from 'framer-motion';
import RightSidebar from '../components/RightSidebar';

const MotionBox = motion.create(Box);

export default function SharePage() {
    const { projectId } = useParams();
    const { 
        setProjectData, 
        setCurrentProjectKey, 
        refreshProjectFiles,
        currentProjectKey,
        projectFiles,
        refreshCurrentProjectId
    } = useEncryption();

     const [fileContent, setFileContent] = useState("");
    const [fileName, setFileName] = useState("");
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    
    const [currentFileTags, setCurrentFileTags] = useState<string[]>([]);
    const [currentFileLinks, setCurrentFileLinks] = useState<string[]>([]);

    const [isPending, startTransition] = useTransition();
    const [isFileLoading, setIsFileLoading] = useState(false);

    const { orbColors } = useEncryption();

    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const contentRef = useRef<string>('');
    const fileNameRef = useRef<string>('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    useEffect(() => {
        const loadSharedProject = async () => {
            const base64Key = window.location.hash.substring(1);
            if (!base64Key || !projectId) return;

            try {
                const pKey = await DCrypto.importProjectKey(base64Key);
                setCurrentProjectKey(pKey);
                refreshCurrentProjectId(projectId); 

                const project = await ProjectService.getProjectById(projectId);
                const clearName = await DCrypto.decrypt(project.name, project.iv, pKey);

                setProjectData({ ...project, name: clearName, role: 'Viewer' });
                
                refreshProjectFiles(projectId, pKey);

            } catch (e) {
                console.error("Ошибка доступа по ссылке", e);
                setFileName("Ошибка доступа");
            }
        };

        loadSharedProject();
    }, [projectId]);

    const handleRestoreVersion = async () => {

    };

   const handleFileSelect = async (fileId: string) => {
        if (fileId === activeFileId) return;       
        
        setIsFileLoading(true);
        try {
            const response = await $api.get(`/files/${fileId}`);
            const { content, iv, name, tags, links } = response.data;

            if (currentProjectKey && iv) {
                try {
                    const decryptedName = await DCrypto.decrypt(name, iv, currentProjectKey);
                    const decryptedContent = content ? await DCrypto.decrypt(content, iv, currentProjectKey) : "";

                    const decryptedTags = await Promise.all((tags || []).map(async (t: any) => {
                        try {
                            return await DCrypto.decrypt(t.encryptedName || t.EncryptedName, t.iv || t.Iv, currentProjectKey);
                        } catch { return null; }
                    }));

                    startTransition(() => {
                        setFileName(decryptedName);
                        setFileContent(decryptedContent);
                        setActiveFileId(fileId);
                        setCurrentFileTags(decryptedTags.filter(t => t !== null) as string[]); 
                        setCurrentFileLinks(links || []); 
                    });

                    contentRef.current = decryptedContent;
                    fileNameRef.current = decryptedName;

                } catch (cryptoError) {
                    console.error("Ошибка дешифрации:", cryptoError);
                    setFileName("Ошибка доступа");
                }
            }
        } catch (e) {
            console.error("Ошибка загрузки файла", e);
        } finally {
            setIsFileLoading(false);
        }
    };

     const handleCloseFile = () => {
        setActiveFileId(null);
        setFileName('');
        setFileContent('');
    };

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

            <Box style={{
                display: 'flex',        
                flexDirection: 'column',
                height: '100vh',        
                flexShrink: 0,          
                zIndex: 2 
            }}>    
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
                <Box sx={{ height: '100%' }}>
                    <LeftSidebarFiles 
                        projectId={projectId || null}
                        onBack={() => { window.location.href = '/'; } }
                        onFileSelect={handleFileSelect}
                        isProjectSettinsOpen={false}
                        setIsProjectSettinsOpen={() => {}}
                        projectIdSelected={projectId || null} 
                        closeFile={handleCloseFile} 
                        onRenameSuccess={() => {}}
                    />
                </Box>
                </motion.div>
            </Box>

            <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                height: '100vh',
                overflow: 'hidden'
            }}>
                
                <ContentPanel 
                   content={fileContent}
                   activeFileId={activeFileId}
                   isPreviewMode={isPreviewMode}
                   onChange={() => { } }
                   saveFile={async () => false}
                   isProjectSettinsOpen={false}
                   setIsProjectSettinsOpen={() => { } }
                   handleCloseProject={() => { window.location.href = '/'; } }
                   isLoading={isFileLoading || isPending} onFileSelect={function (): void {
                       throw new Error('Function not implemented.');
                   } } readOnly={true}
                />
                
                <TopPanel 
                    selected={isPreviewMode} 
                    fileName={fileName}
                    activeFileId={activeFileId}
                    onToggle={() => {
                        const nextMode = !isPreviewMode;
                
                        if (nextMode) {
                            true;
                            true;
                            setTimeout(() => {
                                startTransition(() => {
                                    setIsPreviewMode(true);
                                    false;
                                });
                            }, 50);
                        } else {
                            setIsPreviewMode(false);
                            false;
                        }
                    }}
                    onSave={async () => false} 
                    isLeftOpen={isLeftSidebarOpen} onLeftToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} isRightOpen={isRightSidebarOpen} onRightToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    closeFile={handleCloseFile}                    
                />
            </Box>
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
            <RightSidebar content={fileContent} tags={currentFileTags} links={currentFileLinks} allFiles={projectFiles} onFileSelect={handleFileSelect} activeFileId={activeFileId} handleRestore={handleRestoreVersion}/>
        </motion.div>
        </div>
    </AnimatedPage>
    );
}