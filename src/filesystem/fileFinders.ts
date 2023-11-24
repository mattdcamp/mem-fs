import { type FileSystemDescriptor, type FolderDescriptor } from '../fileDescriptor';

export function findFilesRecursive(fileName: string, folder: FolderDescriptor): FileSystemDescriptor[] {
  const result: FileSystemDescriptor[] = [];
  for (const content of folder.content) {
    if (content.name === fileName) {
      result.push(content);
    }
    if (content.isFolder) {
      const folder = content as FolderDescriptor;
      result.push(...findFilesRecursive(fileName, folder));
    }
  }
  return result;
}
