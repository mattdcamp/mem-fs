import { type FileContent } from './fileDescriptor';
import { type FolderDescriptor } from './folderDescriptor';

export type FileSystemDescriptorContent = FileSystemDescriptor[] | FileContent;

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
   * The content of the node, which differs based on the specific type of node.
   */
  content: FileSystemDescriptorContent;

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
}

export * from './fileDescriptor';
export * from './folderDescriptor';
