import { type FolderDescriptor, FolderDescriptorImpl } from '../fileDescriptor';
import { findFilesRecursive } from './fileFinders';
import { buildFolder } from './folderBuilders';
import { buildLink } from './linkBuilders';
import { copyPath, movePath } from './pathCopiers';
import { resolveFile, resolvePath } from './pathResolvers';
import { type Writable, type Readable } from 'stream';

export interface FileSystem {
  /**
   * Print Working Directory. This currnetly only supports the physical path of the working folder.
   * @todo Add support for logical paths
   * @returns Returns the path of the current working folder
   */
  pwd: () => string;

  /**
   * Change the working folder to the folder at the given path.
   *
   * @param path the relative or absolute path to the new working folder.
   * @returns the path to the new working directory
   * @throws Error if the path cannot be resolved to a folder
   */
  cd: (path: string) => string;

  /**
   * List the content of the specified folder. If a relative path is given (including null), the path is resolved from
   * the working folder. If an absolute path is given, the path is resolved from the root folder.
   * @param path the relative or absolute path to list
   * @returns a comma separated list of the names of the content of the folder
   * @todo Add support for other file attributes other than name
   */
  ls: (path?: string) => string;

  /**
   * Create new folder(s) at the given path.
   *
   * @param path the relative or absolute path to the new folder(s)
   * @param makeParents if true, this will create any missing folders in the supplied path
   * @throws Error if the path contains any disallowed names see {@link DISALLOWED_CONTENT_NAMES}
   * @throws Error if the path traverses through a file
   * @throws Error if the path makeParents is false and any of the ancestors of the last folder do not exist
   */
  mkdir: (path: string, makeParents: boolean) => void;

  /**
   * Delete a file or folder at the given path.
   *
   * @param path the relative or absolute path to the file or folder to delete
   * @throws Error if the path is invalid or does not exist
   * @throws Error if the path is the root folder
   * @throws Error if the path is the current working folder
   */
  rm: (path?: string | null) => void;

  /**
   * Copy the contents of a file or folder to a new location. The existing file or folder is not modified.
   *
   * @param sourcePath the path of the file or folder to copy from
   * @param destinationPath the path of the file or folder to copy to
   * @param newFileName if the source path resolves to a single file, you can renmae it with this parameter
   * @throws Error if the operation fails to resolve either path
   * @throws Error if multiple files are copied to a single new filename
   */
  cp: (sourcePath: string, destinationPath: string, newFileName?: string | null) => void;

  /**
   * Move the contents of a file or folder to a new location. The existing file or folder is removed once this is complete.
   *
   * @param sourcePath the path of the file or folder to move from
   * @param destinationPath the path of the file or folder to move to
   * @param newFileName if the source path resolves to a single file, you can renmae it with this parameter
   * @throws Error if the operation fails to resolve either path
   * @throws Error if multiple files are copied to a single new filename
   */
  mv: (sourcePath: string, destinationPath: string, newFileName?: string | null) => void;

  /**
   * Obtain a write stream to the file at the given path. The parent folder and all of its ancestors must exist, but if
   * the file is missing, it will be created.
   *
   * @param path the relative or absolute path to the file
   * @param append if true, the file will be appended to, otherwise the content will be overwritten. Default is false.
   * @returns
   */
  createWriteStream: (path: string, append?: boolean) => Writable;

  /**
   * Write content to the file at the given path. The parent folder and all of its ancestors must exist, but if the file
   * is missing it will be created.
   *
   * @param path the relative or absolute path to the file
   * @param content the content to write to the file
   * @param append if true, the file will be appended to, otherwise the content will be overwritten. Default is false.
   * @todo Add support for other file content types (binary, etc.)
   */
  writeFile: (path: string, content: string, append?: boolean) => Promise<void>;

  /**
   * Obtain a read stream to the file of the given path.
   * @param path
   * @returns
   */
  createReadStream: (path: string) => Readable;

  /**
   * Read the content of the file at the given path.
   * @param path
   * @returns
   */
  readFile: (path: string) => Promise<string>;

  /**
   * Search the working directory and all of its subfolders for files with the given name.
   *
   * @param fileName The name of the file to search for
   * @returns a list of all the paths to files with the given name
   */
  findFiles: (fileName: string) => string[];
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
    const resolved = resolvePath(path, this.workingFolder, this.rootFolder);
    if (resolved.length !== 1) {
      throw new Error(`Path ${path} is invalid.`);
    }

    const newWorkingFolder = resolved[0];
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
    const resolvedPaths = resolvePath(path, this.workingFolder, this.rootFolder);
    if (resolvedPaths.length !== 1) {
      throw new Error(`Path ${path} is invalid.`);
    }
    const resolvedPath = resolvedPaths[0];

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
    path = path ?? '';

    const targets = resolvePath(path, this.workingFolder, this.rootFolder);
    if (targets.length < 1) {
      throw new Error(`Path ${path} is invalid.`);
    }

    for (const target of targets) {
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

  cp(sourcePath: string, destinationPath: string, newFileName?: string | null): void {
    newFileName = newFileName ?? null;
    copyPath(sourcePath, destinationPath, newFileName, this.workingFolder, this.rootFolder);
  }

  mv(sourcePath: string, destinationPath: string, newFileName?: string | null): void {
    newFileName = newFileName ?? null;
    movePath(sourcePath, destinationPath, newFileName, this.workingFolder, this.rootFolder);
  }

  ln(sourcePath: string, destinationPath: string, newFileName?: string | null, hardLink?: boolean): void {
    newFileName = newFileName ?? null;
    hardLink = hardLink ?? false;

    buildLink(sourcePath, destinationPath, newFileName, hardLink, this.workingFolder, this.rootFolder);
  }

  createWriteStream(path: string, append?: boolean): Writable {
    append = append ?? false;
    const targetFile = resolveFile(path, true, this.workingFolder, this.rootFolder);
    return targetFile.content.getWriteableStream(append);
  }

  async writeFile(path: string, content: string, append?: boolean): Promise<void> {
    const writer = this.createWriteStream(path, append);
    writer.end(content);
  }

  createReadStream(path: string): Readable {
    const targetFile = resolveFile(path, false, this.workingFolder, this.rootFolder);
    return targetFile.content.getReadableStream();
  }

  async readFile(path: string): Promise<string> {
    const reader = this.createReadStream(path);
    const contentChunks = [];
    for await (const chunk of reader) {
      contentChunks.push(chunk);
    }
    return contentChunks.join('');
  }

  findFiles(fileName: string): string[] {
    const files = findFilesRecursive(fileName, this.workingFolder);
    return files.map((file) => file.path);
  }
}
