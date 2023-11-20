import { type FolderDescriptor, FolderDescriptorImpl } from '../fileDescriptor';
import { buildFolder } from './folderBuilders';
import { resolvePath } from './pathResolvers';

export interface FileSystem {
  pwd: () => string;
  cd: (path: string) => string;
  ls: (path?: string) => string;
  rm: (path?: string | null) => void;
  mkdir: (path: string, makeParents: boolean) => void;
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

  pwd(): string {
    return this.workingFolder.path;
  }

  cd(path: string): string {
    const newWorkingFolder = resolvePath(path, this.workingFolder, this.rootFolder);
    if (!newWorkingFolder.isFolder) {
      throw new Error(`Path ${path} is not a folder`);
    }
    this.workingFolder = newWorkingFolder as FolderDescriptor;
    return this.pwd();
  }

  ls(path?: string): string {
    if (path == null) {
      path = '';
    }
    const resolvedPath = resolvePath(path, this.workingFolder, this.rootFolder);
    if (!resolvedPath.isFolder) {
      throw new Error(`Path ${path} is not a folder`);
    }
    const resolvedFolder = resolvedPath as FolderDescriptor;
    return resolvedFolder.content.map((descriptor) => descriptor.name).join(', ');
  }

  mkdir(path: string, makeParents?: boolean | null): void {
    if (makeParents == null) {
      makeParents = false;
    }
    buildFolder(path, makeParents, this.workingFolder, this.rootFolder);
  }

  rm(path?: string | null): void {
    if (path == null) {
      path = '';
    }

    const target = resolvePath(path, this.workingFolder, this.rootFolder);
    const targetName = target.name;
    const targetParent = target.parent as FolderDescriptor;

    if (targetParent == null) {
      throw new Error(`Cannot delete ${path}. It is the root folder`);
    }

    if (target === this.workingFolder) {
      throw new Error(`Cannot delete ${path}. It is the working folder.`);
    }

    targetParent.removeContent(targetName);
  }
}
