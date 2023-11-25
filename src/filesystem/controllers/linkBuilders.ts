import {
  buildFileHardLink,
  buildFileSoftLink,
  buildFolderHardLink,
  buildFolderSoftLink,
  type LinkDescriptor,
  type FileDescriptor,
  type FolderDescriptor,
} from '../fileDescriptor';

import { resolvePath } from './pathResolvers';

/**
 * Build a {@link LinkDescriptor} to the source path at the destination path. The source's name will be used unless a
 * new name is specified.
 * @param sourcePath the absolute or relative path to the source file or folder
 * @param destinationPath the absolute or relative path to the folder where the link will be created
 * @param newFileName the new name of the file or folder. If null, the original name will be used.
 * @param hardLink if true a {@link ../fileDescriptor/HardLinkDescriptor} will be created.otherwise a
 * {@link ../fileDescriptorSoftLinkDescriptor} will be created. Default is false.
 * @param rootFolder the root folder of the filesystem, required for soft links.
 */
export function buildLink(
  sourcePath: string,
  destinationPath: string,
  newFileName: string | null,
  hardLink: boolean | null,
  workingFolder: FolderDescriptor,
  rootFolder: FolderDescriptor,
): void {
  hardLink = hardLink ?? false;
  const sources = resolvePath(sourcePath, workingFolder, rootFolder);
  if (sources.length !== 1) {
    throw new Error(`Source path ${sourcePath} is invalid.`);
  }
  const source = sources[0];

  const destinationDescriptors = resolvePath(destinationPath, workingFolder, rootFolder);
  if (destinationDescriptors.length !== 1) {
    throw new Error(`Destination path ${destinationPath} is invalid.`);
  }
  const destinationDescriptor = destinationDescriptors[0];

  if (!destinationDescriptor.isFolder) {
    throw new Error(`Destination path ${destinationPath} is not a folder.`);
  }
  const destinationFolder = destinationDescriptor as FolderDescriptor;

  const destinationName = newFileName ?? source.name;
  let link: LinkDescriptor;
  if (source.isFolder) {
    const sourceFolder = source as FolderDescriptor;
    if (hardLink) {
      link = buildFolderHardLink(sourceFolder, destinationName, destinationFolder);
    } else {
      link = buildFolderSoftLink(sourceFolder, destinationName, destinationFolder, rootFolder);
    }
  } else {
    const sourceFile = source as FileDescriptor;
    if (hardLink) {
      link = buildFileHardLink(sourceFile, destinationName, destinationFolder);
    } else {
      link = buildFileSoftLink(sourceFile, destinationName, destinationFolder, rootFolder);
    }
  }
  destinationFolder.addContent(link);
}
