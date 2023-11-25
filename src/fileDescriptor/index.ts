import { type FileContent } from './fileDescriptor';
import { type FolderDescriptor } from './folderDescriptor';

export type FolderContent = FileSystemDescriptor[];

export type FileSystemDescriptorContent = FolderContent | FileContent;

export interface FileSystemDescriptor {
  /**
   * The path from the root of the filesytem to this descriptor.
   */
  readonly path: string;

  /**
   * the name of this descriptor, used to identify the unique path to it.
   */
  name: string;

  /**
   * The node above this node in the file system. Null is allowed for the root node.
   */
  parent: FolderDescriptor | null;

  /**
   * The size of the node's content in bytes.
   */
  readonly size: number;

  /**
   * The date and time this node was created.
   */
  lastModified: Date;

  /**
   * Returns true if this node can have children.
   */
  readonly isFolder: boolean;

  /**
   * Returns true if this node is a link to another node.
   */
  readonly isLink: boolean;

  /**
   * Returns a copy of this descriptor with a null parent.
   */
  copy: () => FileSystemDescriptor;
}

export * from './fileDescriptor';
export * from './folderDescriptor';
