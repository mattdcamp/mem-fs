import { type FileSystemDescriptor, type FolderDescriptor } from '../fileDescriptor';
import { resolvePath } from './pathResolvers';

/**
 * Copy the source path to the destination. The source's name will be used unless a new name is specified.
 * 
 * @param sourcePath The aboslute or relative path to the source file or folder
 * @param destinationPath The absolute or relative path to the folder the file will be copied to
 * @param destinationName The new name of the file or folder. If null, the original name will be used.
 * @param workingFolder The foler to use if the source path is relative
 * @param rootFolder The folder to use if the source path is absolute
 */
export function copyPath(
  sourcePath: string,
  destinationPath: string,
  destinationName: string | null,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): void {
  sourcePath = sourcePath ?? '';
  destinationPath = destinationPath ?? '';

  const targets = resolveCopyTargets(sourcePath, workingFolder, rootFolder);
  const destinationFolder = resolveCopyDestination(destinationPath, workingFolder, rootFolder);
  copyDescriptors(targets, destinationFolder, destinationName);
}

/**
 * Move the source path to the destination. The source's name will be used unless a new name is specified.
 * 
 * @param sourcePath The aboslute or relative path to the source file or folder
 * @param destinationPath The absolute or relative path to the folder the file will be moved to
 * @param destinationName The new name of the file or folder. If null, the original name will be used.
 * @param workingFolder The foler to use if the source path is relative
 * @param rootFolder The folder to use if the source path is absolute
 */
export function movePath(
  sourcePath: string,
  destinationPath: string,
  destinationName: string | null,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): void {
  sourcePath = sourcePath ?? '';
  destinationPath = destinationPath ?? '';

  const targets = resolveCopyTargets(sourcePath, workingFolder, rootFolder);
  const destinationFolder = resolveCopyDestination(destinationPath, workingFolder, rootFolder);

  // Create new instances of the descriptors in the new location
  copyDescriptors(targets, destinationFolder, destinationName);

  // Remove the copied files
  for (const target of targets) {
    const targetName = target.name;
    const targetParent = target.parent as FolderDescriptor;
    targetParent.removeContent(targetName);
  }
}

/**
 * A helper function to copy a list of descriptors to a destination folder.
 * 
 * @param targets A list of resolved descriptors to copy
 * @param destinationFolder the folder to copy the descriptors into
 * @param destinationName the new name of the descriptors. If null, the original names will be used.
 * @throws Error if multiple files are copied to a single filename
 */
function copyDescriptors(
  targets: FileSystemDescriptor[],
  destinationFolder: FolderDescriptor,
  destinationName: string | null,
): void {
  if (destinationName != null && targets.length > 1) {
    throw new Error(`Cannot copy multiple files to a single filename`);
  }

  if (targets.length === 1) {
    copyDescriptor(targets[0], destinationName, destinationFolder);
  } else {
    for (const target of targets) {
      copyDescriptor(target, null, destinationFolder);
    }
  }
}

/**
 * Copy and individual descriptor to the destination folder.
 * 
 * @param target the descriptor to copy
 * @param destinationName the new name of the descriptor. If null, the original name will be used.
 * @param destinationFolder the folder to copy the descriptor into
 */
function copyDescriptor(
  target: FileSystemDescriptor,
  destinationName: string | null,
  destinationFolder: FolderDescriptor,
): void {
  const newDescriptor = target.copy();
  newDescriptor.parent = destinationFolder;
  destinationName = destinationName ?? target.name;

  for (let i = 1; destinationFolder.findChild(destinationName) != null; i++) {
    destinationName = `${destinationName} (${i})`;
  }
  newDescriptor.name = destinationName;
  destinationFolder.addContent(newDescriptor);
}

/**
 * A helper function to resolve the source path into a list of descriptors.
 * 
 * @param sourcePath The aboslute or relative path to the source file or folder
 * @param workingFolder The foler to use if the source path is relative
 * @param rootFolder The folder to use if the source path is absolute
 * @returns A list of resolved descriptors
 * @throws Error if the path is invalid in any way.
 */
function resolveCopyTargets(
  sourcePath: string,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): FileSystemDescriptor[] {
  const targets = resolvePath(sourcePath, workingFolder, rootFolder);
  if (targets.length < 1) {
    throw new Error(`No files or folders found at ${sourcePath}`);
  }
  return targets;
}

/**
 * A helper function to resolve the destination path into a single folder descriptor.
 * 
 * @param destinationPath the absolute or relative path to the folder the file will be copied to
 * @param workingFolder the path to use if the destination path is relative
 * @param rootFolder the path to use if the destination path is absolute
 * @returns The resolved destination folder
 * @throws Error if the path is invalid in any way.
 * @throws Error if the path is not a folder
 */
function resolveCopyDestination(
  destinationPath: string,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): FolderDescriptor {
  const destinationDescriptors = resolvePath(destinationPath, workingFolder, rootFolder);
  if (destinationDescriptors.length !== 1) {
    throw new Error(`Path ${destinationPath} is invalid.`);
  }
  const destinationDescriptor = destinationDescriptors[0];
  if (!destinationDescriptor.isFolder) {
    throw new Error(`Path ${destinationPath} is not a folder`);
  }

  return destinationDescriptors[0] as FolderDescriptor;
}
