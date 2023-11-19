import { PATH_SEPARATOR } from '../constants';
import type { FileSystemDescriptor, FolderDescriptor } from '../fileDescriptor';

/**
 * Helper function to resolve a Descriptor from a path starting at the workingDirectory.
 *
 * @param path the path (either relative or absolute) to resolve.
 * @param workingFolder the working directory to use if the path is relative.
 * @returns the FileSystemDescriptor for the path.
 * @throws Error if the path is invalid in any way.
 */
export function resolvePath(
  path: string,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): FileSystemDescriptor {
  const pathParts = path.split(PATH_SEPARATOR);
  let currentDescriptor: FolderDescriptor = workingFolder;
  if (path.startsWith(PATH_SEPARATOR)) {
    currentDescriptor = rootFolder;
  }
  return resolvePathRecursive(pathParts, currentDescriptor);
}

/**
 * Helper function to resolve a Descriptor from a path, already split into subarts (generally using the ) starting at the current directory.
 * @param pathParts
 * @param currentDescriptor
 * @returns
 */
export function resolvePathRecursive(
  pathParts: string[],
  currentDescriptor: FileSystemDescriptor,
): FileSystemDescriptor {
  const nextPart = pathParts.shift();
  if (nextPart == null) {
    // We've reached the end of the path, we can return the current descriptor
    return currentDescriptor;
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
  } else {
    const child = currentFolder.findChild(nextPart);
    if (child === null) {
      throw new Error(`Path ${nextPart} does not exist`);
    } else {
      return resolvePathRecursive(pathParts, child);
    }
  }
}