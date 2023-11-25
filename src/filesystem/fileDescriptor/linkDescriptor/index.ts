import { type FileSystemDescriptor } from '..';

/**
 * A descriptor that represents a link to another file or folder. Hard links contain a link to the file or folder
 * meaning that if the link is moved or deleted the link will continue to operate.
 */
export interface HardLinkDescriptor extends FileSystemDescriptor {
  readonly isLink: true;
  readonly isHardLink: true;
}

/**
 * A descriptor that represents a link to another file or folder. Soft links contain the path to the file or folder
 * which is resolved when the link is accessed. If the file or folder is moved or deleted the link will break and will
 * become a dangling link. Accessing methods or properties on a dangling link will throw an error.
 */
export interface SoftLinkDescriptor extends FileSystemDescriptor {
  readonly isLink: true;
  readonly isHardLink: false;
}

/**
 * A descriptor that represents a link to another file or folder.
 */
export interface LinkDescriptor extends FileSystemDescriptor {
  readonly isLink: true;
  readonly isHardLink: boolean;
}

export { buildFileHardLink, buildFileSoftLink } from './linkFileDescriptor';
export { buildFolderHardLink, buildFolderSoftLink } from './linkFolderDescriptor';
