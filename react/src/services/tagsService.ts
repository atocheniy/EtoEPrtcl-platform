import { $api } from "../api/axios";
import type { FileItem } from "../types/auth";
import { DCrypto } from "./cryptoService";

export const TagsService = {

    async extractMetadata(text: string, allFiles: FileItem[], currentProjectKey: CryptoKey, salt: string, projectId: string) {
        const tagRegex = /(?<=^|\s)#([a-zа-яё0-9_]+)/gi;
        const rawTags = Array.from(new Set(Array.from(text.matchAll(tagRegex)).map(m => m[1])));
        
        const tags = await Promise.all(rawTags.map(async (name) => {
            const Index = await DCrypto.hashTag(name, salt, projectId);
            const enc = await DCrypto.encrypt(name, currentProjectKey);
            return { index: Index, encryptedName: enc.content, iv: enc.iv };
        }));

        const linkRegex = /\[\[(.+?)\]\]/g;
        const linkedNames = Array.from(text.matchAll(linkRegex)).map(m => m[1]);
        const linkedFileIds = linkedNames
            .map(name => allFiles.find(f => f.name === name)?.id)
            .filter((id): id is string => !!id);

        return { tags, linkedFileIds };
    }
    
};
