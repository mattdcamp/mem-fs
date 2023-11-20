import { DISALLOWED_CONTENT_NAMES, PATH_SEPARATOR } from '../constants';
import { type FolderDescriptor, type FileSystemDescriptor, FolderDescriptorImpl } from '../fileDescriptor';

/**
 * Helper function to create folder nodes in the tree. The path is split into parts, and each part is resolved recursivly.
 *
 * @param path the path (either relative or absolute) to create. If multiple folders on this path do not exist, they
 * will be created if the makeParents flag is set to true. Otherwise the entire path must exist upto the last folder.
 * @param makeParents Indicate if the function should create missing parents folders in the tree.
 * @param workingFolder the working directory to use if the path is relative.
 * @param rootFolder the root directory to use if the path is absolute.
 * @throws Error if the path contians any disallowed names see {@link DISALLOWED_CONTENT_NAMES}
 * @throws Error if the path traverses through a file
 * @throws Error if the path makeParents is false and any of the ancestors of the last folder do not exist
 * @throws Error if the path already exists
 */
export function buildFolder(
  path: string,
  makeParents: boolean,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): void {
  const pathParts = path.split('/');
  const currentDescriptor = path.startsWith('/') ? rootFolder : workingFolder;
  buildFolderRecusive(pathParts, makeParents, currentDescriptor);
}

/**
 * Function to recursivly create folders in the tree.
 *
 * @param pathParts A list of path parts split by the @link PATH_SEPARATOR
 * @param makeParents Indicate if the function should create missing parents folders in the tree.
 * @param currentDescriptor The descriptor to start the search from.
 * @returns
 */
function buildFolderRecusive(pathParts: string[], makeParents: boolean, currentDescriptor: FileSystemDescriptor): void {
  if (!currentDescriptor.isFolder) {
    throw new Error(`Path ${currentDescriptor.path} is not a folder`);
  }
  const currentFolder = currentDescriptor as FolderDescriptor;

  const nextPart = pathParts.shift();
  if (nextPart == null) {
    return;
  }

  if (nextPart === '' || nextPart === '.') {
    buildFolderRecusive(pathParts, makeParents, currentDescriptor);
    return;
  }

  if (nextPart === '..') {
    throw new Error(`Cannot create ${nextPart}. Is not valid path`);
  }

  const nextDescriptor = currentFolder.findChild(nextPart);
  if (nextDescriptor != null) {
    if (pathParts.length === 0) {
      throw new Error(`Cannot create ${nextPart}. It already exists`);
    }

    buildFolderRecusive(pathParts, makeParents, nextDescriptor as FolderDescriptor);
    return;
  }

  if (pathParts.length !== 0 && !makeParents) {
    throw new Error(`Cannot create ${pathParts.join(PATH_SEPARATOR)}. Its parent ${nextPart} does not exist`);
  }

  if (DISALLOWED_CONTENT_NAMES.includes(nextPart)) {
    throw new Error(`Cannot create ${nextPart}. It is a reserved name`);
  }

  const newFolder = new FolderDescriptorImpl(nextPart, currentFolder);
  buildFolderRecusive(pathParts, makeParents, newFolder);

  // the folder is only added to the parent after validating that all its children can be resolved or created. If any
  // step errors, the new folder is not added to the parent, and will be lost when the function returns.
  currentFolder.addContent(newFolder);
}
