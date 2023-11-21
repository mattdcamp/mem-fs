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

  /**
   * Print Working Directory. This currnetly only supports the physical path of the working folder.
   * @todo Add support for logical paths
   * @returns Returns the path of the current working folder
   */
  pwd(): string {
    return this.workingFolder.path;
  }

  /**
   * Change the working folder to the folder at the given path.
   *
   * @param path the relative or absolute path to the new working folder.
   * @returns the path to the new working directory
   * @throws Error if the path cannot be resolved to a folder
   */
  cd(path: string): string {
    const newWorkingFolder = resolvePath(path, this.workingFolder, this.rootFolder);
    if (!newWorkingFolder.isFolder) {
      throw new Error(`Path ${path} is not a folder`);
    }
    this.workingFolder = newWorkingFolder as FolderDescriptor;
    return this.pwd();
  }

  /**
   * List the content of the specified folder. If a relative path is given (including null), the path is resolved from
   * the working folder. If an absolute path is given, the path is resolved from the root folder.
   * @param path the relative or absolute path to list
   * @returns a comma separated list of the names of the content of the folder
   * @todo Add support for other file attributes other than name
   */
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

  /**
   * Create new folder(s) at the given path.
   *
   * @param path the relative or absolute path to the new folder(s)
   * @param makeParents if true, this will create any missing folders in the supplied path
   * @throws Error if the path contains any disallowed names see {@link DISALLOWED_CONTENT_NAMES}
   * @throws Error if the path traverses through a file
   * @throws Error if the path makeParents is false and any of the ancestors of the last folder do not exist
   */
  mkdir(path: string, makeParents?: boolean | null): void {
    if (makeParents == null) {
      makeParents = false;
    }
    buildFolder(path, makeParents, this.workingFolder, this.rootFolder);
  }

  /**
   * Delete a file or folder at the given path.
   *
   * @param path the relative or absolute path to the file or folder to delete
   * @throws Error if the path is invalid or does not exist
   * @throws Error if the path is the root folder
   * @throws Error if the path is the current working folder
   */
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
