export class CreateDocumentDto {
  name!: string;
  category!: string;
  size?: string;
  uploadedBy?: string;
  type!: string;
  filePath?: string;
  folderId?: string;
  driveUrl?: string;
  isFolder?: boolean;
  parentId?: string;
}
