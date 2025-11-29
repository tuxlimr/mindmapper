export interface MindMapNode {
  id: string;
  label: string;
  details?: string;
  children?: MindMapNode[];
  color?: string; // Optional color override
}

export interface MindMapData {
  root: MindMapNode;
}

export enum FileType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface UploadedFile {
  name: string;
  content: string; // Text content or Base64 string for images
  type: FileType;
  mimeType: string;
}

export type LoadingState = 'idle' | 'reading' | 'generating' | 'success' | 'error';
