export const NodeType = {
    File: "file",
    Folder: "folder"
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

class Workspace
{
    constructor( 
        id: string,
        userID: string,
        name: string,
        color: string,
        icon: string,
        mainNodeId: number
    ) {}
}

export class WorkspaceNode {
    constructor(
        id: number,
        workspaceId: number,
        parentId: number | null,
        type: NodeType,
        name: string,
        content: string | null,  
        createdAt: Date,
        updatedAt: Date
    ) {}
}

