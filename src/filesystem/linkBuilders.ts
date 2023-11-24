import { type FileDescriptor, type FolderDescriptor } from '../fileDescriptor';
import {
  HardLinkFileDescriptorImpl,
  HardLinkFolderDescriptorImpl,
  type LinkDescriptor,
  SoftLinkFileDescriptorImpl,
  SoftLinkFolderDescriptorImpl,
} from '../fileDescriptor/links';
import { resolvePath } from './pathResolvers';

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
      link = new HardLinkFolderDescriptorImpl(sourceFolder, destinationName, destinationFolder);
    } else {
      link = new SoftLinkFolderDescriptorImpl(sourceFolder, destinationName, destinationFolder, rootFolder);
    }
  } else {
    const sourceFile = source as FileDescriptor;
    if (hardLink) {
      link = new HardLinkFileDescriptorImpl(sourceFile, destinationName, destinationFolder);
    } else {
      link = new SoftLinkFileDescriptorImpl(sourceFile, destinationName, destinationFolder, rootFolder);
    }
  }
  destinationFolder.addContent(link);
}
