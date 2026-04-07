import $api from "../api/axios";
import { useApplication } from "../components/context/ApplicationContext";
import { DCrypto } from "../services/cryptoService";


export const useFileUpload = () => {
    const { currentProjectId: projectId, masterKey, currentProjectKey, setProjectFiles } = useApplication();
    const FileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        
        const file = event.target.files?.[0];
        if (!file || !projectId || !masterKey || !currentProjectKey) return;

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const rawText = e.target?.result as string;
                
                const sharedIv = window.crypto.getRandomValues(new Uint8Array(12));

                const encryptedContent = await DCrypto.encrypt(rawText, currentProjectKey, sharedIv);
                const encryptedName = await DCrypto.encrypt(file.name, currentProjectKey, sharedIv);

                const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : (isImage ? '.png' : '.md');

                const response = await $api.post('/files', {
                    name: encryptedName.content,
                    content: encryptedContent.content,
                    iv: encryptedName.iv, 
                    extension: extension,
                    projectId: projectId
                });

                const newFile = { ...response.data, name: file.name };
                setProjectFiles(prev => [...prev, newFile]);
                
                console.log("Файл успешно загружен с общим IV");
                event.target.value = ''; 
            } catch (err) {
                console.error("Ошибка при загрузке/шифровании:", err);
            }
        };
        if (isImage) {
            reader.readAsDataURL(file); 
        } else {
            reader.readAsText(file);  
        }
    };
  return { FileUpload };
};