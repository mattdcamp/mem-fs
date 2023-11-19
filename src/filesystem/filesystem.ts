import { type FolderDescriptor, FolderDescriptorImpl } from '../fileDescriptor';
import { resolvePath } from './pathResolvers';

export interface FileSystem {
  cd: (path: string) => void;
}

export function startFileSystem(): FileSystem {
  return new FileSystemImpl();
}

export class FileSystemImpl implements FileSystem {
  rootFolder: FolderDescriptor;
  workingFolder: FolderDescriptor;

  constructor() {
    this.rootFolder = new FolderDescriptorImpl();
    this.workingFolder = this.rootFolder;
  }

  cd(path: string): void {
    const newWorkingFolder = resolvePath(path, this.workingFolder, this.rootFolder);
    if (!newWorkingFolder.isFolder) {
      throw new Error(`Path ${path} is not a folder`);
    }
    this.workingFolder = newWorkingFolder as FolderDescriptor;
  }

  pwd(): string {
    return this.workingFolder.path;
  }
}