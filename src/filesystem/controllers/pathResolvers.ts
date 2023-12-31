import { PATH_SEPARATOR } from '../constants';
import {
  buildFileDescriptor,
  type FileDescriptor,
  type FileSystemDescriptor,
  type FolderDescriptor,
} from '../fileDescriptor';

/**
 * Helper function to resolve a Descriptor from a path starting at the workingDirectory.
 *
 * @param path the path (either relative or absolute) to resolve.
 * @param workingFolder the working directory to use if the path is relative.
 * @param rootFolder the root directory to use if the path is absolute.
 * @returns the FileSystemDescriptor for the path.
 * @throws Error if the path is invalid in any way.
 */
export function resolvePath(
  path: string,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): FileSystemDescriptor[] {
  const pathParts = path.split(PATH_SEPARATOR);
  const currentDescriptor = path.startsWith('/') ? rootFolder : workingFolder;
  return resolvePathRecursive(pathParts, currentDescriptor);
}

/**
 * Helper function to resolve a Descriptor from a path, already split into subarts (generally using the ) starting at the current directory.
 */
export function resolvePathRecursive(
  pathParts: string[],
  currentDescriptor: FileSystemDescriptor,
): FileSystemDescriptor[] {
  const nextPart = pathParts.shift();
  if (nextPart == null) {
    // We've reached the end of the path, we can return the current descriptor
    return [currentDescriptor];
  }

  if (nextPart === '*') {
    if (pathParts.length > 0) {
      throw new Error(`* can only be used as the last part of a path`);
    }

    if (!currentDescriptor.isFolder) {
      throw new Error(`Path ${currentDescriptor.name} is not a folder`);
    }
    const currentFolder = currentDescriptor as FolderDescriptor;
    return [...currentFolder.children];
  }

  if (nextPart === '' || nextPart === '.') {
    // Stay in the same directory and continue
    return resolvePathRecursive(pathParts, currentDescriptor);
  }

  // We know we are not at the end of the path, so if the current descriptor is not a folder, we can't continue and
  // the overal path is invalid.
  if (!currentDescriptor.isFolder) {
    throw new Error(`Path ${currentDescriptor.name} is not a folder`);
  }

  // We know we can treat the current descriptor as a folder
  const currentFolder = currentDescriptor as FolderDescriptor;
  if (nextPart === '..') {
    if (currentFolder.parent === null) {
      // The root path is the only path that does not have a parent, we treat that as if its parent is itself.
      return resolvePathRecursive(pathParts, currentFolder);
    }
    return resolvePathRecursive(pathParts, currentFolder.parent);
  }

  const child = currentFolder.findChild(nextPart);
  if (child === null) {
    throw new Error(`Path ${nextPart} does not exist`);
  } else {
    return resolvePathRecursive(pathParts, child);
  }
}

/**
 * Resolve a FileDescriptor from a path, creating it if it does not exist and create is true.
 *
 * @param path The absolute or relative path to resolve
 * @param create Set to true to create the file if it does not exist
 * @param workingFolder the working directory to use if the path is relative.
 * @param rootFolder the absolute root directory to use if the path is absolute.
 * @returns The specified FileDescriptor
 * @throws Error if the path is invalid in any way.
 * @throws Error if the path is a folder
 * @throws Error if the path does not exist and create is false
 */
export function resolveFile(
  path: string,
  create: boolean,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): FileDescriptor {
  const pathParts = path.split('/');
  const fileName = pathParts.pop();

  if (fileName == null) {
    throw new Error(`Path ${path} is not a valid file name`);
  }

  const targetParent = resolvePath(pathParts.join('/'), workingFolder, rootFolder)[0];

  if (!targetParent.isFolder) {
    throw new Error(`Path ${path} is not a folder`);
  }
  const targetFolder = targetParent as FolderDescriptor;

  let taretDescriptor = targetFolder.findChild(fileName);
  if (taretDescriptor == null) {
    if (!create) {
      throw new Error(`Path ${path} does not exist`);
    }
    taretDescriptor = buildFileDescriptor(fileName, targetFolder);
    targetFolder.addContent(taretDescriptor);
  }

  if (taretDescriptor.isFolder) {
    throw new Error(`Path ${path} is a folder`);
  }
  return taretDescriptor as FileDescriptor;
}
