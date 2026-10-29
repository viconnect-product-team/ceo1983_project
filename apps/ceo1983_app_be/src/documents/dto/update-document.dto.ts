export class UpdateDocumentDto {
  name?: string;
  category?: string;
  size?: string;
  uploadedBy?: string;
  type?: string;
  filePath?: string;
  folderId?: string | null;
  driveUrl?: string | null;
  isFolder?: boolean;
  parentId?: string | null;
  docScope?: string;
  enterpriseName?: string;
  enterpriseId?: string;
  shareScope?: 'public' | 'internal' | 'specific' | 'private';
  shareRole?: 'viewer' | 'downloader' | 'editor';
  sharedWith?: any;
  isStarred?: boolean;
  colorTag?: string;
  description?: string;
}
