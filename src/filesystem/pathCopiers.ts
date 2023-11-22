import { type FileSystemDescriptor, type FolderDescriptor } from '../fileDescriptor';
import { resolvePath } from './pathResolvers';

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

function copyDescriptor(
  target: FileSystemDescriptor,
  destinationName: string | null,
  destinationFolder: FolderDescriptor,
): void {
  const newDescriptor = target.copy();
  destinationName = destinationName ?? target.name;

  for (let i = 1; destinationFolder.findChild(destinationName) != null; i++) {
    destinationName = `${destinationName} (${i})`;
  }
  newDescriptor.name = destinationName;
  destinationFolder.addContent(newDescriptor);
}

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
