import { type FileSystemDescriptor } from '..';

export interface HardLinkDescriptor extends FileSystemDescriptor {
  readonly isLink: true;
  readonly isHardLink: true;
  link: FileSystemDescriptor;
}

export interface SoftLinkDescriptor extends FileSystemDescriptor {
  readonly isLink: true;
  readonly isHardLink: false;
  link: FileSystemDescriptor;
}

export type LinkDescriptor = HardLinkDescriptor | SoftLinkDescriptor;

export * from './linkFileDescriptor';
export * from './linkFolderDescriptor';
