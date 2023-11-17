export type FileSystemDescriptorContent = FileSystemDescriptor[] | string;

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
  parent: FileSystemDescriptor | null;

  /**
   * The content of the node, which differs based on the specific type of node.
   */
  content: FileSystemDescriptorContent;
}

export * from './fileDescriptor';
export * from './folderDescriptor';
