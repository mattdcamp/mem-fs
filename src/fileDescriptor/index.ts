export type FileSystemDescriptorContent = FileSystemDescriptor[] | string

export interface FileSystemDescriptor {
  readonly path: string;
  name: string;
  parent: FileSystemDescriptor | null;
  content: FileSystemDescriptorContent
}

export * from './fileDescriptor';
export * from './folderDescriptor';