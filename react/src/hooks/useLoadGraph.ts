import $api from "../api/axios";
import { useApplication } from "../components/context/ApplicationContext";
import { DCrypto } from "../services/cryptoService";
import type { FileItem } from "../types/auth";

interface LoadGraphProps {
    setAllFilesForGraph: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export const useLoadGraph = () => {
  const { masterKey, projects } = useApplication();

  const LoadGlobalGraph = async ({ setAllFilesForGraph }: LoadGraphProps) => {
    if (!masterKey || projects.length === 0) return;
    
    try {
      const projectKeyring = new Map<string, CryptoKey>();
      await Promise.all(projects.map(async (p: any) => {
            try {
                const rawKeyBase64 = await DCrypto.decrypt(p.encryptedProjectKey, p.keyIv, masterKey);
                const pKey = await DCrypto.importProjectKey(rawKeyBase64);
                projectKeyring.set(p.id, pKey);
            } catch (e) {
                console.warn(`Не удалось подготовить ключ для проекта ${p.name}`);
            }
        }));

      const response = await $api.get<any[]>('/files/all');
      
      const decryptedFiles = await Promise.all(response.data.map(async f => {
        try {
           const pKey = projectKeyring.get(f.projectId);
           if (!pKey) {
              const legacyName = await DCrypto.decrypt(f.name, f.iv, masterKey);
              return { ...f, name: legacyName + " (Legacy)" };
           }
           const name = await DCrypto.decrypt(f.name, f.iv, pKey);
             const rawTags = f.tags || f.Tags || [];
                const decryptedTags = await Promise.all(rawTags.map(async (t: any) => {
                    try {
                        const dName = await DCrypto.decrypt(t.encryptedName || t.EncryptedName, t.iv || t.Iv, pKey);
                        return { ...t, decryptedName: dName };
                    } catch { return null; }
                }));

           return { 
                    ...f, 
                    name, 
                    links: f.links || [], 
                    tags: decryptedTags.filter(t => t !== null) 
                };
        } catch {
          return { ...f, name: "Ошибка" };
        }
      }));
      
      setAllFilesForGraph(decryptedFiles);
    } catch (e) {
      console.error("Ошибка загрузки глобального графа", e);
    }
  };
  return { LoadGlobalGraph };
};