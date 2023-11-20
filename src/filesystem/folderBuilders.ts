import { PATH_SEPARATOR } from '../constants';
import { type FolderDescriptor, type FileSystemDescriptor, FolderDescriptorImpl } from '../fileDescriptor';

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

export function buildFolderRecusive(
  pathParts: string[],
  makeParents: boolean,
  currentDescriptor: FileSystemDescriptor,
): void {
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

  const newFolder = new FolderDescriptorImpl(nextPart, currentFolder);
  buildFolderRecusive(pathParts, makeParents, newFolder);

  // the folder is only added to the parent after validating that all its children can be resolved or created. If any
  // step errors, the new folder is not added to the parent, and will be lost when the function returns.
  currentFolder.addContent(newFolder);
}
